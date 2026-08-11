import * as grpc from "@grpc/grpc-js";

import * as battleProto from "../../../contracts/proto/battle";
import * as profileProto from "../../../contracts/proto/profile";

import {GrpcClientManager} from "@shared/grpc-client-manager";

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
            (client, cb) => client.join(grpcRequest, metadata, cb)
        ).catch((err) => {
            logger.error("joinBattle failed:", err);
            return null;
        });
    }

    async upsert(grpcRequest: profileProto.ProfileIdRequest, metadata: grpc.Metadata): Promise<battleProto.BattleResponse | null> {
        return this.manager.call<battleProto.BattleResponse>(
            (client, cb) => client.getOrCreate(grpcRequest, metadata, cb)
        ).catch((err) => {
            logger.error("Upsert battle failed:", err);
            return null;
        });
    }
}

export default BattleClient;
