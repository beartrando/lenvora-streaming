import {WebSocket} from "ws";
import EventWebsocketsRegistry from "../../../infrastructure/websocket/registers/event-websockets.registry";

export class WebsocketDisconnectUseCase {
    constructor(
        private readonly evemtWebsocketsRegistry: EventWebsocketsRegistry,
    ) {
    }

    async execute(ws: WebSocket): Promise<void> {

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
