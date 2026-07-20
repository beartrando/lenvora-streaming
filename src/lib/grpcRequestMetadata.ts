import jwt from 'jsonwebtoken';
import config from '../config/config';
import * as grpc from '@grpc/grpc-js';

const jwtSecret = config.jwtAccessSecret;

export const getUserIdFromJwt = (token: string): string => {

    const payload = jwt.verify(token, jwtSecret) as { sub: string };
    if (!payload.sub) {
        throw new Error('JWT payload missing sub');
    }

    return payload.sub;
};

export const getJwtFromGrpcRequest = (
    call: grpc.ServerUnaryCall<any, any>
): string => {

    // logger.log('grpcRequestMetadata');

    const authHeader = call.metadata.get('authorization')[0] as string;
    // logger.log(call.metadata.get('authorization'));
    if (!authHeader?.startsWith('Bearer ')) {
        throw new Error('Missing or invalid Authorization header');
    }

    return authHeader.slice(7);
};

export const getUserIdFromGrpcRequest = (
    call: grpc.ServerUnaryCall<any, any>
): string => {

    return getUserIdFromJwt(getJwtFromGrpcRequest(call))
};

export function createMetadataWithJwt(jwt: string): grpc.Metadata {
    const metadata = new grpc.Metadata();
    // logger.log(authHeader);
    metadata.add('authorization', jwt);
    return metadata;
}
