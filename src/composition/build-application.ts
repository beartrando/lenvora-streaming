import Application from "../application/application";

import GrpcService from "../infrastructure/grpc/service";

import AuthService from "../infrastructure/auth/service";
import authConfig from "../infrastructure/auth/auth.config";

import CacheService from "../infrastructure/cache/service";
import redisConfig from "../infrastructure/cache/configs/redis.config";
import StateStoreService from "../infrastructure/state-store/service";

import JobService from "../infrastructure/job/service";
import jobConfig from "../infrastructure/job/job.config";
import messageConfig from "../infrastructure/message/configs/message.config";
import messageProducersConfig from "../infrastructure/message/configs/producers.config";

import TimerService from "../infrastructure/timer/service";
import TimerCallbackFactoryRegistry from "../infrastructure/timer/callback-factory-registry";
import grpcConfig from "../infrastructure/grpc/configs/grpc.config";
import HealthUseCase from "../application/use-cases/health/health";
import websocketConfig from "../infrastructure/websocket-server/configs/websocket.config";
import MessageService from "../infrastructure/message/service";
import WebsocketService from "../infrastructure/websocket-server/service";
import StatusUseCase from "../application/use-cases/health/status";
import LivezUseCase from "../application/use-cases/health/livez";
import ReadyzUseCase from "../application/use-cases/health/readyz";
import HealthHandler from "../infrastructure/grpc/handlers/health.handler";
import messageConsumersConfig from "../infrastructure/message/configs/consumers.config";
import EngineStreamService from "../infrastructure/engine-stream/service";
import battleConnectionHandler from "../infrastructure/websocket-server/connection-handlers/battle-connection.handler";
import BattleConnectionHandler from "../infrastructure/websocket-server/connection-handlers/battle-connection.handler";


function buildApplication() {
    const authService = new AuthService(authConfig);
    const timerService = new TimerService();
    const timerCallbackFactoryRegistry = new TimerCallbackFactoryRegistry();
    const cacheService = new CacheService(redisConfig);

    const jobService = new JobService(
        jobConfig,
        messageConfig,
        messageProducersConfig,
    );
    //
    // // Cache stores
    // const battleCacheStore = new CacheStore(
    //     "battle:",
    //     "battle:index",
    //     BattleRedisMapper,
    // );
    //
    // cacheService.register(
    //     "battle",
    //     battleCacheStore,
    // );
    //
    // // State stores
    const stateStoreService = new StateStoreService();

    // const battleStateStore = new StateStore(
    //     battleCacheStore,
    // );
    //
    // stateStoreService.register(
    //     "battle",
    //     battleStateStore,
    // );

    // // Battle use cases
    // const battleStartUseCase = new BattleStartUseCase(
    //     battleStateStore,
    //     timerService,
    //     timerCallbackFactoryRegistry,
    //     jobService,
    //     messageProducersConfig.battleStarted,
    //     domainBattleConfig.battleTurnTimeLimit,
    // );
    //
    // const battleMoveUseCase = new BattleMoveUseCase(
    //     battleStateStore,
    //     timerService,
    //     timerCallbackFactoryRegistry,
    //     jobService,
    //     messageProducersConfig.battleUpdated,
    //     domainBattleConfig.battleTurnTimeLimit,
    // );
    //
    // const battleLeaveUseCase = new BattleLeaveUseCase(
    //     battleStateStore,
    //     timerService,
    //     timerCallbackFactoryRegistry,
    //     jobService,
    //     messageProducersConfig.battleUpdated
    // );
    //
    // const battleTimeoutUseCase = new BattleTimeoutUseCase(
    //     battleStateStore,
    //     timerService,
    //     timerCallbackFactoryRegistry,
    //     jobService,
    //     messageProducersConfig.battleUpdated,
    // );
    //
    // // Timer callbacks
    // const battleTimeoutCallbackFactory = new BattleTimeoutCallbackFactory(
    //     battleTimeoutUseCase,
    // );
    //
    // timerCallbackFactoryRegistry.register(
    //     battleTimeoutCallbackFactory,
    // );
    //
    // // Message consumers
    // const battleStartedConsumer = new BattleStartedConsumer(
    //     battleStartUseCase,
    // );

    const messageService = new MessageService(
        messageConfig,
        messageConsumersConfig,
        // battleStartedConsumer,
    );

    const battleConnectionHandler = new BattleConnectionHandler();
    const websocketService = new WebsocketService(
        websocketConfig,
        battleConnectionHandler,
    );

    const engineStreamService = new EngineStreamService(
        // websocketConfig,
    );

    const healthUseCase = new HealthUseCase(
        jobService,
        messageService,
        cacheService,
        websocketService,
        engineStreamService,
    );

    const statusUseCase = new StatusUseCase();
    const livezUseCase = new LivezUseCase();
    const readyzUseCase = new ReadyzUseCase();

    // // Handlers
    // const engineHandler = new EngineHandler(
    //     battleStartUseCase,
    //     battleMoveUseCase,
    //     battleLeaveUseCase,
    // );
    //
    const healthHandler = new HealthHandler(
        healthUseCase,
        statusUseCase,
        livezUseCase,
        readyzUseCase,
    );

    const grpcService = new GrpcService(
        grpcConfig.port,
        // engineHandler,
        healthHandler,
    );


    return new Application(
        grpcService,
        stateStoreService,
        jobService,
        messageService,
        cacheService,
        websocketService,
        engineStreamService,
        timerService,
    );
}

export default buildApplication;
