import logger from "@shared/logger";
import GrpcService from "../infrastructure/grpc/service";
import JobService from "../infrastructure/job/service";
import MessageService from "../infrastructure/message/service";
import WebsocketServerService from "../infrastructure/websocket/server.service";

export class Application {
    constructor(
        private readonly grpcService: GrpcService,
        private readonly jobService: JobService,
        private readonly messageService: MessageService,
        private readonly websocketService: WebsocketServerService,
    ) {
    }

    async start(): Promise<void> {
        const shutdown = async () => {
            logger.info("🛑 Shutting down...");

            await this.stop();

            process.exit(0);
        };

        process.on("SIGINT", shutdown);
        process.on("SIGTERM", shutdown);

        try {
            await this.messageService.start();
            await this.jobService.start();
            await this.grpcService.start();
            await this.websocketService.start();
            logger.info(
                '🚀 Streaming service started',
            );
        } catch (err) {
            logger.error(
                {err},
                '💥 Failed to start Streaming service',
            );
            process.exit(1);
        }
    }

    async stop() {
        await this.websocketService.stop();
        await this.grpcService.stop();
        await this.jobService.stop();
        await this.messageService.stop();
    }
}

export default Application;
