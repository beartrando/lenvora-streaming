// import * as profileClient from "../grpc/clients/profile.client";
// import * as profileProto from "../grpc/generated/profile";
// import * as authProto from "../grpc/generated/auth";
// import {metadataWithJwt} from "../lib/grpcRequestMetadata";
//
// export const getByUser = async (userId: string, jwt: string): Promise<profileProto.ProfileResponse | null> => {
//     const grpcRequest: authProto.UserIdRequest = {userId};
//     const metadata = metadataWithJwt(jwt);
//
//     return await profileClient.getByUser(grpcRequest, metadata);
// }
