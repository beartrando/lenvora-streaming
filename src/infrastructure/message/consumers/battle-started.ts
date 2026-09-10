// import * as battleProto from "../../../contracts/proto/battle";
// import BattleCreateUseCase from "../../../application/use-cases/battle/battle-start";
// import BattleProtoMapper from "../../grpc/mappers/engine.proto.mapper";
// import logger from "@shared/logger";
//
// export class BattleCreatedConsumer {
//     constructor(
//         private readonly battleStartUseCase: BattleCreateUseCase,
//     ) {
//     }
//
//     async execute(topic: string, partition: number, message: battleProto.BattleObject): Promise<void> {
//         try {
//             // logger.log('BattleCreatedConsumer');
//             // logger.log(message);
//             const battle = BattleProtoMapper.toDomain(message);
//             await this.battleStartUseCase.execute(battle);
//         } catch (error) {
//             logger.error(`[Kafka] Failed to process message`, {
//                 rawValue: message.id,
//                 error,
//             });
//         }
//     }
//
// }
//
// export default BattleCreatedConsumer;
//
