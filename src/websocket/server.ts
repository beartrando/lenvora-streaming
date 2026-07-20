import {WebSocketServer} from 'ws';
import * as streamingGrpc from "../grpc/generated/streaming";
import {battleHandler, isAllowedUser} from "./handlers/battle.handler";
import config from "../config/config";
import logger from "@shared/logger";
import frontBattleStreamRegistry from "./channels/front.battle.stream";
import {getUserIdFromJwt} from "../lib/grpcRequestMetadata";
import {getJwtFromWs} from "../lib/wsRequestMetadata";


export const wss = new WebSocketServer({port: config.webSocketPort});
logger.info(`WebSocket listening on ${config.webSocketPort}`);

export function initWss() {
    wss.on('connection', async (ws, req) => {

        // logger.info('New websocket connection established');

        const url = new URL(req.url!, `http://${req.headers.host}`);
        let userId: string;
        let profileId: string;

        const token = url.searchParams.get('token');
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

        // logger.log(userId);
        // logger.log(profileId);
        try {
            await isAllowedUser(userId, profileId, getJwtFromWs(ws));
        } catch (e) {
            ws.close();
            logger.log('userId', userId);
            logger.log('profileId', profileId);
            logger.error("❌ JWT token does not match to profile");
            return;
        }

        ws.on('message', (data) => {
            // console.log("📩 Raw length:", (data as Buffer).length);
            try {

                const str = data.toString();
                let request;
                if (str.startsWith("{")) {
                    request = JSON.parse(str);
                    console.log("✅ Parsed JSON:", request);
                    frontBattleStreamRegistry.setSocketEncodingTypeToString(ws);
                } else {
                    const buffer = new Uint8Array(data as ArrayBuffer);
                    request = streamingGrpc.BattleStreamRequest.decode(buffer);
                    console.log("Decoded:", request);
                }

                try {
                    if (url.pathname.startsWith('/battle')) {
                        battleHandler(ws, profileId, request);
                    } else {
                        logger.warn(`⚠️ Unknown path: ${url.pathname}`);
                    }
                } catch (err) {
                    logger.error('❌ Message handling error:', err);
                }

            } catch (err) {
                logger.error('❌ JSON parse error:', err);
            }
        });


        // // широковещательная рассылка всем клиентам
        // wss.clients.forEach((client) => {
        //   if (client.readyState === ws.OPEN) {
        //     client.send(JSON.stringify(msg));
        //   }
        // });

        ws.on('close', () => {
            // logger.log('❌ Client is disconnected');
            frontBattleStreamRegistry.deleteBattleStream(ws);
        });

        ws.on('error', () => frontBattleStreamRegistry.deleteBattleStream(ws));

        ws.on('end', () => frontBattleStreamRegistry.deleteBattleStream(ws));

    });
}

logger.log('WebSocket server is started at ws://localhost:8080');

export default wss;
