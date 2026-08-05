import jwt from 'jsonwebtoken';
import config from '../config/config';
import * as grpc from '@grpc/grpc-js';
import logger from "@shared/logger";

const jwtSecret = config.accessSecret;

export const getUserIdFromJwt = (token: string): string => {

    const payload = jwt.verify(token, jwtSecret) as { sub: string };
    if (!payload.sub) {
        throw new Error('JWT payload missing sub');
    }

    return payload.sub;
};

export const getJwtFromProtoRequest = (
    call: grpc.ServerUnaryCall<any, any>
): string => {
    const authHeader = call.metadata.get('authorization')[0] as string;
    logger.log(authHeader);
    if (!authHeader?.startsWith('Bearer ')) {
        // throw new Error('Missing or invalid Authorization header');
        logger.error('Missing or invalid Authorization header');
        return '';
    }

    return authHeader.slice(7);
};

export const getUserIdFromProtoRequest = (
    call: grpc.ServerUnaryCall<any, any>
): string => {

    try {
        return getUserIdFromJwt(getJwtFromProtoRequest(call))
    } catch (e) {
        logger.error('User id cannot be obtained');
        return '';
    }
};

export function metadataWithJwt(jwt: string): grpc.Metadata {
    const metadata = new grpc.Metadata();
    metadata.add('authorization', 'Bearer ' + jwt);
    return metadata;
}
