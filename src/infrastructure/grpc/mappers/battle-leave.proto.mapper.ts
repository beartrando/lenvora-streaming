import * as engineProto from "../../../contracts/proto/engine";
import Id from "../../../domain/common/value-objects/id.vo";
import BattleLeave from "../../../domain/battle/value-objects/battle-leave.vo";

export class BattleLeaveProtoMapper {
    static toProto(move: BattleLeave): engineProto.BattleLeave {
        return engineProto.BattleLeave.create({
            battleId: move.battleId.value,
            profileId: move.profileId.value,
        });
    }

    static toDomain(move: engineProto.BattleLeave): BattleLeave {
        return BattleLeave.create({
            battleId: new Id(move.battleId),
            profileId: new Id(move.profileId),
        });
    }
}

export default BattleLeaveProtoMapper;
