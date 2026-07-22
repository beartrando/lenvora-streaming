import grpcServer from './grpc/server';
import * as grpc from '@grpc/grpc-js';

import logger from '@shared/logger';

import kafkaConfig, {
    kafkaConsumersConfig,
    kafkaProducersConfig,
} from './config/kafka.config';

import { createConsumer } from '@shared/kafka-manager';

import pgBossManager from '@shared/pg-boss-manager';
import pgBossConfig from './config/pg.boss.config';
import {initWss} from "./websocket/server";
import engineStream from "./grpc/channels/engine.stream";

const GRPC_PORT =
    process.env.GRPC_PORT ?? '50051';

async function startGrpc(): Promise<void> {
    return new Promise<void>(
        (resolve, reject) => {
            grpcServer.bindAsync(
                `0.0.0.0:${GRPC_PORT}`,
                grpc.ServerCredentials.createInsecure(),
                (err, port) => {
                    if (err) {
                        logger.error(
                            { err },
                            '❌ Failed to start gRPC',
                        );
                        return reject(err);
                    }
                    logger.info(
                        `🟢 gRPC server started on port ${port}`,
                    );
                    resolve();
                },
            );
        },
    );
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

async function startPgBoss(): Promise<void> {

    void pgBossManager.start(
        pgBossConfig,
    );


    await initKafkaBridge();
}

async function initKafkaBridge(): Promise<void> {
    const topics = Object.values(
        kafkaProducersConfig,
    );
    while (true) {
        try {
            for (const topic of topics) {
                await pgBossManager.kafka.start(
                    kafkaConfig,
                    topic,
                );
            }
            logger.info(
                '✅ PgBoss Kafka bridge initialized',
            );
            return;
        } catch (err) {
            logger.warn(
                { err },
                '⏳ Waiting for PgBoss/Kafka bridge initialization...',
            );
            await sleep(3000);
        }
    }
}

async function createKafkaConsumers(): Promise<void> {
    const configs = Object.values(
        kafkaConsumersConfig,
    );
    await Promise.all(
        configs.map(
            async ({ topic, handler }) => {

                await createConsumer(
                    kafkaConfig,
                    {
                        topic,
                        handler,
                    },
                );
            },
        ),
    );
}



async function bootstrap(): Promise<void> {
    try {
        await startGrpc();
        await createKafkaConsumers();
        await startPgBoss();
        await startWebSocket();
        await startGRpcStreamToEngineService();
        logger.info(
            '🚀 Battle service started',
        );
    } catch (err) {
        logger.error(
            { err },
            '💥 Failed to start Battle',
        );
        process.exit(1);
    }

    process.on(
        'SIGINT',
        async () => {
            logger.info(
                '🛑 Shutting down...',
            );
            grpcServer.forceShutdown();
            await pgBossManager.stop();
            process.exit(0);
        },
    );
}

function sleep(
    ms: number,
): Promise<void> {
    return new Promise(
        resolve => setTimeout(resolve, ms),
    );
}

bootstrap();
