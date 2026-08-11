import * as grpc from "@grpc/grpc-js";

import * as battleProto from "../../../contracts/proto/battle";
import * as profileProto from "../../../contracts/proto/profile";

import {GrpcClientManager} from "@shared/grpc-client-manager";
import logger from "@shared/logger";

export class BattleClient {
    private readonly manager: GrpcClientManager<battleProto.BattleClient>;

    constructor(
        private readonly url: string,
    ) {
        this.manager = new GrpcClientManager(
            () => new battleProto.BattleClient(this.url, grpc.credentials.createInsecure()),
        );
    }

    async join(grpcRequest: battleProto.BattleStartRequest, metadata: grpc.Metadata): Promise<battleProto.BattleResponse | null> {
        return this.manager.call<battleProto.BattleResponse>(
            (client, cb) => client.start(grpcRequest, metadata, cb)
        ).catch((err) => {
            logger.error("Join battle failed:", err);
            return null;
        });
    }

    async GetActiveByProfile(grpcRequest: profileProto.ProfileIdRequest, metadata: grpc.Metadata): Promise<battleProto.BattleResponse | null> {
        return this.manager.call<battleProto.BattleResponse>(
            (client, cb) => client.getActiveByProfile(grpcRequest, metadata, cb)
        ).catch((err) => {
            logger.error("Get active  battles by profile failed:", err);
            return null;
        });
    }
}

export default BattleClient;
