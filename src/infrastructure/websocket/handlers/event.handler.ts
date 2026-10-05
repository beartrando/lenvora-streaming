import {WebSocket,} from "ws";
import * as streamingProto from "../../../contracts/proto/streaming";
import WebsocketHandlerInterface from "../interfaces/websocket-handler.interface";
import SessionAccessToken from "../../../domain/session/value-objects/session-access-token.vo";
import ProfileId from "../../../domain/profile/value-objects/profile-id.vo";
import VoiceStreamUseCase from "../../../application/use-cases/voice/voice-stream";
import logger from "@shared/logger";

export class EventHandler implements WebsocketHandlerInterface {
    constructor(
        private readonly voiceStreamUseCase: VoiceStreamUseCase,
    ) {
    }

    async handle(
        ws: WebSocket,
        accessToken: SessionAccessToken,
        profileId: ProfileId,
        payload: streamingProto.EventRequest,
    ): Promise<void> {
        if (payload.audioStart) {
            this.voiceStreamUseCase.start(ws, accessToken, profileId, payload.audioStart);
            return;
        }

        if (payload.audioChunk) {
            this.voiceStreamUseCase.chunk(ws, payload.audioChunk);
            return;
        }

        if (payload.audioStop) {
            this.voiceStreamUseCase.stop(ws);
            return;
        }

        if (payload.ping || payload.empty) {
            return;
        }

        logger.warn("Unhandled event request", payload);
    }
}

export default EventHandler;
