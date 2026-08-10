import {
    RawData,
    WebSocket,
    WebSocketServer,
} from "ws";
import * as streamingProto from "../grpc/generated/streaming";
import config from "../config/config";
import logger from "@shared/logger";
import frontBattleStreamRegistry, {
    SocketEncoding,
} from "./channels/front.battle.stream";
import {getUserIdFromJwt} from "../lib/grpcRequestMetadata";
import * as battleService from "../services/battle.service";
import {
    battleHandler,
    isAllowedUser,
} from "./handlers/battle.handler";
import WebsocketConfig from "./config";

export class WebsocketService {
    private wss: WebSocketServer | null = null;

    constructor(
        private readonly config: WebsocketConfig,
    ) {
    }

    async start(): Promise<void> {
        if (this.wss) {
            return;
        }

        this.wss = new WebSocketServer({
            port: this.config.port,
        });

        this.wss.on(
            "connection",
            (ws, req) => this.handleConnection(ws, req),
        );

        await new Promise<void>((resolve, reject) => {
            this.wss!.once("listening", resolve);
            this.wss!.once("error", reject);
        });

        logger.info(
            `🚀 WebSocket listening on ${this.config.port}`,
        );
    }

    async stop(): Promise<void> {
        if (!this.wss) {
            return;
        }

        const wss = this.wss;

        await new Promise<void>((resolve, reject) => {
            wss.close(error => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve();
            });
        });

        this.wss = null;

        logger.info("🛑 Websocket service stopped");
    }

    async check(): Promise<boolean> {
        return this.wss?.address() !== null;
    }

    private async handleConnection(
        ws: WebSocket,
        req: IncomingMessage,
    ): Promise<void> {
        logger.info(
            "New websocket-server connection established",
        );

        const url = new URL(
            req.url!,
            `http://${req.headers.host}`,
        );

        const token =
            req.headers.authorization?.replace(
                /^Bearer\s+/i,
                "",
            ) ??
            url.searchParams.get("token");

        if (!token) {
            ws.close();
            logger.error("❌ Token is missing");
            return;
        }

        let userId: string;

        try {
            userId = getUserIdFromJwt(token);
        } catch {
            ws.close();
            logger.error("❌ JWT token is invalid");
            return;
        }

        const profileId =
            url.searchParams.get("profileId") ?? "";

        try {
            await isAllowedUser(
                userId,
                profileId,
                token,
            );
        } catch {
            ws.close();
            logger.error(
                "❌ JWT token does not match to profile",
            );
            return;
        }

        const encoding =
            req.headers["x-debug-json"] !== undefined
                ? SocketEncoding.PLAIN
                : SocketEncoding.PROTOBUF;

        frontBattleStreamRegistry.registerSocket(
            ws,
            profileId,
            encoding,
        );

        ws.on("message", data => {
            void this.handleMessage(
                ws,
                url.pathname,
                token,
                profileId,
                encoding,
                data,
            );
        });

        ws.on("close", () => {
            void this.disconnect(ws, profileId);
        });

        ws.on("error", err => {
            logger.error(err);
        });
    }

    private async handleMessage(
        ws: WebSocket,
        pathname: string,
        token: string,
        profileId: string,
        encoding: SocketEncoding,
        data: RawData,
    ): Promise<void> {
        try {
            const request = this.decodeMessage(
                data,
                encoding,
            );

            const handler = this.handlers[pathname];

            if (!handler) {
                logger.warn(
                    `Unknown websocket route: ${pathname}`,
                );

                ws.close();
                return;
            }

            await handler(
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
        profileId: string,
    ): Promise<void> {
        const context =
            frontBattleStreamRegistry.getSocketContext(ws);

        if (!context) {
            logger.warn(
                "Disconnect: socket is not registered",
            );

            return;
        }

        await Promise.all(
            [...context.battleIds].map(
                id => battleService.leave(
                    id,
                    profileId,
                ),
            ),
        );

        frontBattleStreamRegistry.unregisterSocket(ws);
    }

    private readonly handlers = {
        "/battle": battleHandler,
    };
}

export default WebsocketService;