import {WebSocket} from 'ws';
import * as streamingGrpc from '../../grpc/generated/streaming';
import logger from "@shared/logger";
import engineStream from "../../grpc/channels/engine.stream";
import * as engineGrpc from "../../grpc/generated/engine";
import * as battleGrpc from "../../grpc/generated/battle";
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
    private socketContext =
        new Map<WebSocket, SocketContext>();

    private battleSockets = new Map<string, Set<WebSocket>>();

    private heartbeatTimers = new Map<
        WebSocket,
        NodeJS.Timeout
    >();

    private heartbeatTimeoutMs = config.heartbeatTimeout*1000;

    getSocketContext(ws: WebSocket): SocketContext {
        const context = this.socketContext.get(ws);

        if (!context) {
            throw new Error("Socket context not found");
        }

        return context;
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
            this.deleteBattleStream(ws);
        });

        ws.on("error", (err) => {
            logger.error("Stream error:", err);
            this.deleteBattleStream(ws);
        });

        ws.on("message", () => this.resetHeartbeat(ws));

        this.resetHeartbeat(ws);
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

        this.getBattleStreams(battleId).add(ws);
    }

    unsubscribeBattle(
        ws: WebSocket,
        battleId: string,
    ) {
        const context = this.getSocketContext(ws);

        context.battleIds.delete(battleId);

        const sockets = this.getBattleStreams(battleId);

        if (!sockets) {
            return;
        }

        sockets.delete(ws);

        if (sockets.size === 0) {
            this.battleSockets.delete(battleId);
        }
    }

    unRegisterSocket(ws: WebSocket): void {
        this.clearHeartbeat(ws);

        const context = this.getSocketContext(ws);

        for (const battleId of context.battleIds) {
            const sockets = this.getBattleStreams(battleId);

            if (!sockets) {
                continue;
            }

            sockets.delete(ws);

            if (sockets.size === 0) {
                this.battleSockets.delete(battleId);
            }
        }

        this.socketContext.delete(ws);
    }

    deleteBattleSockets(battleId: string): void {
        const sockets = this.getBattleStreams(battleId);
        this.battleSockets.delete(battleId);

        if (!sockets) return;

        for (const socket of sockets) {
            this.unRegisterSocket(socket);
        }
    }

    getBattleStreams(
        battleId: string
    ): Set<WebSocket> | undefined {
        return this.battleSockets.get(battleId);
    }

    writeBattleStreams(battleId: string, streamRequest: streamingGrpc.BattleStreamResponse) {
        const sockets = this.getBattleStreams(battleId);
        if (!sockets) return;

        for (const socket of sockets) {
            this.writeStream(socket, streamRequest);
        }
    }

    socketEncodingTypeIsProtobuf(socket: WebSocket): boolean {
        return this.getSocketContext(socket).encoding == SocketEncoding.PROTOBUF;
    }


    writeStream(ws: WebSocket, streamRequest: streamingGrpc.BattleStreamResponse) {
        logger.log('new websocket channel message: ', streamRequest);
        const buffer = this.socketEncodingTypeIsProtobuf(ws)
            ? streamingGrpc.BattleStreamResponse.encode(streamRequest).finish()
            : JSON.stringify(streamRequest);

        if (buffer) {
            ws.send(buffer);
        }
    }

    private resetHeartbeat(call: WebSocket) {
        this.clearHeartbeat(call);
        const timer = setTimeout(() => {
            logger.warn("Heartbeat timeout, cleaning stream");
            this.deleteBattleSockets(call);
        }, this.heartbeatTimeoutMs);
        this.heartbeatTimers.set(call, timer);
    }

    private clearHeartbeat(call: WebSocket) {
        const timer = this.heartbeatTimers.get(call);
        if (timer) {
            clearTimeout(timer);
            this.heartbeatTimers.delete(call);
        }
    }
}

const frontBattleStreamRegistry = new FrontBattleStreamRegistry();

export default frontBattleStreamRegistry;



