import {WebSocket} from 'ws';
import logger from "@shared/logger";
import SocketEncoding from "../enums/socket-encoding";
import SocketContext from "../types/socket-context";
import StateStore from "../../state-store/state-stores/state-store";
import ProfileId from "../../../domain/profile/value-objects/profile-id.vo";


class ProfileWebsocketsRegistry {
    constructor(
        private readonly wsSocketContextStateStore: StateStore<WebSocket, SocketContext>,
        private readonly profileWebsocketStore: StateStore<string, WebSocket>,
    ) {
    }

    registerSocket(
        ws: WebSocket,
        profileId: ProfileId,
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

        logger.log('register socket ' + profileId);

        this.wsSocketContextStateStore.set(ws, {
            profileId,
            encoding,
        });

        this.profileWebsocketStore.set(profileId.value, ws);
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

        return context ? true : false;
    }

    getProfileSocket(
        profileId: ProfileId
    ): WebSocket | null {
        logger.log(this.profileWebsocketStore);
        // logger.log(battleId);
        // logger.log(this.profileWebsocketStore.get(battleId.value)?.size);
        return this.profileWebsocketStore.get(profileId.value);
    }


    unregisterSocket(ws: WebSocket): void {
        // this.clearHeartbeat(ws);

        const context = this.wsSocketContextStateStore.get(ws);

        if (!context) {
            return;
        }

        this.profileWebsocketStore.delete(context.profileId.value);

        this.wsSocketContextStateStore.delete(ws);

    }
}

export default ProfileWebsocketsRegistry;
