import type {WebSocket} from "ws";
import * as streamingProto from "../../grpc/generated/streaming";
import FrontBattleStreamRegistry from "../../infrastructure/websocket/channels/front.battle.stream";
import PgBossManager from "@shared/pg-boss-manager";
import {messageProducersConfig} from "../../configs/kafka.configs";

export class BattleConnectBotUseCase {
    constructor(
        private readonly frontBattleStreamRegistry: FrontBattleStreamRegistry,
        private readonly pgBossManager: PgBossManager,
    ) {
    }

    async execute(
        ws: WebSocket,
        profileId: string,
        payload: streamingProto.BattleJoinBot,
    ): Promise<void> {
        const battleId = payload.battleId;

        const context = this.frontBattleStreamRegistry.getSocketContext(ws);

        if (!context) {
            return;
        }

        if (!context.battleIds.has(battleId)) {
            return;
        }

        const battleIdRequest =
            streamingProto.BattleStart.create({battleId});

        await this.pgBossManager.queue.enqueue(
            messageProducersConfig.aiConnectingRequest,
            battleIdRequest,
        );
    }
}

export default BattleConnectBotUseCase;
