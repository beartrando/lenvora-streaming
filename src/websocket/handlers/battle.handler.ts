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
    // } else if (payload.end) {
    //     return battleHandlerEnd(ws, profileId);
    }

    logger.warn(`⚠️ Unknown payload type:`, payload);
}

export async function battleHandlerStart(ws: WebSocket, jwt: string, profileId: string, payload: streamingGrpc.BattleStartRequest) {
    logger.log("Battle join event");

    let battle: battleGrpc.BattleObject | null;

    if (payload.battleId) {
        battle = await battleService.join(payload.battleId, profileId, jwt);
    } else {
        // logger.log('battle - here')
        battle = await battleService.upsert(profileId, jwt);
    }

    if (!battle) {
        const battleStreamResponse = streamingGrpc.BattleResponse.create({
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
        if (battle.status === battleGrpc.BattleStatus.ACTIVE) {
            const grpcRequest = engineGrpc.BattleRequest.create({start: battleGrpc.BattleRequest.create({battle})})
            engineStream.write(grpcRequest);
        }

        const message = streamingGrpc.BattleResponse.create({battle});

        frontBattleStreamRegistry.writeBattleStreams(battle.id, message);
    } catch (e) {
        logger.error(String(e));
    }
}

export async function battleHandlerMove(ws: WebSocket, profileId: string, payload: streamingGrpc.BattleMoveRequest) {
    // logger.log("Battle move event");

    const battleId = payload.battleId;

    const {battleIds} = frontBattleStreamRegistry.getSocketContext(ws);

    if (!battleIds.has(battleId)) {
        logger.error('Invalid battleId', battleIds, battleId);
        return;
    }

    const grpcRequest = engineGrpc.BattleRequest.create({
        move: engineGrpc.BattleMoveRequest.create({
            profileId, ...payload
        }),
    });

    engineStream.write(grpcRequest);
}

export async function battleHandlerPing(ws: WebSocket) {
    frontBattleStreamRegistry.writeStream(ws, emptyGrpc.Empty.create({}));
}


export async function battleHandlerConnectAi(ws: WebSocket, profileId: string, payload: streamingGrpc.BattleJoinAiRequest) {
    const battleId = payload.battleId;

    const {battleIds} = frontBattleStreamRegistry.getSocketContext(ws);

    if (!battleIds.has(battleId)) {
        logger.error("wrong battleId");
        return;
    }

    const battleIdRequest = streamingGrpc.BattleStartRequest.create({battleId});
    logger.log('messaging to ai');
    await pgBossManager.queue.enqueue(kafkaProducersConfig.aiConnectingRequest, battleIdRequest);
}

export async function battleHandlerLeave(ws: WebSocket, profileId: string, payload: streamingGrpc.BattleLeaveRequest) {
    const battleId = payload.battleId;
    const grpcRequest = engineGrpc.BattleRequest.create({
        leave: battleGrpc.BattleLeaveRequest.create({battleId, profileId}),
    });

    // frontBattleStreamRegistry.unsubscribeBattle(ws, battleId);

    engineStream.write(grpcRequest);

    // if (!frontBattleStreamRegistry.hasSubscriptions(ws)) {
    //     frontBattleStreamRegistry.unregisterSocket(ws);
    // }
}

// export async function battleHandlerEnd(ws: WebSocket, jwt: string, profileId: string) {
//     // return battleHandlerLeave(ws, profileId, payload, jwt) {
// }

