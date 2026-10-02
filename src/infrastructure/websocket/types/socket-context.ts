import SocketEncoding from "../enums/socket-encoding";
import ProfileId from "../../../domain/profile/value-objects/profile-id.vo";

export type SocketContext = {
    profileId: ProfileId;
    encoding: SocketEncoding;
}

export default SocketContext;
