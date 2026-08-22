import type {WebSocket} from "ws";
import BattleWebsocketsRegistry from "../../../infrastructure/websocket/registers/battle-websockets.registry";
import BattleLeaveUseCase from "../battle/battle-leave";

export class WebsocketDisconnectUseCase {
    constructor(
        private readonly battleWebsocketsRegistry: BattleWebsocketsRegistry,
        private readonly battleLeaveUseCase: BattleLeaveUseCase,
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
            this.battleWebsocketsRegistry.unregisterSocket(ws);
        }
    }
}

export default WebsocketDisconnectUseCase;
