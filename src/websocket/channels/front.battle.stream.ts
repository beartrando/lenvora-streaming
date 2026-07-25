import {WebSocket} from 'ws';
import * as streamingGrpc from '../../grpc/generated/streaming';
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

    private getSocketContext(ws: WebSocket): SocketContext {
        const context = this.socketContext.get(ws);

        if (!context) {
            throw new Error("Socket is not registered");
        }

        return context;
    }

    private getBattleSockets(
        battleId: string
    ): Set<WebSocket> | undefined {
        return this.battleSockets.get(battleId);
    }

    registerSocket(
        ws: WebSocket,
        profileId: string,
        encoding: SocketEncoding = SocketEncoding.PROTOBUF,
    ) {
        if (this.socketContext.has(ws)) {
            const context = this.getSocketContext(ws);
            if (context.profileId != profileId) {
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

        const context = this.getSocketContext(ws);

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

        context.battleIds.add(battleId);

        if (!this.battleSockets.has(battleId)) {
            this.battleSockets.set(battleId, new Set());
        }

        this.battleSockets.get(battleId).add(ws);
    }

    unsubscribeBattle(
        ws: WebSocket,
        battleId: string,
    ) {
        const context = this.getSocketContext(ws);

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

    writeBattleStreams(battleId: string, streamRequest: streamingGrpc.BattleStreamResponse) {
        const sockets = this.getBattleSockets(battleId);
        if (!sockets) return;

        for (const socket of sockets) {
            this.writeStream(socket, streamRequest);
        }
    }

    writeStream(ws: WebSocket, streamRequest: streamingGrpc.BattleStreamResponse) {
        logger.log('new websocket channel message: ', streamRequest);
        const {encoding} = this.getSocketContext(ws);

        const buffer =
            encoding === SocketEncoding.PROTOBUF
                ? streamingGrpc.BattleStreamResponse.encode(streamRequest).finish()
                : JSON.stringify(streamRequest);

        if (buffer) {
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



