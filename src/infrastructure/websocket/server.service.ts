import {WebSocketServer} from "ws";
import logger from "@shared/logger";
import WebsocketServerConfig from "./types/websocket-server-config";
import WebsocketConnectionHandlerInterface from "./interfaces/websocket-connection-handler.interface";
import HeartbeatWebSocket from "./types/heartbeat-websocket";


export class WebsocketServerService {
    private wss: WebSocketServer | null = null;
    private heartbeatInterval: NodeJS.Timeout | null = null;

    constructor(
        private readonly config: WebsocketServerConfig,
        private readonly connectionHandler: WebsocketConnectionHandlerInterface,
    ) {
    }

    async start(): Promise<void> {
        if (this.wss) {
            return;
        }

        this.wss = new WebSocketServer({
            port: this.config.port,
        });

        this.wss.on("connection", (ws, req) => {
            const socket = ws as HeartbeatWebSocket;

            socket.isAlive = true;

            socket.on("pong", () => {
                socket.isAlive = true;
            });

            void this.connectionHandler.handle(ws, req);
        });

        await new Promise<void>((resolve, reject) => {
            this.wss!.once("listening", resolve);
            this.wss!.once("error", reject);
        });

        this.heartbeatInterval = setInterval(() => {
            if (!this.wss) {
                return;
            }

            // logger.log('heartbeatInterval', this.wss.clients.size);

            for (const ws of this.wss.clients) {
                const socket = ws as HeartbeatWebSocket;

                if (!socket.isAlive) {
                    logger.warn("💀 WebSocket heartbeat timeout, terminating connection");

                    socket.terminate();
                    continue;
                }

                socket.isAlive = false;
                socket.ping();
            }
        }, 5000);

        logger.info(`🚀 WebSocket listening on ${this.config.port}`);
    }

    async stop(): Promise<void> {
        if (!this.wss) {
            return;
        }

        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
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
        return this.wss?.address() != null;
    }
}

export default WebsocketServerService;
