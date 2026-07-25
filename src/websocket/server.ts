import {RawData, WebSocket, WebSocketServer} from 'ws';
import * as streamingGrpc from "../grpc/generated/streaming";
import {battleHandler, isAllowedUser} from "./handlers/battle.handler";
import config from "../config/config";
import logger from "@shared/logger";
import frontBattleStreamRegistry, {SocketEncoding} from "./channels/front.battle.stream";
import {getUserIdFromJwt} from "../lib/grpcRequestMetadata";


export const wss = new WebSocketServer({port: config.webSocketPort});
logger.info(`WebSocket listening on ${config.webSocketPort}`);

function decodeBattleRequest(data: RawData, encoding: SocketEncoding) {
    let request;
    // const {encoding} = frontBattleStreamRegistry.getSocketContext(ws);
    if (encoding == SocketEncoding.PLAIN) {
        const str = data.toString();
        request = JSON.parse(str);
        console.log("✅ Parsed JSON:", request);
        // frontBattleStreamRegistry.subscribeBattle(ws);
    } else {
        const buffer = new Uint8Array(data as ArrayBuffer);
        request = streamingGrpc.BattleStreamRequest.decode(buffer);
        console.log("Decoded:", request);
    }

    return request;
}

const handlers: Record<
    string,
    (
        ws: WebSocket,
        profileId: string,
        token: string,
        request: streamingGrpc.BattleStreamRequest,
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
        let profileId: string;

        const token =
            req.headers.authorization?.replace(/^Bearer\s+/i, "") ??
            url.searchParams.get("token");
        if (!token) {
            ws.close();
            logger.error("❌ Token is missing");
            return;
        }
        try {
            userId = getUserIdFromJwt(token);
        } catch (e) {
            ws.close();
            logger.error("❌ JWT token is invalid")
            return;
        }

        profileId = url.searchParams.get('profileId') ?? '';

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
                const request = decodeBattleRequest(data, encoding);

                const handler = handlers[url.pathname];

                if (!handler) {
                    logger.warn(`Unknown websocket route: ${url.pathname}`);
                    ws.close();
                    return;
                }

                handler(ws, token, profileId, request, encoding);

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

        // ws.on('disconnect', () => {
        //     const context = frontBattleStreamRegistry.getSocketContext(ws);
        //     // const {profileId} = context;
        //     const {battleIds} = context;
        //     for (const battleId of battleIds) {
        //         leaveBattle(profileId, battleId);
        //     }
        // });

        // ws.on('close', () => {
        //     // logger.log('❌ Client is disconnected');
        //     frontBattleStreamRegistry.deleteBattleStream(ws);
        // });
        //
        // ws.on('error', () => frontBattleStreamRegistry.deleteBattleStream(ws));
        //
        // ws.on('end', () => frontBattleStreamRegistry.deleteBattleStream(ws));

    });
}

logger.log('WebSocket server is started at ws://localhost:8080');

export default wss;
