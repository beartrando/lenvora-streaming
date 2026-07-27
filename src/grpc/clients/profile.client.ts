import * as grpc from '@grpc/grpc-js';
import * as authGrpc from '../generated/auth';
import * as profileGrpc from '../generated/profile';
import config from '../../config/config';
import {GrpcClientManager} from '@shared/grpc-client-manager';

const profileManager = new GrpcClientManager<profileGrpc.ProfileClient>(() => {
    return new profileGrpc.ProfileClient(config.serviceProfileUrl, grpc.credentials.createInsecure());
});

export const getByUser = (grpcRequest: authGrpc.UserIdRequest, metadata: grpc.Metadata): Promise<profileGrpc.ProfileResponse | null> => {
    return profileManager.call((client, cb) => client.getByUser(grpcRequest, metadata, cb));
};
