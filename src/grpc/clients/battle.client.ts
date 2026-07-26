import * as grpc from '@grpc/grpc-js';
import * as battleGrpc from '../generated/battle';
import * as emptyGrpc from '../generated/common/empty';
import * as profileGrpc from '../generated/profile';
import config from '../../config/config';
import {GrpcClientManager} from '@shared/grpc-client-manager';
import logger from "@shared/logger";

const battleManager = new GrpcClientManager<battleGrpc.BattleClient>(() => {
    return new battleGrpc.BattleClient(config.serviceBattleUrl, grpc.credentials.createInsecure());
});

export const join = (grpcRequest: battleGrpc.BattleStartRequest, metadata: grpc.Metadata): Promise<battleGrpc.BattleResponse | null> => {
    return battleManager.call<battleGrpc.BattleResponse>(
        (client, cb) => client.join(grpcRequest, metadata, cb)
    ).catch((err) => {
        logger.error("joinBattle failed:", err);
        return null;
    });
};


export const leave = (grpcRequest: battleGrpc.BattleLeaveRequest, metadata: grpc.Metadata): Promise<emptyGrpc.Empty | null> => {
    return battleManager.call<emptyGrpc.Empty>(
        (client, cb) => client.leave(grpcRequest, metadata, cb)
    ).catch((err) => {
        logger.error("leaveBattle failed:", err);
        return null;
    });
};


export const upsert = (grpcRequest: profileGrpc.ProfileIdRequest, metadata: grpc.Metadata): Promise<battleGrpc.BattleResponse | null> => {
    return battleManager.call<battleGrpc.BattleObject>(
        (client, cb) => client.getOrCreate(grpcRequest, metadata, cb)
    ).catch((err) => {
        logger.error("Upsert battle failed:", err);
        return null;
    });
};
