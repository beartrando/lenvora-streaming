import * as battleClient from "../grpc/clients/battle.client";
import * as profileGrpc from "../grpc/generated/profile";
import * as battleGrpc from "../grpc/generated/battle";
import {BattleObject, BattleStatus} from "../grpc/generated/battle";
import FrontBattleStreamRegistry from "../websocket/channels/front.battle.stream";
import logger from "@shared/logger";
import * as streamingGrpc from "../grpc/generated/streaming";
import {createMetadataWithJwt} from "../lib/grpcRequestMetadata";

export const upsert = async (profileId: string, jwt: string) => {
    const grpcRequest = profileGrpc.ProfileIdRequest.create({profileId});
    const metadata = createMetadataWithJwt(jwt);

    return await battleClient.upsert(grpcRequest, metadata);
}

export const join = async (battleId: string, profileId: string, jwt: string) => {
    const grpcRequest: battleGrpc.StartBattleRequest = {battleId, profileId};
    const metadata = createMetadataWithJwt(jwt);
    return await battleClient.join(grpcRequest, metadata);
}

export const leave = async (battleId: string, profileId: string, jwt: string) => {
    const metadata = createMetadataWithJwt(jwt);
    const grpcRequest: battleGrpc.BattleLeaveRequest = {battleId, profileId};

    return await battleClient.leave(grpcRequest, metadata);
}

export const update = async (battle: BattleObject) => {
    // logger.log('update battle:', battle);
    try {
        const message = streamingGrpc.BattleStreamResponse.create({battle});

        FrontBattleStreamRegistry.writeBattleStreams(battle.id, message);
    } catch (e) {
        logger.error(String(e));
    }

    if (battle.status == BattleStatus.FINISHED) {
        logger.log(`Battle ${battle.id} finished. Closing streams...`);
        FrontBattleStreamRegistry.deleteBattleStreams(battle.id);
        logger.log(`Removed battle ${battle.id} from activeBattleStreams`);
    }
};
