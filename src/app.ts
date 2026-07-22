import grpcServer from './grpc/server';
import * as grpc from '@grpc/grpc-js';
import logger from '@shared/logger';
import kafkaConfig, {kafkaProducersConfig} from "./config/kafka.config";
import {initWss} from "./websocket/server";
import config from "./config/config";
import engineStream from "./grpc/channels/engine.stream";
import pgBossManager from "@shared/pg-boss-manager";
import pgBossConfig from "./config/pg.boss.config";


const GRPC_PORT = Number(config.grpcPort);

async function startGrpc() {
    return new Promise<void>((resolve, reject) => {
        grpcServer.bindAsync(
            `0.0.0.0:${GRPC_PORT}`,
            grpc.ServerCredentials.createInsecure(),
            (err, port) => {
                if (err) {
                    logger.error('❌ Failed to start gRPC:', err);
                    return reject(err);
                }
                logger.info(`🟢 gRPC server started on port ${port}`);
                resolve();
            }
        );
    });
}

async function startWebSocket() {
    return new Promise<void>(async () => {
        initWss();
    });
}

async function startGRpcStreamToEngineService() {
    return new Promise<void>(() => {
        engineStream.connect();
    });
}

async function startPgBoss() {
    await pgBossManager.start(
        pgBossConfig,
    );

    for (const topic of Object.values(kafkaProducersConfig)) {
        await pgBossManager.kafka.start(
            kafkaConfig,
            topic,
        );
    }
}

async function bootstrap() {
    try {
        await Promise.all([
            startGrpc(),
            startPgBoss(),
            // createKafkaConsumers(),
            startWebSocket(),
            startGRpcStreamToEngineService()
        ]);
        logger.info('🚀 Streaming successfully started');
    } catch (err) {
        logger.error('💥 Failed to start Streaming:', err);
        process.exit(1);
    }

    process.on('SIGINT', () => {
        logger.info('🛑 Shutting down...');
        grpcServer.forceShutdown();
        process.exit(0);
    });
}

bootstrap();
