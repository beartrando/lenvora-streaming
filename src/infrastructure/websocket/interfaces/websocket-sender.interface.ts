import {WebSocket} from "ws";
import SocketEncoding from "../enums/socket-encoding";
import * as streamingProto from "../../../contracts/proto/streaming";

export interface WebsocketSenderInterface {
    writeStream(
        ws: WebSocket,
        streamResponse: streamingProto.BattleResponse,
        encoding: SocketEncoding = SocketEncoding.PROTOBUF
    );
}

export default WebsocketSenderInterface;
