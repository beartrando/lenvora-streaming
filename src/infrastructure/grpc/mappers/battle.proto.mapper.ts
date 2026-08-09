import * as battleProto from "../../../contracts/proto/battle";
import BattleEntity, {BattleEntityProps} from "../../../domain/battle/battle.entity";
import BoardProtoMapper from "./battle/board.proto.mapper";
import StatusProtoMapper from "./battle/status.proto.mapper";
import Id from "../../../domain/common/value-objects/id.vo";
import PlayerIds from "../../../domain/battle/value-objects/player-ids.vo";

export class BattleProtoMapper {
    static toProto(battle: BattleEntity): battleProto.BattleObject {

        return battleProto.BattleObject.create({
            id: battle.id.value,
            playerIds: battle.playerIds.value.map((id: Id) => id.value),
            board: BoardProtoMapper.toProto(battle.board),
            status: StatusProtoMapper.toProto(battle.status),
            winnerId: battle.winnerId?.value,
            lastMoveAt: battle.lastMoveAt ?? undefined,
        });
    }

    static toDomain(battle: battleProto.BattleObject): BattleEntity {
        const battleEntityProps: BattleEntityProps = {
            id: new Id(battle.id),
            playerIds: new PlayerIds(battle.playerIds.map((id: string) => new Id(id))),
            board: BoardProtoMapper.toDomain(battle.board),
            status: StatusProtoMapper.toDomain(battle.status),
            winnerId: battle.winnerId ? new Id(battle.winnerId) : null,
            lastMoveAt: battle.lastMoveAt,
        };
        return BattleEntity.create(battleEntityProps);
    }
}

export default BattleProtoMapper;
