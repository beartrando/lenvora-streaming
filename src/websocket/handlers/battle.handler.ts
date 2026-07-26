import type {WebSocket} from "ws";
import * as streamingGrpc from "../../grpc/generated/streaming";
import * as battleService from "../../services/battle.service";
import * as engineGrpc from "../../grpc/generated/engine";
import * as battleGrpc from "../../grpc/generated/battle";
import logger from "@shared/logger";
import frontBattleStreamRegistry from "../channels/front.battle.stream";
import * as profileService from "../../services/profile.service";
import * as errorGrpc from "../../grpc/generated/common/error";
import engineStream from "../../grpc/channels/engine.stream";
import pgBossManager from "@shared/pg-boss-manager";

import {kafkaProducersConfig} from "../../config/kafka.config";
import * as emptyGrpc from "../../grpc/generated/common/empty";


export async function isAllowedUser(userId: string, profileId: string, jwt: string) {

    const profile = await profileService.getByUser(userId, jwt);

    if (!profile) {
        throw new Error("Profile not found");
    }

    if (profile.id !== profileId) {
        throw new Error("Access deined");
    }
}

export async function battleHandler(ws: WebSocket, jwt: string, profileId: string, payload: streamingGrpc.BattleRequest): Promise<void> {
    logger.log('battleHandler got event');
    logger.log(payload);

    if (payload.start) {
        return battleHandlerStart(ws, jwt, profileId, payload.start);
    } else if (payload.move) {
        return battleHandlerMove(ws, profileId, payload.move);
    } else if (payload.ping) {
        return battleHandlerPing(ws);
    } else if (payload.connectAi) {
        return battleHandlerConnectAi(ws, profileId, payload.connectAi);
    } else if (payload.leave) {
        return battleHandlerLeave(ws, profileId, payload.leave);
    }

    logger.warn(`⚠️ Unknown payload type:`, payload);
}

export async function battleHandlerStart(ws: WebSocket, jwt: string, profileId: string, payload: streamingGrpc.BattleStart) {
    logger.log("Battle join event");

    let resp: battleGrpc.BattleResponse | null;

    if (payload.battleId) {
        resp = await battleService.join(payload.battleId, profileId, jwt);
    } else {
        // logger.log('battle - here')
        resp = await battleService.upsert(profileId, jwt);
    }

    if (!resp || resp.error) {
        const battleStreamResponse = streamingGrpc.BattleResponse.create({
            error: errorGrpc.ErrorObject.create({
                code: errorGrpc.ErrorCode.ENTITY_SPECIFIC,
                message: "Battle not found"
            })
        });

        frontBattleStreamRegistry.writeStream(ws, battleStreamResponse);
        return;
    }

    frontBattleStreamRegistry.subscribeBattle(ws, resp.battle.id);

    // logger.log("Battle stream was set:" + battle.id);

    try {
        if (resp.status === battleGrpc.BattleStatus.ACTIVE) {
            const grpcRequest = engineGrpc.BattleRequest.create({start: resp})
            engineStream.write(grpcRequest);
        }

        const message = streamingGrpc.BattleResponse.create({battle: resp});

        frontBattleStreamRegistry.writeBattleStreams(resp.id, message);
    } catch (e) {
        logger.error(String(e));
    }
}

export async function battleHandlerMove(
    ws: WebSocket,
    profileId: string,
    payload: streamingGrpc.BattleMove,
) {
    const battleId = payload.battleId;

    const context = frontBattleStreamRegistry.getSocketContext(ws);

    if (!context) {
        logger.warn("Ignoring move from unregistered socket");
        return;
    }

    if (!context.battleIds.has(battleId)) {
        logger.warn(`Socket is not subscribed to battle ${battleId}`);
        return;
    }

    const grpcRequest = engineGrpc.BattleRequest.create({
        move: engineGrpc.BattleMove.create({
            profileId,
            ...payload,
        }),
    });

    engineStream.write(grpcRequest);
}

export async function battleHandlerPing(ws: WebSocket) {
    frontBattleStreamRegistry.writeStream(ws, emptyGrpc.Empty.create({}));
}


export async function battleHandlerConnectAi(
    ws: WebSocket,
    profileId: string,
    payload: streamingGrpc.BattleJoinAi,
) {
    const battleId = payload.battleId;

    const context = frontBattleStreamRegistry.getSocketContext(ws);

    if (!context) {
        logger.warn("Ignoring AI connect request from unregistered socket");
        return;
    }

    if (!context.battleIds.has(battleId)) {
        logger.warn(`Socket is not subscribed to battle ${battleId}`);
        return;
    }

    const battleIdRequest =
        streamingGrpc.BattleStart.create({ battleId });

    logger.log("Messaging to AI");

    await pgBossManager.queue.enqueue(
        kafkaProducersConfig.aiConnectingRequest,
        battleIdRequest,
    );
}

export async function battleHandlerLeave(ws: WebSocket, profileId: string, payload: streamingGrpc.BattleLeave) {
    const battleId = payload.battleId;
    await battleService.leave(battleId, profileId);
}
