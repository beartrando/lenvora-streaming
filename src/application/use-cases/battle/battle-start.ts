import type {WebSocket} from "ws";
import * as streamingProto from "../../grpc/generated/streaming";
import * as battleProto from "../../grpc/generated/battle";
import * as engineProto from "../../grpc/generated/engine";
import * as errorProto from "../../grpc/generated/common/error";

import * as battleService from "../../services/battle.service";
import FrontBattleStreamRegistry from "../../infrastructure/websocket/channels/front.battle.stream";
import EngineStream from "../../grpc/channels/engine.stream";

export class BattleStartUseCase {
    constructor(
        private readonly frontBattleStreamRegistry: FrontBattleStreamRegistry,
        private readonly engineStream: EngineStream,
    ) {
    }

    async execute(
        ws: WebSocket,
        jwt: string,
        profileId: string,
        payload: streamingProto.BattleStart,
    ): Promise<void> {
        let resp: battleProto.BattleResponse | null;

        if (payload.battleId) {
            resp = await battleService.join(
                payload.battleId,
                profileId,
                jwt,
            );
        } else {
            resp = await battleService.upsert(
                profileId,
                jwt,
            );
        }

        if (resp?.battle) {
            this.frontBattleStreamRegistry.subscribeBattle(
                ws,
                resp.battle.id,
            );

            try {
                if (resp.battle.status === battleProto.BattleStatus.ACTIVE) {
                    const grpcRequest = engineProto.BattleRequest.create({
                        start: resp.battle,
                    });

                    this.engineStream.write(grpcRequest);
                }

                const message = streamingProto.BattleResponse.create({
                    battle: resp.battle,
                });

                this.frontBattleStreamRegistry.writeBattleStreams(
                    resp.battle.id,
                    message,
                );
            } catch (e) {
                logger.error(String(e));
            }

            return;
        }

        if (resp?.error) {
            const response = streamingProto.BattleResponse.create({
                error: resp.error,
            });

            this.frontBattleStreamRegistry.writeStream(
                ws,
                response,
            );

            return;
        }

        const response = streamingProto.BattleResponse.create({
            error: {
                code: errorProto.ErrorCode.ENTITY_SPECIFIC,
                message: "Battle not found",
            },
        });

        this.frontBattleStreamRegistry.writeStream(
            ws,
            response,
        );
    }
}

export default BattleStartUseCase;
