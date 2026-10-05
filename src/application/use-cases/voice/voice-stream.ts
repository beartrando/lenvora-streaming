import {WebSocket} from "ws";

import * as streamingProto from "../../../contracts/proto/streaming";
import * as speechToTextProto from "../../../contracts/proto/speech-to-text";
import * as errorProto from "../../../contracts/proto/common/error";
import logger from "@shared/logger";

import SessionAccessToken from "../../../domain/session/value-objects/session-access-token.vo";
import ProfileId from "../../../domain/profile/value-objects/profile-id.vo";

import SpeechToTextClient from "../../../infrastructure/grpc/clients/speech-to-text.client";
import StateStore from "../../../infrastructure/state-store/state-stores/state-store";
import WebsocketSender from "../../../infrastructure/websocket/senders/websocket.sender";
import EventWebsocketsRegistry from "../../../infrastructure/websocket/registers/event-websockets.registry";
import SocketEncoding from "../../../infrastructure/websocket/enums/socket-encoding";

export interface VoiceSession {
    readonly client: SpeechToTextClient;
    readonly profileId: ProfileId;
}

/**
 * Голосовая сессия: связывает WS-подключение со стримом SpeechToText.
 *
 * Поток открывается лениво на audio_start (первое сообщение потока — auth),
 * живёт в рамках WS-сессии и закрывается при её разрыве. Реконнекта нет:
 * потеря потока = потеря голосовой сессии, новый поток авторизуется заново.
 *
 * Транскрипция возвращается клиенту по WS тем же EventResponse-контрактом,
 * что и остальные события.
 */
export class VoiceStreamUseCase {
    constructor(
        private readonly serviceSpeechToTextUrl: string,
        private readonly voiceSessionStore: StateStore<WebSocket, VoiceSession>,
        private readonly websocketSender: WebsocketSender,
        private readonly eventWebsocketsRegistry: EventWebsocketsRegistry,
    ) {
    }

    start(
        ws: WebSocket,
        accessToken: SessionAccessToken,
        profileId: ProfileId,
        start: speechToTextProto.AudioStart,
    ): void {
        let session = this.voiceSessionStore.get(ws);

        if (!session) {
            session = this.openSession(ws, accessToken, profileId);
        }

        session.client.write({start});
    }

    chunk(ws: WebSocket, chunk: speechToTextProto.AudioChunk): void {
        const session = this.voiceSessionStore.get(ws);

        if (!session) {
            this.sendSessionMissing(ws, "audio_start");
            return;
        }

        session.client.write({chunk});
    }

    stop(ws: WebSocket): void {
        const session = this.voiceSessionStore.get(ws);

        if (!session) {
            this.sendSessionMissing(ws, "audio_start");
            return;
        }

        session.client.write({stop: {}});
    }

    /**
     * Закрывает голосовую сессию (вызывается при разрыве WS).
     */
    close(ws: WebSocket): void {
        const session = this.voiceSessionStore.get(ws);

        if (!session) {
            return;
        }

        this.voiceSessionStore.delete(ws);
        session.client.close();
    }

    private openSession(
        ws: WebSocket,
        accessToken: SessionAccessToken,
        profileId: ProfileId,
    ): VoiceSession {
        const client = new SpeechToTextClient(this.serviceSpeechToTextUrl);
        const session: VoiceSession = {client, profileId};

        this.voiceSessionStore.set(ws, session);

        client.open({
            onTranscription: (transcription) =>
                this.send(ws, session, {transcription}),
            onError: (error) =>
                this.send(ws, session, {error}),
            onClosed: () =>
                this.handleClosed(ws, session),
        });

        client.write({
            auth: {
                profileId: profileId.value,
                accessToken: accessToken.value,
            },
        });

        return session;
    }

    private handleClosed(ws: WebSocket, session: VoiceSession): void {
        if (this.voiceSessionStore.get(ws) !== session) {
            return;
        }

        // Ошибки потока уже доставлены клиенту через onError; здесь только
        // освобождаем сессию — следующий audio_start откроет поток заново.
        this.voiceSessionStore.delete(ws);
        logger.log("Voice session closed");
    }

    private send(
        ws: WebSocket,
        session: VoiceSession,
        response: streamingProto.EventResponse,
    ): void {
        if (this.voiceSessionStore.get(ws) !== session) {
            return;
        }

        this.websocketSender.writeStream(ws, response, this.encoding(ws));
    }

    private sendSessionMissing(ws: WebSocket, hint: string): void {
        logger.warn(`Voice stream message received without an active session, expected ${hint} first`);

        this.websocketSender.writeStream(
            ws,
            {
                error: errorProto.ErrorObject.create({
                    code: errorProto.ErrorCode.INVALID_SESSION,
                    details: `Voice session is not started, send ${hint} first`,
                }),
            },
            this.encoding(ws),
        );
    }

    private encoding(ws: WebSocket): SocketEncoding {
        return this.eventWebsocketsRegistry.getSocketContext(ws)?.encoding
            ?? SocketEncoding.PROTOBUF;
    }
}

export default VoiceStreamUseCase;
