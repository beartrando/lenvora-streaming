import {IncomingMessage} from "http";
import {RawData, WebSocket,} from "ws";

import * as streamingProto from "../../contracts/proto/streaming";
import logger from "@shared/logger";

import WebsocketHandlerInterface from "./interfaces/websocket-handler.interface";

import WebsocketConnectionHandlerInterface from "./interfaces/websocket-connection-handler.interface";
import SocketEncoding from "./enums/socket-encoding";
import AuthService from "../auth/service";
import AccessToken from "../../domain/common/value-objects/access-token.vo";
import Id from "../../domain/common/value-objects/id.vo";
import BattleLeaveUseCase from "../../application/use-cases/battle/battle-leave";
import BattleWebsocketsRegistry from "./registers/battle-websockets.registry";
import AuthorizeProfileUseCase from "../../application/use-cases/auth/authorize-profile";
import TimerService from "../timer/service";
import TimerKey from "../timer/value-objects/timer-key.vo";

export class ConnectionHandler implements WebsocketConnectionHandlerInterface {
    private readonly handlers = new Map<
        string,
        WebsocketHandlerInterface
    >();

    constructor(
        private readonly authService: AuthService,
        private readonly authorizeProfileUseCase: AuthorizeProfileUseCase,
        private readonly battleLeaveUseCase: BattleLeaveUseCase,
        private readonly battleWebsocketsRegistry: BattleWebsocketsRegistry,
        private readonly timerService: TimerService<TimerKey, WebSocket>,
    ) {
    }

    registerHandler(
        route: string,
        handler: WebsocketHandlerInterface,
    ): void {
        this.handlers.set(route, handler);
    }

    buildUrl(req: IncomingMessage): URL {
        return new URL(req.url ?? "/", `http://${req.headers.host}`);
    }
    getAccessToken(req: IncomingMessage): AccessToken | null {
        const url = this.buildUrl(req);

        const value = req.headers.authorization?.replace(/^Bearer\s+/i, "") ?? url.searchParams.get("token");

        return value ? new AccessToken(value) : null;
    }

    async handle(ws: WebSocket, req: IncomingMessage): Promise<void> {
        logger.info(
            "New websocket-server connection established",
        );

        const token = this.getAccessToken(req);

        if (!token?.value) {
            ws.close();
            logger.error("❌ Token is missing");
            return;
        }

        let userId: Id;

        try {
            userId = this.authService.verifyAccessToken(token);
        } catch {
            ws.close();
            logger.error("❌ JWT token is invalid");
            return;
        }

        const url = this.buildUrl(req);

        const profileId = new Id(url.searchParams.get("profileId") ?? "");

        try {
            if (!this.authorizeProfileUseCase.execute(userId, profileId, token)) {
                ws.close();

                logger.error(
                    "❌ JWT token does not match to profile",
                );

                return;
            }
        } catch {
            ws.close();
            logger.error(
                "❌ Failed to authorize profile",
            );

            return;
        }

        const encoding =
            req.headers["x-debug-json"] !== undefined
                ? SocketEncoding.PLAIN
                : SocketEncoding.PROTOBUF;

        this.battleWebsocketsRegistry.registerSocket(ws, profileId, encoding);

        const handler = this.handlers.get(url.pathname);

        if (!handler) {
            logger.warn(
                `Unknown websocket route: ${url.pathname}`,
            );

            ws.close();
            return;
        }

        ws.on("message", data => {
            try {
                const request =
                    this.decodeMessage(data, encoding);

                void handler.handle(
                    ws,
                    token,
                    profileId,
                    request,
                    encoding,
                );
            } catch (err) {
                logger.error(
                    {err},
                    "WebSocket message handling failed",
                );
            }
        });

        ws.on("close", () => {
            void this.disconnect(ws, profileId);
        });

        ws.on("error", err => {
            logger.error(err);
        });
    }

    private decodeMessage(
        data: RawData,
        encoding: SocketEncoding,
    ): streamingProto.BattleRequest {
        return encoding === SocketEncoding.PLAIN
            ? JSON.parse(data.toString())
            : streamingProto.BattleRequest.decode(
                data as Uint8Array,
            );
    }

    private async disconnect(
        ws: WebSocket,
        profileId: Id,
    ): Promise<void> {

        // const context = this.wsSocketContextStateStore.get(ws);
        //
        // if (!context) {
        //     return;
        // }
        //
        // await Promise.all(
        //     // [...context.battleIds].map((id: Id) => battleService.leave(id, profileId))
        //     [...context.battleIds].map((battleId: Id) => this.battleLeaveUseCase(id, profileId))
        // );
        //
        // this.wsSocketContextStateStore.delete(ws);
    }
}

export default ConnectionHandler;
