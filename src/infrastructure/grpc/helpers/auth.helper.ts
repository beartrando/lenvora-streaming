import * as grpc from '@grpc/grpc-js';
import {InvalidAuthorizationError} from "@shared/errors";
import AccessToken from "../../../domain/common/value-objects/access-token.vo";

export class AuthHelper {
    static getAccessToken(
        call: grpc.ServerUnaryCall<any, any>
    ): AccessToken {
        const authHeader = call.metadata.get('authorization')[0] as string;
        // logger.log(authHeader);
        if (!authHeader?.startsWith('Bearer ')) {
            throw new InvalidAuthorizationError();
        }

        return new AccessToken(authHeader.slice(7));
    };

    static getMetadata(accessToken: AccessToken): grpc.Metadata {
        const metadata = new grpc.Metadata();
        metadata.add('authorization', 'Bearer ' + accessToken.value);
        return metadata;
    }
}

export default AuthHelper;
