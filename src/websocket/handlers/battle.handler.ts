import type {WebSocket} from "ws";
import * as streamingGrpc from "../../grpc/generated/streaming";
import * as battleService from "../../services/battle.service";
import * as engineGrpc from "../../grpc/generated/engine";
import * as battleGrpc from "../../grpc/generated/battle";
import logger from "@shared/logger";
import frontBattleStreamRegistry from "../channels/front.battle.stream";
import * as profileService from "../../services/profile.service";
import {ErrorObject} from "../../grpc/generated/common/error";
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

export async function battleHandler(ws: WebSocket, profileId: string, payload: streamingGrpc.BattleStreamRequest, jwt: string) {

    logger.log('battleHandler got event');
    logger.log(payload);

    switch (true) {
        case !!payload.start:
            return battleHandlerStart(ws, profileId, payload.start, jwt);
        case !!payload.move:
            return battleHandlerMove(ws, profileId, payload.move, jwt);
        case !!payload.ping:
            return battleHandlerPing(ws);
        case !!payload.connectAi:
            return battleHandlerConnectAi(ws, profileId, payload.connectAi, jwt);
        case !!payload.leave:
            return battleHandlerLeave(ws, profileId, payload.leave, jwt);
        case !!payload.end:
            return battleHandlerEnd(ws, profileId, jwt);
    }

    logger.warn(`⚠️ Unknown payload type:`, payload);
}

export async function battleHandlerStart(ws: WebSocket, profileId: string, payload: streamingGrpc.StartBattleRequest, jwt: string) {
    logger.log("Battle join event");

    let battle: battleGrpc.BattleObject | null;

    if (payload.battleId) {
        battle = await battleService.join(payload.battleId, profileId, jwt);
    } else {
        // logger.log('battle - here')
        battle = await battleService.upsert(profileId, jwt);
    }

    if (!battle) {
        const battleStreamResponse = streamingGrpc.BattleStreamResponse.create({
            error: ErrorObject.create({
                type: "error",
                message: "Battle not found"
            })
        });

        frontBattleStreamRegistry.writeStream(ws, battleStreamResponse);
        return;
    }

    frontBattleStreamRegistry.setBattleStream(ws, profileId, battle.id);

    // logger.log("Battle stream was set:" + battle.id);

    try {
        if (battle.status == battleGrpc.BattleStatus.ACTIVE) {
            const grpcRequest = engineGrpc.BattleStreamRequest.create({start: battleGrpc.BattleRequest.create({battle})})
            engineStream.write(grpcRequest);
        }

        const message = streamingGrpc.BattleStreamResponse.create({battle});

        frontBattleStreamRegistry.writeBattleStreams(battle.id, message);
    } catch (e) {
        logger.error(String(e));
    }
}

export async function battleHandlerMove(ws: WebSocket, profileId: string, payload: streamingGrpc.BattleMoveRequest, jwt: string) {
    // logger.log("Battle move event");

    const battleId = payload.battleId;

    const battleIds = frontBattleStreamRegistry.getBattleIdsByStream(ws);

    if (!battleIds.has(battleId)) {
        logger.error('Invalid battleId')
        return;
    }

    const grpcRequest = engineGrpc.BattleStreamRequest.create({
        move: engineGrpc.BattleMoveRequest.create({
            profileId: profileId, ...payload
        }),
    });

    engineStream.write(grpcRequest);
}

export async function battleHandlerPing(ws: WebSocket) {
    frontBattleStreamRegistry.writeStream(ws, emptyGrpc.Empty.create({}));
}


export async function battleHandlerConnectAi(ws: WebSocket, profileId: string, payload: streamingGrpc.AiJoinToBattleRequest, jwt: string) {
    const battleId = payload.battleId;

    const battleIds = frontBattleStreamRegistry.getBattleIdsByStream(ws);

    if (!battleIds.has(battleId)) {
        logger.error("wrong battleId");
        return;
    }

    const battleIdRequest = streamingGrpc.StartBattleRequest.create({battleId});
    logger.log('messaging to ai');
    await pgBossManager.queue.enqueue(kafkaProducersConfig.aiConnectingRequest, battleIdRequest);
}

export async function battleHandlerLeave(ws: WebSocket, profileId: string, payload: streamingGrpc.LeaveBattleRequest, jwt: string) {
    const battleId = payload.battleId;
    const grpcRequest = engineGrpc.BattleStreamRequest.create({
        leave: battleGrpc.BattleLeaveRequest.create({battleId, profileId}),
    });

    engineStream.write(grpcRequest);
}

export async function battleHandlerEnd(ws: WebSocket, profileId: string, jwt: string) {
    // return battleHandlerLeave(ws, profileId, payload, jwt) {
}

