import type {WebSocket} from "ws";
import * as streamingProto from "../../grpc/generated/streaming";
import * as battleService from "../../services/battle.service";
import * as engineProto from "../../grpc/generated/engine";
import * as battleProto from "../../grpc/generated/battle";
import logger from "@shared/logger";
import frontBattleStreamRegistry from "../channels/front.battle.stream";
import * as profileService from "../../services/profile.service";
import * as errorProto from "../../grpc/generated/common/error";
import engineStream from "../../grpc/registers/engine.stream";
import pgBossManager from "@shared/pg-boss-manager";

import {messageProducersConfig} from "../../configs/kafka.configs";
import * as emptyProto from "../../grpc/generated/common/empty";


export async function isAllowedUser(userId: string, profileId: string, jwt: string) {

    const resp = await profileService.getByUser(userId, jwt);

    return resp?.profile?.id === profileId;
}

export async function battleHandler(ws: WebSocket, jwt: string, profileId: string, payload: streamingProto.BattleRequest): Promise<void> {
    logger.log('battleHandler got event');
    logger.log(payload);

    if (payload.start) {
        return battleHandlerStart(ws, jwt, profileId, payload.start);
    } else if (payload.move) {
        return battleHandlerMove(ws, profileId, payload.move);
    } else if (payload.ping) {
        return battleHandlerPing(ws);
    } else if (payload.connectBot) {
        return battleHandlerConnectBot(ws, profileId, payload.connectBot);
    } else if (payload.leave) {
        return battleHandlerLeave(ws, profileId, payload.leave);
    }

    logger.warn(`⚠️ Unknown payload type:`, payload);
}

export async function battleHandlerStart(ws: WebSocket, jwt: string, profileId: string, payload: streamingProto.BattleStart) {
    logger.log("Battle join event");

    let resp: battleProto.BattleResponse | null;

    if (payload.battleId) {
        resp = await battleService.join(payload.battleId, profileId, jwt);
    } else {
        // logger.log('battle - here')
        resp = await battleService.upsert(profileId, jwt);
    }

    if (resp?.battle) {
        frontBattleStreamRegistry.subscribeBattle(ws, resp.battle.id);

        // logger.log("Battle stream was set:" + battle.id);

        try {
            if (resp.battle.status === battleProto.BattleStatus.ACTIVE) {
                const grpcRequest = engineProto.BattleRequest.create({start: resp.battle})
                engineStream.write(grpcRequest);
            }

            const message = streamingProto.BattleResponse.create({battle: resp.battle});

            frontBattleStreamRegistry.writeBattleStreams(resp.battle.id, message);
        } catch (e) {
            logger.error(String(e));
        }

    } else if (resp?.error) {
        const battleStreamResponse = streamingProto.BattleResponse.create({
            error: resp.error
        });

        frontBattleStreamRegistry.writeStream(ws, battleStreamResponse);
        return;
    } else {
        const battleStreamResponse = streamingProto.BattleResponse.create({
            error: {
                code: errorProto.ErrorCode.ENTITY_SPECIFIC,
                message: "Battle not found"
            }
        });

        frontBattleStreamRegistry.writeStream(ws, battleStreamResponse);
        return;
    }
}

export async function battleHandlerMove(
    ws: WebSocket,
    profileId: string,
    payload: streamingProto.BattleMove,
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

    const grpcRequest = engineProto.BattleRequest.create({
        move: engineProto.BattleMove.create({
            profileId,
            ...payload,
        }),
    });

    engineStream.write(grpcRequest);
}

export async function battleHandlerPing(ws: WebSocket) {
    frontBattleStreamRegistry.writeStream(ws, emptyProto.Empty.create({}));
}


export async function battleHandlerConnectBot(
    ws: WebSocket,
    profileId: string,
    payload: streamingProto.BattleJoinBot,
) {
    const battleId = payload.battleId;

    const context = frontBattleStreamRegistry.getSocketContext(ws);

    if (!context) {
        logger.warn("Ignoring Bot connect request from unregistered socket");
        return;
    }

    if (!context.battleIds.has(battleId)) {
        logger.warn(`Socket is not subscribed to battle ${battleId}`);
        return;
    }

    const battleIdRequest =
        streamingProto.BattleStart.create({battleId});

    logger.log("Messaging to Bot service");

    await pgBossManager.queue.enqueue(
        messageProducersConfig.aiConnectingRequest,
        battleIdRequest,
    );
}

export async function battleHandlerLeave(ws: WebSocket, profileId: string, payload: streamingProto.BattleLeave) {
    const battleId = payload.battleId;
    await battleService.leave(battleId, profileId);
}
