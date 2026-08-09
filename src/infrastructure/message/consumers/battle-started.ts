import * as battleProto from "../../../contracts/proto/battle";
import BattleStartUseCase from "../../../application/use-cases/engine/battle-start";
import BattleProtoMapper from "../../grpc/mappers/battle.proto.mapper";
import logger from "@shared/logger";

export class BattleStartedConsumer {
    constructor(
        private readonly battleStartUseCase: BattleStartUseCase,
    ) {
    }

    async execute(topic: string, partition: number, message: battleProto.BattleObject): Promise<void> {
        try {
            // logger.log('BattleStartedConsumer');
            // logger.log(message);
            const battle = BattleProtoMapper.toDomain(message);
            await this.battleStartUseCase.execute(battle);
        } catch (error) {
            logger.error(`[Kafka] Failed to process message`, {
                rawValue: message.id,
                error,
            });
        }
    }

}

export default BattleStartedConsumer;

