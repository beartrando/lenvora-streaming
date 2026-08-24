import ProfileClient from "../../../infrastructure/grpc/clients/profile.client";
import * as authProto from "../../../contracts/proto/auth";
import SessionAccessToken from "../../../domain/session/value-objects/session-access-token.vo";
import AuthHelper from "../../../infrastructure/grpc/helpers/auth.helper";
import UserId from "../../../domain/user/value-objects/user-id.vo";
import ProfileId from "../../../domain/profile/value-objects/profile-id.vo";

export class AuthorizeProfileUseCase {
    constructor(
        private readonly profileClient: ProfileClient,
    ) {
    }

    async execute(
        userId: UserId,
        profileId: ProfileId,
        accessToken: SessionAccessToken,
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
