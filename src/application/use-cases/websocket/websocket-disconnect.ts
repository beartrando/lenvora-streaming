import {WebSocket} from "ws";
import EventWebsocketsRegistry from "../../../infrastructure/websocket/registers/event-websockets.registry";
import VoiceStreamUseCase from "../voice/voice-stream";

export class WebsocketDisconnectUseCase {
    constructor(
        private readonly evemtWebsocketsRegistry: EventWebsocketsRegistry,
        private readonly voiceStreamUseCase: VoiceStreamUseCase,
    ) {
    }

    async execute(ws: WebSocket): Promise<void> {

        this.voiceStreamUseCase.close(ws);

        const context = this.evemtWebsocketsRegistry.getSocketContext(ws);

        if (!context) {
            return;
        }

        if (ws.readyState === WebSocket.OPEN) {
            ws.close();
        }
    }
}

export default WebsocketDisconnectUseCase;
