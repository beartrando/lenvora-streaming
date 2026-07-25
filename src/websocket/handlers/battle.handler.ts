import type {WebSocket} from "ws";
import * as streamingGrpc from "../../grpc/generated/streaming";
import * as battleService from "../../services/battle.service";
import * as engineGrpc from "../../grpc/generated/engine";
import * as battleGrpc from "../../grpc/generated/battle";
import logger from "@shared/logger";
import frontBattleStreamRegistry, {SocketEncoding} from "../channels/front.battle.stream";
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

export async function battleHandler(ws: WebSocket, jwt: string, profileId: string, payload: streamingGrpc.BattleStreamRequest): Promise<void> {
    logger.log('battleHandler got event');
    logger.log(payload);

    switch (true) {
        case !!payload.start:
            return battleHandlerStart(ws, jwt, profileId, payload.start);
        case !!payload.move:
            return battleHandlerMove(ws, jwt, profileId, payload.move);
        case !!payload.ping:
            return battleHandlerPing(ws);
        case !!payload.connectAi:
            return battleHandlerConnectAi(ws, jwt, profileId, payload.connectAi);
        case !!payload.leave:
            return battleHandlerLeave(ws, jwt, profileId, payload.leave);
        case !!payload.end:
            return battleHandlerEnd(ws, jwt, profileId);
    }

    logger.warn(`⚠️ Unknown payload type:`, payload);
}

export async function battleHandlerStart(ws: WebSocket, jwt: string, profileId: string, payload: streamingGrpc.StartBattleRequest) {
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

    frontBattleStreamRegistry.subscribeBattle(ws, battle.id);

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

export async function battleHandlerMove(ws: WebSocket, jwt: string, profileId: string, payload: streamingGrpc.BattleMoveRequest) {
    // logger.log("Battle move event");

    const battleId = payload.battleId;

    const {battleIds} = frontBattleStreamRegistry.getSocketContext(ws);

    if (!battleIds.has(battleId)) {
        logger.error('Invalid battleId', battleIds, battleId);
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


export async function battleHandlerConnectAi(ws: WebSocket, jwt: string, profileId: string, payload: streamingGrpc.AiJoinToBattleRequest) {
    const battleId = payload.battleId;

    const {battleIds} = frontBattleStreamRegistry.getSocketContext(ws);

    if (!battleIds.has(battleId)) {
        logger.error("wrong battleId");
        return;
    }

    const battleIdRequest = streamingGrpc.StartBattleRequest.create({battleId});
    logger.log('messaging to ai');
    await pgBossManager.queue.enqueue(kafkaProducersConfig.aiConnectingRequest, battleIdRequest);
}

export async function battleHandlerLeave(ws: WebSocket, jwt: string, profileId: string, payload: streamingGrpc.LeaveBattleRequest) {
    const battleId = payload.battleId;
    const grpcRequest = engineGrpc.BattleStreamRequest.create({
        leave: battleGrpc.BattleLeaveRequest.create({battleId, profileId}),
    });

    engineStream.write(grpcRequest);
}

export async function battleHandlerEnd(ws: WebSocket, jwt: string, profileId: string) {
    // return battleHandlerLeave(ws, profileId, payload, jwt) {
}

