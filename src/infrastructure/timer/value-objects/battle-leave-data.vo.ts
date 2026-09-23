import BattleId from "../../../domain/battle/value-objects/battle-id.vo";
import ProfileId from "../../../domain/profile/value-objects/profile-id.vo";

export class BattleLeaveData {
    constructor(
        readonly battleId: BattleId,
        readonly profileId: ProfileId,
    ) {
    }
}

export default BattleLeaveData;
