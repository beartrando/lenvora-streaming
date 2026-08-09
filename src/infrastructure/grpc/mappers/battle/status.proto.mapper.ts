import * as battleProto from "../../../../contracts/proto/battle";
import Status from "../../../../domain/battle/value-objects/status.vo";
import StatusEnum from "../../../../domain/battle/enums/status.enum";

export class StatusProtoMapper {

    static toProto(
        status: Status,
    ): battleProto.BattleStatus {
        switch (status.value) {
            case StatusEnum.New:
                return battleProto.BattleStatus.NEW;
            case StatusEnum.Active:
                return battleProto.BattleStatus.ACTIVE;
            case StatusEnum.Finished:
                return battleProto.BattleStatus.FINISHED;
            default:
                return battleProto.BattleStatus.UNKNOWN;
        }
    }

    static toDomain(
        status: battleProto.BattleStatus,
    ): Status {
        switch (status) {
            case battleProto.BattleStatus.NEW:
                return new Status(StatusEnum.New);
            case battleProto.BattleStatus.ACTIVE:
                return new Status(StatusEnum.Active);
            case battleProto.BattleStatus.FINISHED:
                return new Status(StatusEnum.Finished);
            default:
                return new Status(StatusEnum.Unknown);
        }
    }
}

export default StatusProtoMapper;
