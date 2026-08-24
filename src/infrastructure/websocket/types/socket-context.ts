import SocketEncoding from "../enums/socket-encoding";
import Id from "../../../domain/common/value-objects/id.vo";

export type SocketContext = {
    profileId: ProfileId;
    battleIds: Set<Id>;
    encoding: SocketEncoding;
}

export default SocketContext;
