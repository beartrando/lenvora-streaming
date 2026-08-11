import {WebSocket} from "ws";
import SocketEncoding from "../enums/socket-encoding";
import AccessToken from "../../../domain/common/value-objects/access-token.vo";
import Id from "../../../domain/common/value-objects/id.vo";

export interface WebsocketHandlerInterface {
    handle(
        ws: WebSocket,
        jwt: AccessToken,
        profileId: Id,
        payload: streamingProto.BattleRequest,
        encoding: SocketEncoding,
    ): Promise<void>;
}

export default WebsocketHandlerInterface;
