import {RawData, WebSocket, WebSocketServer} from 'ws';
import * as streamingProto from "../grpc/generated/streaming";
import {battleHandler, isAllowedUser} from "./handlers/battle.handler";
import config from "../configs/configs";
import logger from "@shared/logger";
import frontBattleStreamRegistry, {SocketEncoding} from "./channels/front.battle.stream";
import {getUserIdFromJwt} from "../lib/grpcRequestMetadata";
import * as battleService from "../services/battle.service";


export const wss = new WebSocketServer({port: config.webSocketPort});
logger.info(`WebSocket listening on ${config.webSocketPort}`);

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
