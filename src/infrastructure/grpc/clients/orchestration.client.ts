import * as grpc from "@grpc/grpc-js";

import * as orchestrationProto from "../../../contracts/proto/orchestration";

import {GrpcClientManager} from "@shared/grpc-client-manager";

export class OrchestrationClient {
    private readonly manager: GrpcClientManager<orchestrationProto.OrchestrationClient>;

    constructor(
        private readonly url: string,
    ) {
        this.manager = new GrpcClientManager(
            () =>
                new orchestrationProto.OrchestrationClient(
                    this.url,
                    grpc.credentials.createInsecure(),
                ),
        );
    }

    async proxy(
        request: orchestrationProto.ProxyRequest,
    ): Promise<orchestrationProto.ProxyResponse | null> {
        return this.manager.call(
            (client, callback) =>
                client.proxy(request, callback),
        );
    }
}


export default OrchestrationClient;
