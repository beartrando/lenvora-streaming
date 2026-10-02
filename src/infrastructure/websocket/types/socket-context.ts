import SocketEncoding from "../enums/socket-encoding";
import ProfileId from "../../../domain/profile/value-objects/profile-id.vo";
import BattleId from "../../../domain/battle/value-objects/battle-id.vo";

export type SocketContext = {
    profileId: ProfileId;
    encoding: SocketEncoding;
}

export default SocketContext;
