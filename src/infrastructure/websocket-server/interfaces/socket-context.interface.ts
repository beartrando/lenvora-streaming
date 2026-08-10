import {SocketEncoding} from "../../websocket-server-bkp/channels/front.battle.stream";

export interface SocketContext {
    profileId: string;
    battleIds: Set<string>;
    encoding: SocketEncoding;
}

export default SocketContext;
