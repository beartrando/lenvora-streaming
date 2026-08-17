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

    async start(request: battleProto.BattleStartRequest, metadata: grpc.Metadata): Promise<battleProto.BattleResponse | null> {
        // logger.log(request);

        return this.manager.call<battleProto.BattleResponse>(
            (client, cb) => client.start(request, metadata, cb)
        ).catch((err) => {
            logger.error("Start engine failed:", err);
            return null;
        });
    }

    async GetActiveByProfile(request: profileProto.ProfileIdRequest, metadata: grpc.Metadata): Promise<battleProto.BattleResponse | null> {
        return this.manager.call<battleProto.BattleResponse>(
            (client, cb) => client.getActiveByProfile(request, metadata, cb)
        ).catch((err) => {
            logger.error("Get active  battles by profile failed:", err);
            return null;
        });
    }
}

export default BattleClient;
