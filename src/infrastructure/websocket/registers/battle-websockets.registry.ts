import {WebSocket} from 'ws';
import logger from "@shared/logger";
import SocketEncoding from "../enums/socket-encoding";
import SocketContext from "../types/socket-context";
import StateStore from "../../state-store/state-stores/state-store";
import Id from "../../../domain/common/value-objects/id.vo";
import TimerServiceInterface from "../../timer/interfaces/timer-service.interface";
import BattleLeaveData from "../../timer/value-objects/battle-leave-data.vo";


class BattleWebsocketsRegistry {
    constructor(
        private readonly wsSocketContextStateStore: StateStore<WebSocket, SocketContext>,
        private readonly battleWsStateStore: StateStore<string, Set<WebSocket>>,
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
    }

    getSocketContext(ws: WebSocket): SocketContext | undefined {
        const context = this.wsSocketContextStateStore.get(ws);


        if (!context) {
            logger.warn("Socket is not registered");
            return undefined;
        }
        // logger.log(new Error().stack);

        return context;
    }

    hasSubscriptions(ws: WebSocket): boolean {
        const context = this.getSocketContext(ws);

        return context ? context.battleIds.size > 0 : false;
    }

    getBattleSockets(
        battleId: Id
    ): Set<WebSocket> | null {
        // logger.log(this.battleWsStateStore);
        // logger.log(battleId);
        // logger.log(this.battleWsStateStore.get(battleId.value)?.size);
        return this.battleWsStateStore.get(battleId.value);
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
        // logger.log(battleId);
        if (!context) {
            logger.warn(`Unable to subscribe socket to battle ${battleId}: socket is not registered`);
            return;
        }

        context.battleIds.add(battleId);

        let sockets = this.battleWsStateStore.get(battleId.value);

        if (!sockets) {
            sockets = new Set<WebSocket>();
            this.battleWsStateStore.set(battleId.value, sockets);
        }

        sockets.add(ws);
    }

    unsubscribeBattle(
        ws: WebSocket,
        battleId: Id,
    ) {
        const context = this.getSocketContext(ws);

        if (!context) {
            logger.warn(`unsubscribeBattle: socket is not registered (battleId=${battleId})`,);
            return;
        }

        context.battleIds.delete(battleId);

        const sockets = this.getBattleSockets(battleId);

        if (!sockets) {
            return;
        }

        sockets.delete(ws);

        if (sockets.size === 0) {
            this.battleWsStateStore.delete(battleId.value);
        }
    }
}

export default BattleWebsocketsRegistry;
