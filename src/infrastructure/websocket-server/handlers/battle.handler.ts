import type {WebSocket} from "ws";
import * as streamingProto from "../../grpc/generated/streaming";
import WebsocketHandler from "../interfaces/websocket-handler.interface";

import BattleStartUseCase from "../../../application/use-cases/battle/battle-start";
import BattleMoveUseCase from "../../../application/use-cases/battle/battle-move";
import BattleLeaveUseCase from "../../../application/use-cases/battle/battle-leave";
import BattleConnectBotUseCase from "../../../application/use-cases/battle/battle-connect-bot";
import BattlePingUseCase from "../../../application/use-cases/battle/battle-ping";

import logger from "@shared/logger";

export class BattleHandler implements WebsocketHandler {
    constructor(
        private readonly start: BattleStartUseCase,
        private readonly move: BattleMoveUseCase,
        private readonly ping: BattlePingUseCase,
        private readonly connectBot: BattleConnectBotUseCase,
        private readonly leave: BattleLeaveUseCase,
    ) {
    }

    async handle(ws: WebSocket, jwt: string, profileId: string, payload: streamingProto.BattleRequest): Promise<void> {
        logger.log('battleHandler got event');
        logger.log(payload);

        if (payload.start) {
            return this.start.execute(ws, jwt, profileId, payload.start);
        } else if (payload.move) {
            return this.move.execute(ws, profileId, payload.move);
        } else if (payload.ping) {
            return this.ping.execute(ws);
        } else if (payload.connectBot) {
            return this.connectBot.execute(ws, profileId, payload.connectBot);
        } else if (payload.leave) {
            return this.leave.execute(ws, profileId, payload.leave);
        }

        logger.warn(`⚠️ Unknown payload type:`, payload);
    }
}

export default BattleHandler;


