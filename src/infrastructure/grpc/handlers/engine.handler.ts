import * as grpc from '@grpc/grpc-js';
import * as engineProto from '../../../contracts/proto/engine';
import * as emptyProto from '../../../contracts/proto/common/empty';
import logger from "@shared/logger";
import BattleEntity from "../../../domain/battle/battle.entity";
import BattleStartedUseCase from "../../../application/use-cases/battle/battle-started";
import BattleUpdatedUseCase from "../../../application/use-cases/battle/battle-updated";
import BattleFinishedUseCase from "../../../application/use-cases/battle/battle-finished";


export class EngineHandler {
    constructor(
        private readonly battleStartedUseCase: BattleStartedUseCase,
        private readonly battleUpdatedUseCase: BattleUpdatedUseCase,
        private readonly battleFinishedUseCase: BattleFinishedUseCase,
    ) {
    }

    async battleChannel(
        call: grpc.ServerDuplexStream<engineProto.BattleRequest, engineProto.BattleResponse>
    ) {
        try {
            // слушаем входящие события от Streaming
            call.on("data", async (event: engineProto.BattleRequest) => {
                try {
                    if (event.start) {
                        const battleEntity: BattleEntity = BattleProtoMapper.toDomain(event.start);

                        // logger.log(battleObj);
                        const battle = BattleProtoMapper.toProto(await this.battleStartUseCase.execute(battleEntity));
                        if (battle) {
                            call.write(engineProto.BattleResponse.create({battle}));
                        }

                    }

                    if (event.move) {
                        const battleMove = BattleMoveRedisMapper.toDomain(event.move);

                        const battleEntity = await this.battleMoveUseCase.execute(battleMove);

                        if (battleEntity) {
                            const battle = BattleProtoMapper.toProto(battleEntity);
                            // logger.log(engine);
                            call.write(engineProto.BattleResponse.create({battle}));
                        }
                    }

                    if (event.leave) {
                        const battleLeave = BattleLeaveRedisMapper.toDomain(event.leave);

                        await this.battleLeaveUseCase.execute(battleLeave);
                    }

                    if (event.ping) {
                        // logger.info('Streaming-engine stream Ping');
                        const ping = emptyProto.Empty.create({});
                        call.write(engineProto.BattleResponse.create({ping}));

                        // heartbeat — можно просто игнорировать или логировать
                    }
                } catch (err: any) {
                    console.error("Event error:", err);
                }
            });

            call.on("end", () => {
                call.end();
            });

            call.on("error", (err) => {
                console.error("Stream error:", err);
                call.end();
            });

            logger.log('Grpc streaming connection established');
        } catch (err: any) {
            console.error("battleChannel error:", err);
            // callbackError(callback, err);
            call.end();
        }
    }
}

export default EngineHandler;


