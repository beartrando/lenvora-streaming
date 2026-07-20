import * as profileClient from "../grpc/clients/profile.client";
import * as profileGrpc from "../grpc/generated/profile";
import * as authGrpc from "../grpc/generated/auth";
import {createMetadataWithJwt} from "../lib/grpcRequestMetadata";

export const getByUser = async (userId: string, jwt: string): Promise<profileGrpc.ProfileObject | null> => {
    const grpcRequest: authGrpc.UserIdRequest = {userId};
    const metadata = createMetadataWithJwt(jwt);

    return await profileClient.getByUser(grpcRequest, metadata);
}
