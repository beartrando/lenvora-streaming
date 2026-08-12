import {WebSocket} from 'ws';
import * as streamingProto from '../../../contracts/proto/streaming';
import logger from "@shared/logger";
import SocketEncoding from "../enums/socket-encoding";
import SocketContext from "../types/socket-context";
import AuthService from "../../auth/service";
import StateStore from "../../state-store/state-stores/state-store";
import Id from "../../../domain/common/value-objects/id.vo";
import BattleLeaveUseCase from "../../../application/use-cases/engine/battle-leave";
import TimerServiceInterface from "../../timer/interfaces/timer-service.interface";


class BattleWebsocketsRegistry {
    constructor(
        // private readonly authService: AuthService,
        // private readonly authorizeProfileUseCase: AuthorizeProfileUseCase,
        private readonly wsSocketContextStateStore: StateStore<WebSocket, SocketContext>,
        private readonly battleWsStateStore: StateStore<Id, Set<WebSocket>>,
        private readonly heartbeatTimers: TimerServiceInterface,
        // private readonly battleLeaveUseCase: BattleLeaveUseCase,
    ) {
    }

    registerSocket(
        ws: WebSocket,
        profileId: Id,
        encoding: SocketEncoding
    ) {
        const context = this.wsSocketContextStateStore.get(ws);

        if (context) {
            if (context.profileId !== profileId) {
                throw new Error(
                    `Broken socket context: expected profileId=${context.profileId}, got=${profileId}`,
                );
            }
            return;
        }

        this.wsSocketContextStateStore.set(ws, {
            profileId,
            battleIds: new Set(),
            encoding,
        });

        ws.on("close", () => {
            logger.info("Close stream");
            this.unregisterSocket(ws);
        });

        ws.on("error", (err) => {
            logger.error("Stream error:", err);
            this.unregisterSocket(ws);
        });
    }

    getSocketContext(ws: WebSocket): SocketContext | undefined {
        const context = this.wsSocketContextStateStore.get(ws);

        if (!context) {
            logger.warn("Socket is not registered");
            return undefined;
        }

        return context;
    }

    hasSubscriptions(ws: WebSocket): boolean {
        const context = this.getSocketContext(ws);

        return context ? context.battleIds.size > 0 : false;
    }

    getBattleSockets(
        battleId: Id
    ): Set<WebSocket> | null {
        return this.battleWsStateStore.get(battleId);
    }


    unregisterSocket(ws: WebSocket): void {
        // this.clearHeartbeat(ws);

        const context = this.wsSocketContextStateStore.get(ws);

        if (!context) {
            return;
        }

        for (const battleId of [...context.battleIds]) {
            this.unsubscribeBattle(ws, battleId);
        }

        this.wsSocketContextStateStore.delete(ws);
    }

    subscribeBattle(
        ws: WebSocket,
        battleId: Id,
    ) {
        const context = this.getSocketContext(ws);

        if (!context) {
            logger.warn(`Unable to subscribe socket to battle ${battleId}: socket is not registered`);
            return;
        }

        context.battleIds.add(battleId);

        let sockets = this.battleWsStateStore.get(battleId);

        if (!sockets) {
            sockets = new Set<WebSocket>();
            this.battleWsStateStore.set(battleId, sockets);
        }

        sockets.add(ws);
    }

    unsubscribeBattle(
        ws: WebSocket,
        battleId: Id,
    ) {
        const context = this.getSocketContext(ws);

        if (!context) {
            logger.warn(
                `unsubscribeBattle: socket is not registered (battleId=${battleId})`,
            );
            return;
        }

        context.battleIds.delete(battleId);

        const sockets = this.getBattleSockets(battleId);

        if (!sockets) {
            return;
        }

        sockets.delete(ws);

        if (sockets.size === 0) {
            this.battleWsStateStore.delete(battleId);
        }
    }
}

export default BattleWebsocketsRegistry;
