import * as grpc from '@grpc/grpc-js';
import * as battleProto from '../generated/battle';
import * as emptyProto from '../generated/common/empty';
import * as profileProto from '../generated/profile';
import config from '../../configs/configs';
import {GrpcClientManager} from '@shared/grpc-client-manager';
import logger from "@shared/logger";

const battleManager = new GrpcClientManager<battleProto.BattleClient>(() => {
    return new battleProto.BattleClient(config.serviceBattleUrl, grpc.credentials.createInsecure());
});

export const join = (grpcRequest: battleProto.BattleStartRequest, metadata: grpc.Metadata): Promise<battleProto.BattleResponse | null> => {
    return battleManager.call<battleProto.BattleResponse>(
        (client, cb) => client.join(grpcRequest, metadata, cb)
    ).catch((err) => {
        logger.error("joinBattle failed:", err);
        return null;
    });
};

export const upsert = (grpcRequest: profileProto.ProfileIdRequest, metadata: grpc.Metadata): Promise<battleProto.BattleResponse | null> => {
    return battleManager.call<battleProto.BattleResponse>(
        (client, cb) => client.getOrCreate(grpcRequest, metadata, cb)
    ).catch((err) => {
        logger.error("Upsert battle failed:", err);
        return null;
    });
};
