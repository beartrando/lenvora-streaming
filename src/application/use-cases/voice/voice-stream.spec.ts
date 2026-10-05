import {WebSocket} from 'ws';

import VoiceStreamUseCase, {VoiceSession} from './voice-stream';
import SpeechToTextClient from '../../../infrastructure/grpc/clients/speech-to-text.client';
import StateStore from '../../../infrastructure/state-store/state-stores/state-store';
import WebsocketSender from '../../../infrastructure/websocket/senders/websocket.sender';
import EventWebsocketsRegistry from '../../../infrastructure/websocket/registers/event-websockets.registry';
import SocketEncoding from '../../../infrastructure/websocket/enums/socket-encoding';
import SessionAccessToken from '../../../domain/session/value-objects/session-access-token.vo';
import ProfileId from '../../../domain/profile/value-objects/profile-id.vo';
import * as errorProto from '../../../contracts/proto/common/error';

jest.mock('../../../infrastructure/grpc/clients/speech-to-text.client');

const SpeechToTextClientMock = SpeechToTextClient as jest.MockedClass<typeof SpeechToTextClient>;

type StreamHandlers = Parameters<SpeechToTextClient['open']>[0];

describe('VoiceStreamUseCase', () => {
    let useCase: VoiceStreamUseCase;
    let sessionStore: StateStore<WebSocket, VoiceSession>;
    let websocketSender: { writeStream: jest.Mock };
    let registry: { getSocketContext: jest.Mock };

    let ws: WebSocket;
    const accessToken = new SessionAccessToken('jwt-token');
    const profileId = new ProfileId('profile-1');
    const audioStart = {mimeType: 'audio/webm', languageCode: 'ru'};

    const mockedClient = () => SpeechToTextClientMock.mock.instances.at(-1) as unknown as {
        open: jest.Mock;
        write: jest.Mock;
        close: jest.Mock;
    };

    const streamHandlers = (): StreamHandlers =>
        mockedClient().open.mock.calls[0][0] as StreamHandlers;

    beforeEach(() => {
        jest.clearAllMocks();

        sessionStore = new StateStore<WebSocket, VoiceSession>();
        websocketSender = {writeStream: jest.fn()};
        registry = {
            getSocketContext: jest.fn().mockReturnValue({
                profileId: profileId.value,
                encoding: SocketEncoding.PROTOBUF,
            }),
        };

        useCase = new VoiceStreamUseCase(
            'speech-to-text:50051',
            sessionStore,
            websocketSender as unknown as WebsocketSender,
            registry as unknown as EventWebsocketsRegistry,
        );

        ws = {} as WebSocket;
    });

    it('opens a stream on start and sends auth before audio_start', () => {
        useCase.start(ws, accessToken, profileId, audioStart);

        const client = mockedClient();
        expect(client.open).toHaveBeenCalledTimes(1);
        expect(client.write).toHaveBeenNthCalledWith(1, {
            auth: {profileId: 'profile-1', accessToken: 'jwt-token'},
        });
        expect(client.write).toHaveBeenNthCalledWith(2, {start: audioStart});
    });

    it('reuses an open stream for repeated start', () => {
        useCase.start(ws, accessToken, profileId, audioStart);
        useCase.start(ws, accessToken, profileId, audioStart);

        expect(SpeechToTextClientMock).toHaveBeenCalledTimes(1);
        expect(mockedClient().open).toHaveBeenCalledTimes(1);
        expect(mockedClient().write).toHaveBeenCalledTimes(3);
    });

    it('forwards chunks to the open stream', () => {
        useCase.start(ws, accessToken, profileId, audioStart);
        mockedClient().write.mockClear();

        const chunk = {data: new Uint8Array([1, 2, 3])};
        useCase.chunk(ws, chunk);

        expect(mockedClient().write).toHaveBeenCalledWith({chunk});
        expect(websocketSender.writeStream).not.toHaveBeenCalled();
    });

    it('answers INVALID_SESSION when a chunk arrives without audio_start', () => {
        useCase.chunk(ws, {data: new Uint8Array([1])});

        expect(SpeechToTextClientMock).not.toHaveBeenCalled();
        expect(websocketSender.writeStream).toHaveBeenCalledWith(
            ws,
            {error: expect.objectContaining({code: errorProto.ErrorCode.INVALID_SESSION})},
            SocketEncoding.PROTOBUF,
        );
    });

    it('answers INVALID_SESSION when stop arrives without audio_start', () => {
        useCase.stop(ws);

        expect(websocketSender.writeStream).toHaveBeenCalledWith(
            ws,
            {error: expect.objectContaining({code: errorProto.ErrorCode.INVALID_SESSION})},
            SocketEncoding.PROTOBUF,
        );
    });

    it('forwards stop to the open stream', () => {
        useCase.start(ws, accessToken, profileId, audioStart);
        mockedClient().write.mockClear();

        useCase.stop(ws);

        expect(mockedClient().write).toHaveBeenCalledWith({stop: {}});
    });

    it('delivers transcription back to the same websocket', () => {
        useCase.start(ws, accessToken, profileId, audioStart);

        streamHandlers().onTranscription({
            id: 'transcription-1',
            profileId: 'profile-1',
            text: 'hello world',
            languageCode: 'ru',
            confidence: 0.8,
            createdAt: '2026-10-05T00:00:00.000Z',
        });

        expect(websocketSender.writeStream).toHaveBeenCalledWith(
            ws,
            {transcription: expect.objectContaining({text: 'hello world'})},
            SocketEncoding.PROTOBUF,
        );
    });

    it('delivers stream errors back to the same websocket', () => {
        useCase.start(ws, accessToken, profileId, audioStart);

        streamHandlers().onError({
            code: errorProto.ErrorCode.INVALID_AUTHORIZATION,
            details: 'bad token',
        });

        expect(websocketSender.writeStream).toHaveBeenCalledWith(
            ws,
            {error: expect.objectContaining({code: errorProto.ErrorCode.INVALID_AUTHORIZATION})},
            SocketEncoding.PROTOBUF,
        );
    });

    it('drops the session silently when the transport closes', () => {
        useCase.start(ws, accessToken, profileId, audioStart);

        streamHandlers().onClosed();

        expect(sessionStore.get(ws)).toBeNull();
        expect(websocketSender.writeStream).not.toHaveBeenCalled();
    });

    it('closes the stream on websocket disconnect', () => {
        useCase.start(ws, accessToken, profileId, audioStart);
        const client = mockedClient();

        useCase.close(ws);
        useCase.close(ws);

        expect(client.close).toHaveBeenCalledTimes(1);
        expect(sessionStore.get(ws)).toBeNull();

        useCase.chunk(ws, {data: new Uint8Array([1])});
        expect(websocketSender.writeStream).toHaveBeenCalledWith(
            ws,
            {error: expect.objectContaining({code: errorProto.ErrorCode.INVALID_SESSION})},
            SocketEncoding.PROTOBUF,
        );
    });
});
