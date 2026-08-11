import ProfileClient from "../../../infrastructure/grpc/clients/profile.client";
import * as authProto from "../../../contracts/proto/auth";
import * as grpc from "@grpc/grpc-js";
import Id from "../../../domain/common/value-objects/id.vo";
import AccessToken from "../../../domain/common/value-objects/access-token.vo";
import AuthHelper from "../../../infrastructure/grpc/helpers/auth.helper";

export class AuthorizeProfileUseCase {
    constructor(
        private readonly profileClient: ProfileClient,
    ) {
    }

    async execute(
        userId: Id,
        profileId: Id,
        accessToken: AccessToken,
    ): Promise<boolean> {

        const protoReq = authProto.UserIdRequest.create({userId: userId.value});

        const resp = await this.profileClient.getByUser(
            protoReq,
            AuthHelper.getMetadata(accessToken),
        );

        return resp?.profile?.id === profileId.value;
    }
}

export default AuthorizeProfileUseCase;
