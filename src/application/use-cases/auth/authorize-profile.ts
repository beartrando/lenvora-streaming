import ProfileClient from "../../../infrastructure/grpc/clients/profile.client";
import * as authProto from "../../../contracts/proto/auth";
import * as grpc from "@grpc/grpc-js";
import Id from "../../../domain/common/value-objects/id.vo";
import AccessToken from "../../../domain/common/value-objects/access-token.vo";

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
            accessToken.value,
        );

        return resp?.profile?.id === profileId;
    }
}

export default AuthorizeProfileUseCase;
