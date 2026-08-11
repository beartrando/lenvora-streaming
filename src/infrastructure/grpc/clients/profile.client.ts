import * as grpc from "@grpc/grpc-js";

import * as authProto from "../../../contracts/proto/auth";
import * as profileProto from "../../../contracts/proto/profile";

import {GrpcClientManager} from "@shared/grpc-client-manager";

export class ProfileClient {
    private readonly manager: GrpcClientManager<profileProto.ProfileClient>;

    constructor(
        private readonly url: string,
    ) {
        this.manager = new GrpcClientManager(
            () =>
                new profileProto.ProfileClient(
                    this.url,
                    grpc.credentials.createInsecure(),
                ),
        );
    }

    async getByUser(
        request: authProto.UserIdRequest,
        metadata: grpc.Metadata,
    ): Promise<profileProto.ProfileResponse | null> {
        return this.manager.call((client, callback) => client.getByUser(request, metadata, callback));
    }
}


export default ProfileClient;
