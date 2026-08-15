import jwt, {JwtPayload} from "jsonwebtoken";


import TokenService from "../../application/ports/token-service.port";
import Id from "../../domain/common/value-objects/id.vo";
import AccessToken from "../../domain/common/value-objects/access-token.vo";
import AuthConfig from "./interfaces/auth-config";
import TokenPayload from "./interfaces/token-payload";


export class AuthService implements TokenService {
    constructor(private readonly config: AuthConfig) {
    }

    verifyAccessToken(token: AccessToken): Id {
        const payload = this.payload(token.value, this.config.accessSecret);

        return new Id(payload.sub);
    }

    private payload(
        token: string,
        secret: jwt.Secret,
    ): TokenPayload {
        const payload = jwt.verify(token, secret) as TokenPayload;

        if (!payload.sub) {
            throw new Error("JWT payload missing sub");
        }

        return payload;
    }
}

export default AuthService;
