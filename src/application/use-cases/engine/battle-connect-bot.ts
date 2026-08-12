import type {WebSocket} from "ws";
import * as streamingProto from "../../../contracts/proto/streaming";
import BattleWebsocketsRegistry from "../../../infrastructure/websocket-server/registers/battle-websockets.registry";
import PgBossManager from "@shared/pg-boss-manager";
// import {messageProducersConfig} from "../../configs/kafka.configs";
import Id from "../../../domain/common/value-objects/id.vo";
import MessageService from "../../../infrastructure/message/service";

export class BattleConnectBotUseCase {
    constructor(
        private readonly battleWebsocketsRegistry: BattleWebsocketsRegistry,
        private readonly messageService: MessageService,
    ) {
    }

    async execute(
        profileId: Id,
        payload: streamingProto.BattleJoinBot,
    ): Promise<void> {
        // const battleId = payload.battleId;
        //
        // const context = this.frontBattleStreamRegistry.getSocketContext(ws);
        //
        // if (!context) {
        //     return;
        // }
        //
        // if (!context.battleIds.has(battleId)) {
        //     return;
        // }
        //
        // const battleIdRequest =
        //     streamingProto.BattleStart.create({battleId});
        //
        // await this.pgBossManager.queue.enqueue(
        //     messageProducersConfig.aiConnectingRequest,
        //     battleIdRequest,
        // );
    }
}

export default BattleConnectBotUseCase;
