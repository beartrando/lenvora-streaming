import {WebSocket,} from "ws";
import * as streamingProto from "../../../contracts/proto/streaming";
import WebsocketHandlerInterface from "../interfaces/websocket-handler.interface";

import BattleStartUseCase from "../../../application/use-cases/battle/battle-start";
import BattleMoveUseCase from "../../../application/use-cases/battle/battle-move";
import BattleLeaveUseCase from "../../../application/use-cases/battle/battle-leave";
import BattleConnectBotUseCase from "../../../application/use-cases/battle/battle-connect-bot";

import logger from "@shared/logger";
import TimerService from "../../timer/service";
import AccessToken from "../../../domain/common/value-objects/access-token.vo";
import Id from "../../../domain/common/value-objects/id.vo";
import TimerKey from "../../timer/value-objects/timer-key.vo";

export class BattleHandler implements WebsocketHandlerInterface {
    constructor(
        private readonly timerService: TimerService<TimerKey, WebSocket>,
        private readonly startUseCase: BattleStartUseCase,
        private readonly moveUseCase: BattleMoveUseCase,
        private readonly connectBotUseCase: BattleConnectBotUseCase,
        private readonly leaveUseCase: BattleLeaveUseCase,
    ) {
    }

    async handle(ws: WebSocket, accessToken: AccessToken, profileId: Id, payload: streamingProto.BattleRequest): Promise<void> {
        logger.log('battleHandler got event');
        logger.log(payload);

        if (payload.start) {
            this.startHeartbeat(ws);
            const battleId = payload.start.battleId ? new Id(payload.start.battleId) : undefined;
            return this.startUseCase.execute(
                accessToken,
                profileId,
                battleId
            );
        } else if (payload.move) {
            this.startHeartbeat(ws)
            return this.moveUseCase.execute(profileId, payload.move);
        } else if (payload.ping) {
            return;
        } else if (payload.connectBot) {
            return this.connectBotUseCase.execute(profileId, new Id(payload.connectBot.battleId));
        } else if (payload.leave) {
            const battleId = new Id(payload.leave.battleId);
            return this.leaveUseCase.execute(profileId, battleId);
        }

        logger.warn(`⚠️ Unknown payload type:`, payload);
    }

    private startHeartbeat(ws: WebSocket) {
        // this.battleWebsocketsRegistry.getSocketContext(ws);
        //
        // if (empty)
        //
        //     this.timerService.restart()
        //
        // this.clearHeartbeat(ws);
        //
        //
        // const timer = setTimeout(() => {
        //     logger.warn("Heartbeat timeout, cleaning stream");
        //     this.unregisterSocket(ws);
        // }, this.heartbeatTimeoutMs);
        // this.heartbeatTimers.set(ws, timer);
    }


}

export default BattleHandler;


