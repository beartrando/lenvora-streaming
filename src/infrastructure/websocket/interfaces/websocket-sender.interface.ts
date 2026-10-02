import {WebSocket} from "ws";
import SocketEncoding from "../enums/socket-encoding";
import * as streamingProto from "../../../contracts/proto/streaming";

export interface WebsocketSenderInterface {
    writeStream(
        ws: WebSocket,
        streamResponse: streamingProto.EventResponse,
        encoding: SocketEncoding,
    ): void;
}

export default WebsocketSenderInterface;
