import {WebSocket} from 'ws';
import * as streamingProto from '../../grpc/generated/streaming';
import logger from "@shared/logger";
import config from "../../config/config";

export enum SocketEncoding {
    PLAIN = "plain",
    PROTOBUF = "protobuf",
}

interface SocketContext {
    profileId: string;
    battleIds: Set<string>;
    encoding: SocketEncoding;
}

class FrontBattleStreamRegistry {
    private socketContext = new Map<WebSocket, SocketContext>();
    private battleSockets = new Map<string, Set<WebSocket>>();
    private heartbeatTimers = new Map<WebSocket, NodeJS.Timeout>();
    private heartbeatTimeoutMs = config.heartbeatTimeout * 1000;

    getSocketContext(ws: WebSocket): SocketContext | undefined {
        const context = this.socketContext.get(ws);

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
        battleId: string
    ): Set<WebSocket> | undefined {
        return this.battleSockets.get(battleId);
    }

    registerSocket(
        ws: WebSocket,
        profileId: string,
        encoding: SocketEncoding
    ) {
        const context = this.socketContext.get(ws);

        if (context) {
            if (context.profileId !== profileId) {
                throw new Error(
                    `Broken socket context: expected profileId=${context.profileId}, got=${profileId}`,
                );
            }
            return;
        }

        this.socketContext.set(ws, {
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

        ws.on("message", () => this.resetHeartbeat(ws));

        this.resetHeartbeat(ws);
    }

    unregisterSocket(ws: WebSocket): void {
        this.clearHeartbeat(ws);

        const context = this.socketContext.get(ws);

        if (!context) {
            return;
        }

        for (const battleId of [...context.battleIds]) {
            this.unsubscribeBattle(ws, battleId);
        }

        this.socketContext.delete(ws);
    }

    subscribeBattle(
        ws: WebSocket,
        battleId: string,
    ) {
        const context = this.getSocketContext(ws);

        if (!context) {
            logger.warn(`Unable to subscribe socket to battle ${battleId}: socket is not registered`);
            return;
        }

        context.battleIds.add(battleId);

        let sockets = this.battleSockets.get(battleId);

        if (!sockets) {
            sockets = new Set<WebSocket>();
            this.battleSockets.set(battleId, sockets);
        }

        sockets.add(ws);
    }

    unsubscribeBattle(
        ws: WebSocket,
        battleId: string,
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
            this.battleSockets.delete(battleId);
        }
    }

    writeBattleStreams(battleId: string, streamRequest: streamingProto.BattleResponse) {
        const sockets = this.getBattleSockets(battleId);
        if (!sockets) {
            return;
        }

        for (const socket of sockets) {
            this.writeStream(socket, streamRequest);
        }
    }

    writeStream(ws: WebSocket, streamRequest: streamingProto.BattleResponse) {
        // logger.log("new websocket channel message:", streamRequest);

        const encoding =
            this.getSocketContext(ws)?.encoding ?? SocketEncoding.PROTOBUF;

        const buffer =
            encoding === SocketEncoding.PROTOBUF
                ? streamingProto.BattleResponse.encode(streamRequest).finish()
                : JSON.stringify(streamRequest);

        if (ws.readyState === WebSocket.OPEN) {
            ws.send(buffer);
        }
    }

    private resetHeartbeat(ws: WebSocket) {
        this.clearHeartbeat(ws);
        const timer = setTimeout(() => {
            logger.warn("Heartbeat timeout, cleaning stream");
            this.unregisterSocket(ws);
        }, this.heartbeatTimeoutMs);
        this.heartbeatTimers.set(ws, timer);
    }

    private clearHeartbeat(ws: WebSocket) {
        const timer = this.heartbeatTimers.get(ws);
        if (timer) {
            clearTimeout(timer);
            this.heartbeatTimers.delete(ws);
        }
    }
}

const frontBattleStreamRegistry = new FrontBattleStreamRegistry();

export default frontBattleStreamRegistry;



