import buildApplication from "./composition/build-application";


const application = buildApplication();

application.start();


//
//
//
//
// import grpcServer from './grpc/server';
// import * as grpc from '@grpc/grpc-js';
// import {initRedis} from "./lib/redis-client";
//
// import logger from '@shared/logger';
// import {StoreRegistry} from "./services/store-registry";
//
// import config, {messageConsumersConfig, messageProducersConfig,} from './appConfig/kafka.appConfig';
//
// import {createConsumer} from '@shared/kafka-manager';
//
// import pgBossManager from '@shared/pg-boss-manager';
// import pgBossConfig from './appConfig/pg-boss.appConfig';
//
// const GRPC_PORT =
//     process.env.GRPC_PORT ?? '50051';
//
// async function startProto(): Promise<void> {
//     return new Promise<void>(
//         (resolve, reject) => {
//             grpcServer.bindAsync(
//                 `0.0.0.0:${GRPC_PORT}`,
//                 grpc.ServerCredentials.createInsecure(),
//                 (err, port) => {
//                     if (err) {
//                         logger.error(
//                             {err},
//                             '❌ Failed to start gRPC',
//                         );
//
//                         return reject(err);
//                     }
//                     logger.info(
//                         `🟢 gRPC server started on port ${port}`,
//                     );
//                     resolve();
//                 },
//             );
//         },
//     );
// }
//
// async function startPgBoss(): Promise<void> {
//     void pgBossManager.start(pgBossConfig);
//
//     await pgBossManager.waitUntilReady();
//
//     await initKafkaBridge();
// }
//
// async function initKafkaBridge(): Promise<void> {
//     const topics = Object.values(
//         messageProducersConfig,
//     );
//
//     while (true) {
//         try {
//             for (const topic of topics) {
//                 await pgBossManager.kafka.start(
//                     config,
//                     topic,
//                 );
//             }
//             logger.info(
//                 '✅ PgBoss Kafka bridge initialized',
//             );
//             return;
//         } catch (err) {
//             logger.warn(
//                 {err},
//                 '⏳ Waiting for PgBoss/Kafka bridge initialization...',
//             );
//             await sleep(3000);
//         }
//     }
// }
//
// async function retryKafkaInit(
//     fn: () => Promise<void>,
// ): Promise<void> {
//     while (true) {
//         try {
//             await fn();
//             logger.info(
//                 '✅ Kafka initialized',
//             );
//             return;
//         } catch (err) {
//             logger.warn(
//                 {err},
//                 '⏳ Waiting for Kafka topics...',
//             );
//             await sleep(3000);
//         }
//     }
// }
//
// async function createKafkaConsumers(): Promise<void> {
//     const configs = Object.values(
//         messageConsumersConfig,
//     );
//     await retryKafkaInit(
//         async () => {
//             await Promise.all(
//                 configs.map(
//                     async ({topic, handler}) => {
//                         await createConsumer(
//                             config,
//                             {
//                                 topic,
//                                 handler,
//                             },
//                         );
//                     },
//                 ),
//             );
//         },
//     );
// }
//
// async function startRedis() {
//     await initRedis();
//     // logger.log('startRedis');
//     await StoreRegistry.start();
// }
//
// async function bootstrap(): Promise<void> {
//
//     try {
//         await startProto();
//         await startPgBoss();
//         await createKafkaConsumers();
//         await startRedis();
//         logger.info(
//             '🚀 Engine service started',
//         );
//     } catch (err) {
//         logger.error(
//             {err},
//             '💥 Failed to start Battle',
//         );
//         process.exit(1);
//     }
//
//     process.on(
//         'SIGINT',
//         async () => {
//             logger.info(
//                 '🛑 Shutting down...',
//             );
//             grpcServer.forceShutdown();
//             await pgBossManager.stop();
//             process.exit(0);
//         },
//     );
// }
//
// function sleep(
//     ms: number,
// ): Promise<void> {
//     return new Promise(
//         resolve => setTimeout(resolve, ms),
//     );
// }
//
// bootstrap();
