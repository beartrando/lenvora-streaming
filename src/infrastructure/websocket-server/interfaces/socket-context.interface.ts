import SocketEncoding from "../enums/socket-encoding";

export interface SocketContext {
    profileId: string;
    battleIds: Set<string>;
    encoding: SocketEncoding;
}

export default SocketContext;
