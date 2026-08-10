import * as grpc from '@grpc/grpc-js';
import * as authProto from '../generated/auth';
import * as profileProto from '../generated/profile';
import config from '../../configs/configs';
import {GrpcClientManager} from '@shared/grpc-client-manager';

const profileManager = new GrpcClientManager<profileProto.ProfileClient>(() => {
    return new profileProto.ProfileClient(config.serviceProfileUrl, grpc.credentials.createInsecure());
});

export const getByUser = (grpcRequest: authProto.UserIdRequest, metadata: grpc.Metadata): Promise<profileProto.ProfileResponse | null> => {
    return profileManager.call((client, cb) => client.getByUser(grpcRequest, metadata, cb));
};
