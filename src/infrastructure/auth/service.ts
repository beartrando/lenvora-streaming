import jwt from "jsonwebtoken";

import SessionAccessToken from "../../domain/session/value-objects/session-access-token.vo";

import TokenService from "../../application/ports/token-service.port";
import AuthConfig from "./interfaces/auth-config";
import TokenPayload from "./interfaces/token-payload";
import UserId from "../../domain/user/value-objects/user-id.vo";


export class AuthService implements TokenService {
    constructor(private readonly config: AuthConfig) {
    }

    verifyAccessToken(token: SessionAccessToken): UserId {
        const payload = this.payload(token.value, this.config.accessSecret);

        return new UserId(payload.sub);
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
