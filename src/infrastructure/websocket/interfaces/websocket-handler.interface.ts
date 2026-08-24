import {WebSocket} from "ws";
import SocketEncoding from "../enums/socket-encoding";
import SessionAccessToken from "../../../domain/session/value-objects/session-access-token.vo";
import * as streamingProto from "../../../contracts/proto/streaming";
import ProfileId from "../../../domain/profile/value-objects/profile-id.vo";

export interface WebsocketHandlerInterface {
    handle(
        ws: WebSocket,
        jwt: SessionAccessToken,
        profileId: ProfileId,
        payload: streamingProto.BattleRequest,
        encoding: SocketEncoding,
    ): Promise<void>;
}

export default WebsocketHandlerInterface;
