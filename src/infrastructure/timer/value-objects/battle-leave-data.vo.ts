import Id from "../../../domain/common/value-objects/id.vo";

export class BattleLeaveData {
    constructor(
        readonly battleId: Id,
        readonly profileId: Id,
    ) {
    }
}

export default BattleLeaveData;
