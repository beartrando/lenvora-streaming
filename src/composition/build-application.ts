import Application from "../application/application";

import GrpcService from "../infrastructure/grpc/service";

import AuthService from "../infrastructure/auth/service";
import authConfig from "../infrastructure/auth/auth.config";

import CacheService from "../infrastructure/cache/service";
import redisConfig from "../infrastructure/cache/configs/redis.config";
// import StateStoreService from "../infrastructure/state-store/service";

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
import AuthorizeProfileUseCase from "../application/use-cases/auth/authorize-profile";
import ProfileClient from "../infrastructure/grpc/clients/profile.client";
import StateStore from "../infrastructure/state-store/state-stores/state-store";
import Id from "../domain/common/value-objects/id.vo";

import {WebSocket,} from "ws";
import SocketEncoding from "../infrastructure/websocket-server/enums/socket-encoding";
import BattleLeaveUseCase from "../application/use-cases/battle/battle-leave";
import BattleClient from "../infrastructure/grpc/clients/battle.client";



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
    // const stateStoreService = new StateStoreService();

    // const battleStateStore = new CachedIdStateStore(
    //     battleCacheStore,
    // );
    //
    // stateStoreService.register(
    //     "battle",
    //     battleStateStore,
    // );

    const profileClinent = new ProfileClient(grpcConfig.serviceProfileUrl);

    const authorizeProfileUseCase = new AuthorizeProfileUseCase(
        profileClinent,
    );

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

    const battleClient = new BattleClient(grpcConfig.serviceBattleUrl);
    const battleLeaveUseCase = new BattleLeaveUseCase(battleClient);

    const wsProfileStateStore = new StateStore<WebSocket, Id>();
    const wsEncodingStateStore = new StateStore<WebSocket, SocketEncoding>();
    const wsBattlesStateStore = new StateStore<WebSocket, Set<Id>>();
    const battleWsStateStore = new StateStore<Id, Set<WebSocket>>();

    const battleConnectionHandler = new BattleConnectionHandler(
        authService,
        authorizeProfileUseCase,
        wsProfileStateStore,
        wsEncodingStateStore,
        wsBattlesStateStore,
        battleWsStateStore,
        battleLeaveUseCase
    );



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
        // stateStoreService,
        jobService,
        messageService,
        cacheService,
        websocketService,
        engineStreamService,
        timerService,
    );
}

export default buildApplication;
