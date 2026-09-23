import * as battleProto from "../../../../contracts/proto/battle";
import BattleStatus from "../../../../domain/battle/value-objects/battle-status.vo";
import BattleStatusEnum from "../../../../domain/battle/enums/battle-status.enum";

export class BattleStatusProtoMapper {

    static toProto(
        status: BattleStatus,
    ): battleProto.BattleStatus {
        switch (status.value) {
            case BattleStatusEnum.Created:
                return battleProto.BattleStatus.CREATED;
            case BattleStatusEnum.Matched:
                return battleProto.BattleStatus.MATCHED;
            case BattleStatusEnum.Ready:
                return battleProto.BattleStatus.READY;
            case BattleStatusEnum.Started:
                return battleProto.BattleStatus.STARTED;
            case BattleStatusEnum.Finished:
                return battleProto.BattleStatus.FINISHED;
            case BattleStatusEnum.Cancelled:
                return battleProto.BattleStatus.CANCELLED;
            default:
                return battleProto.BattleStatus.UNKNOWN;
        }
    }

    static toDomain(
        status: battleProto.BattleStatus,
    ): BattleStatus {
        switch (status) {
            case battleProto.BattleStatus.CREATED:
                return new BattleStatus(BattleStatusEnum.Created);
            case battleProto.BattleStatus.MATCHED:
                return new BattleStatus(BattleStatusEnum.Matched);
            case battleProto.BattleStatus.READY:
                return new BattleStatus(BattleStatusEnum.Ready);
            case battleProto.BattleStatus.STARTED:
                return new BattleStatus(BattleStatusEnum.Started);
            case battleProto.BattleStatus.FINISHED:
                return new BattleStatus(BattleStatusEnum.Finished);
            case battleProto.BattleStatus.CANCELLED:
                return new BattleStatus(BattleStatusEnum.Cancelled);
            default:
                return new BattleStatus(BattleStatusEnum.Unknown);
        }
    }
}

export default BattleStatusProtoMapper;
