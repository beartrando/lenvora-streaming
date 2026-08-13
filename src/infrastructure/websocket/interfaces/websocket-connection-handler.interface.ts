import {WebSocket} from "ws";
import {IncomingMessage} from "http";

export interface WebsocketConnectionHandlerInterface {
    handle(ws: WebSocket, req: IncomingMessage): Promise<void>;
}

export default WebsocketConnectionHandlerInterface;
