import {WebSocket} from 'ws';
import * as streamingGrpc from '../../grpc/generated/streaming';
import logger from "@shared/logger";
import engineStream from "../../grpc/channels/engine.stream";
import * as engineGrpc from "../../grpc/generated/engine";
import * as battleGrpc from "../../grpc/generated/battle";
import config from "../../config/config";

class FrontBattleStreamRegistry {
    private sockets = new Set<WebSocket>();
    private battleSockets = new Map<string, Set<WebSocket>>();
    private socketBattles = new Map<WebSocket, Set<string>>();
    private socketProfile = new Map<WebSocket, string>();
    private socketEncodingType = new Map<WebSocket, string>();

    private heartbeatTimers = new Map<
        WebSocket,
        NodeJS.Timeout
    >();

    private heartbeatTimeoutMs = config.heartbeatTimeout*1000;

    getBattleIdsByStream = (ws: WebSocket): Set<string> => {
        return this.socketBattles.get(ws) ?? new Set<string>();
    }

    getProfileIdByStream = (ws: WebSocket): string => {
        return this.socketProfile.get(ws) ?? '';
    }

    setBattleStream = (
        ws: WebSocket,
        profileId: string,
        battleId: string
    ) => {
        this.sockets.add(ws);
        ws.on("close", () => {
            logger.info("Close a stream");

            this.deleteBattleStream(ws);
        });

        ws.on("error", (err) => {
            logger.error("Stream error:", err);
            this.deleteBattleStream(ws);
        });

        this.resetHeartbeat(ws);

        ws.on("message", () => this.resetHeartbeat(ws));
        logger.info("Stream is added to registry");

        if (!this.battleSockets.has(battleId)) {
            this.battleSockets.set(battleId, new Set());
        }

        this.battleSockets.get(battleId)!.add(ws);

        if (!this.socketBattles.has(ws)) {
            this.socketBattles.set(ws, new Set());
        }

        this.socketBattles.get(ws)!.add(battleId);

        this.battleSockets.get(battleId)!.add(ws);


        this.socketProfile.set(ws, profileId);

        // logger.log('sockets ' + this.sockets.size);
        // logger.log('socketBattles ' + this.socketBattles.size);
        // logger.log('socketProfile ' + this.socketProfile.size);
        const summary = Array.from(this.battleSockets.entries()).map(([battleId, sockets]) => ({
            battleId,
            count: sockets.size,
        }));

        logger.log('battleSockets summary:', summary);
    };

    setSocketEncodingTypeToString(socket: WebSocket): void {
        this.socketEncodingType.set(socket, 'plain');
    }

    socketEncodingTypeIsPlain(socket: WebSocket): boolean {
        return this.socketEncodingType.has(socket) && (this.socketEncodingType.get(socket) == 'plain');
    }

    deleteBattleStreams(battleId: string): void {
        const streams = this.getBattleStreams(battleId);
        if (!streams) return;

        for (const stream of streams) {
            this.deleteBattleStream(stream);
        }

        this.battleSockets.delete(battleId);
    }

    deleteBattleStream(ws: WebSocket): void {
        this.sockets.delete(ws);


        const battleIds = this.getBattleIdsByStream(ws);
        const profileId = frontBattleStreamRegistry.getProfileIdByStream(ws);


        for (const battleId of battleIds) {


            const grpcRequest = engineGrpc.BattleStreamRequest.create({
                leave: battleGrpc.BattleLeaveRequest.create({
                    battleId,
                    profileId
                })
            })

            engineStream.write(grpcRequest);

            const set = this.battleSockets.get(battleId);
            if (set) {
                set.delete(ws);
                if (set.size === 0) {
                    this.battleSockets.delete(battleId);
                }
            }
        }
        this.socketBattles.delete(ws)
        this.socketProfile.delete(ws)
        this.socketEncodingType.delete(ws);
    }

    getBattleStreams(
        battleId: string
    ): Set<WebSocket> | undefined {
        return this.battleSockets.get(battleId);
    }

    writeBattleStreams(battleId: string, streamRequest: streamingGrpc.BattleStreamResponse) {
        const streams = this.getBattleStreams(battleId);
        if (!streams) return;

        for (const stream of streams) {
            this.writeStream(stream, streamRequest);
        }
    }

    writeStream(ws: WebSocket, streamRequest: streamingGrpc.BattleStreamResponse) {
        logger.log('new websocket channel message: ', streamRequest);
        const buffer = this.socketEncodingTypeIsPlain(ws)
            ? JSON.stringify(streamRequest)
            : streamingGrpc.BattleStreamResponse.encode(streamRequest).finish();
        if (buffer) {
            ws.send(buffer);
        }
    }

    private resetHeartbeat(call: WebSocket) {
        this.clearHeartbeat(call);
        const timer = setTimeout(() => {
            logger.warn("Heartbeat timeout, cleaning stream");
            this.deleteBattleStream(call);
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



