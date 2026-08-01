import {RawData, WebSocket, WebSocketServer} from 'ws';
import * as streamingProto from "../grpc/generated/streaming";
import {battleHandler, isAllowedUser} from "./handlers/battle.handler";
import config from "../config/config";
import logger from "@shared/logger";
import frontBattleStreamRegistry, {SocketEncoding} from "./channels/front.battle.stream";
import {getUserIdFromJwt} from "../lib/grpcRequestMetadata";
import * as battleService from "../services/battle.service";


export const wss = new WebSocketServer({port: config.webSocketPort});
logger.info(`WebSocket listening on ${config.webSocketPort}`);

function decodeMessage(
    data: RawData,
    encoding: SocketEncoding,
): streamingProto.BattleRequest {
    return (encoding === SocketEncoding.PLAIN)
        ? JSON.parse(data.toString())
        : streamingProto.BattleRequest.decode(data as Uint8Array);
}

const handlers: Record<
    string,
    (
        ws: WebSocket,
        token: string,
        profileId: string,
        request: streamingProto.BattleRequest,
        encoding: SocketEncoding
    ) => Promise<void>
> = {
    "/battle": battleHandler,
};

export function initWss() {
    wss.on('connection', async (ws, req) => {

        logger.info('New websocket connection established');

        const url = new URL(req.url!, `http://${req.headers.host}`);
        let userId: string;

        const token =
            req.headers.authorization?.replace(/^Bearer\s+/i, "") ??
            url.searchParams.get("token");
        if (!token) {
            ws.close();
            logger.error("❌ Token is missing");
            return;
        }

        try {
            userId = getUserIdFromJwt(token);//области видимости!
        } catch (e) {
            ws.close();
            logger.error("❌ JWT token is invalid")
            return;
        }

        const profileId = url.searchParams.get('profileId') ?? '';

        // logger.log(token);
        // logger.log(userId);
        // logger.log(profileId);
        try {
            await isAllowedUser(userId, profileId, token);
        } catch (e) {
            ws.close();
            logger.log('userId', userId);
            logger.log('profileId', profileId);
            logger.error("❌ JWT token does not match to profile");
            return;
        }


        const encoding =
            req.headers["x-debug-json"] !== undefined
                ? SocketEncoding.PLAIN
                : SocketEncoding.PROTOBUF;

        frontBattleStreamRegistry.registerSocket(
            ws,
            profileId,
            encoding
        );

        ws.on('message', (data) => {
            // console.log("📩 Streaming got the message");
            // console.log("📩 Raw length:", (data as Buffer).length);
            try {
                const request = decodeMessage(data, encoding);

                const handler = handlers[url.pathname];

                if (!handler) {
                    logger.warn(`Unknown websocket route: ${url.pathname}`);
                    ws.close();
                    return;
                }

                void handler(ws, token, profileId, request, encoding);

            } catch (err) {
                logger.error("WebSocket message handling failed", err);
            }
        });

        // // широковещательная рассылка всем клиентам
        // wss.clients.forEach((client) => {
        //   if (client.readyState === ws.OPEN) {
        //     client.send(JSON.stringify(msg));
        //   }
        // });

        ws.on('close', () => disconnect(ws, profileId));

        ws.on("error", err => {
            logger.error(err);
        });
    });
}

const disconnect = async (ws: WebSocket, profileId: string) => {
    const context = frontBattleStreamRegistry.getSocketContext(ws);

    if (!context) {
        logger.warn("Disconnect: socket is not registered");
        return;
    }

    await Promise.all(
        [...context.battleIds].map(id => battleService.leave(id, profileId))
    );

    frontBattleStreamRegistry.unregisterSocket(ws);
};

logger.log('WebSocket server is started at ws://localhost:8080');

export default wss;
