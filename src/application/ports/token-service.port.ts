import AccessToken from "../../domain/common/value-objects/access-token.vo";
import Id from "../../domain/common/value-objects/id.vo";

export interface TokenService {
    verifyAccessToken(
        token: AccessToken,
    ): Id;
}

export default TokenService;
