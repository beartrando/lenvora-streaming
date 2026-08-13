import {WebSocketServer,} from "ws";
import logger from "@shared/logger";
import WebsocketConfig from "./types/websocket-config";
import WebsocketConnectionHandlerInterface from "./interfaces/websocket-connection-handler.interface";

export class WebsocketServerService {
    private wss: WebSocketServer | null = null;

    constructor(
        private readonly config: WebsocketConfig,
        private readonly connectionHandler: WebsocketConnectionHandlerInterface,
    ) {
    }

    async start(): Promise<void> {
        if (this.wss) {
            return;
        }

        this.wss = new WebSocketServer({port: this.config.port});

        this.wss.on(
            "connection",
            (ws, req) => {
                void this.connectionHandler.handle(ws, req);
            }
        );

        await new Promise<void>((resolve, reject) => {
            this.wss!.once("listening", resolve);
            this.wss!.once("error", reject);
        });

        logger.info(`🚀 WebSocket listening on ${this.config.port}`);
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

    // const disconnect = async (ws: WebSocket, profileId: string) => {
    //     const context = frontBattleStreamRegistry.getSocketContext(ws);
    //
    //     if (!context) {
    //         logger.warn("Disconnect: socket is not registered");
    //         return;
    //     }
    //
    //     await Promise.all(
    //         [...context.battleIds].map(id => battleService.leave(id, profileId))
    //     );
    //
    //     frontBattleStreamRegistry.unregisterSocket(ws);
    // };
    async check(): Promise<boolean> {
        return this.wss?.address() != null;
    }
}

export default WebsocketServerService;