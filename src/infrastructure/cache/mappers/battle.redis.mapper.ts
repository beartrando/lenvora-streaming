// import BattleEntity, {BattleEntityProps,} from "../../../domain/engine/engine.entity";
//
//
// import BoardMapper from "./engine/board.redis.mapper";
// import StatusMapper from "./engine/status.redis.mapper";
// import Id from "../../../domain/common/value-objects/id.vo";
// import PlayerIds from "../../../domain/engine/value-objects/player-ids.vo";
//
// export interface BattleRedisObject {
//     id: string;
//     playerIds: string[];
//     board: string[];
//     status: string;
//     winnerId: string | null;
//     lastMoveAt: Date | null;
// }
//
// export class BattleRedisMapper {
//
//     static toPersistence(engine: BattleEntity): BattleRedisObject {
//         return {
//             id: engine.id.value,
//             playerIds: engine.playerIds.value.map((id: Id) => id.value),
//             board: BoardMapper.toPersistence(engine.board),
//             status: StatusMapper.toPersistence(engine.status),
//             winnerId: engine.winnerId?.value ?? null,
//             lastMoveAt: engine.lastMoveAt,
//         };
//     }
//
//     static toDomain(engine: BattleRedisObject): BattleEntity {
//         const props: BattleEntityProps = {
//             id: new Id(engine.id),
//             playerIds: new PlayerIds(engine.playerIds.map((id: string) => new Id(id))),
//             board: BoardMapper.toDomain(engine.board),
//             status: StatusMapper.toDomain(engine.status),
//             winnerId: engine.winnerId ? new Id(engine.winnerId) : null,
//             lastMoveAt: engine.lastMoveAt,
//         };
//
//         return BattleEntity.create(props);
//     }
// }
//
// export default BattleRedisMapper;
