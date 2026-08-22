import type {WebSocket} from "ws";
import BattleWebsocketsRegistry from "../../../infrastructure/websocket/registers/battle-websockets.registry";
import BattleLeaveUseCase from "../battle/battle-leave";
import TimerService from "../../../infrastructure/timer/service";
import logger from "@shared/logger";

export class WebsocketDisconnectUseCase {
    constructor(
        private readonly battleWebsocketsRegistry: BattleWebsocketsRegistry,
        private readonly battleLeaveUseCase: BattleLeaveUseCase,
        private readonly timerService: TimerService<WebSocket>,
    ) {
    }

    async execute(ws: WebSocket): Promise<void> {
        const context = this.battleWebsocketsRegistry.getSocketContext(ws);

        if (!context) {
            return;
        }

        try {
            await Promise.allSettled(
                [...context.battleIds].map(battleId => this.battleLeaveUseCase.execute(context.profileId, battleId))
            );
        } finally {
            this.timerService.stop(ws);
            this.battleWebsocketsRegistry.unregisterSocket(ws);
        }
    }
}

export default WebsocketDisconnectUseCase;
