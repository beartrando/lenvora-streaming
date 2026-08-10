import {WebSocketServer} from "ws";
import logger from "@shared/logger";
import WebsocketConfig from "./types";

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

        await new Promise<void>((resolve, reject) => {
            this.wss!.once("listening", resolve);
            this.wss!.once("error", reject);
        });

        logger.info(
            `WebSocket listening on ${this.config.port}`,
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
}

export default WebsocketService;
