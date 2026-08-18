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
import BattleLeaveData from "../../timer/value-objects/battle-leave-data.vo";

export class BattleHandler implements WebsocketHandlerInterface {
    constructor(
        private readonly timerService: TimerService<WebSocket, BattleLeaveData>,
        private readonly startUseCase: BattleStartUseCase,
        private readonly moveUseCase: BattleMoveUseCase,
        private readonly connectBotUseCase: BattleConnectBotUseCase,
        private readonly leaveUseCase: BattleLeaveUseCase,
    ) {
    }

    async handle(ws: WebSocket, accessToken: AccessToken, profileId: Id, payload: streamingProto.BattleRequest): Promise<void> {
        // logger.log('battleHandler got event');
        // logger.log(payload);

        try {
            if (payload.start) {
                const battleId = payload.start.battleId ? new Id(payload.start.battleId) : undefined;
                return this.startUseCase.execute(
                    ws,
                    accessToken,
                    profileId,
                    battleId
                );
            } else if (payload.move) {
                this.startHeartbeat(ws, profileId, new Id(payload.move.battleId))
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
        } catch (e) {
            logger.error(`⚠️ error:`, e);
        }
    }

    private startHeartbeat(ws: WebSocket, battleId: Id, profileId: Id) {
        const battleLeaveData = new BattleLeaveData(battleId, profileId);
        this.timerService.restart(ws, battleLeaveData);
    }


}

export default BattleHandler;


