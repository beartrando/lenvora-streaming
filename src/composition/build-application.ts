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
import AuthorizeProfileUseCase from "../application/use-cases/auth/authorize-profile";
import ProfileClient from "../infrastructure/grpc/clients/profile.client";
import StateStore from "../infrastructure/state-store/state-stores/state-store";
import Id from "../domain/common/value-objects/id.vo";

import {WebSocket,} from "ws";
import SocketEncoding from "../infrastructure/websocket-server/enums/socket-encoding";
import BattleLeaveUseCase from "../application/use-cases/battle/battle-leave";
import BattleClient from "../infrastructure/grpc/clients/battle.client";
import ConnectionHandler from "../infrastructure/websocket-server/connection.handler";
import SocketContext from "../infrastructure/websocket-server/types/socket-context";
import BattleWebsocketsRegistry from "../infrastructure/websocket-server/registers/battle-websockets.registry";
import TimerServiceInterface from "../infrastructure/timer/interfaces/timer-service.interface";
import BattleTimeoutCallbackFactory from "../infrastructure/timer/callbacks/battle-timeout-callback-factory";



function buildApplication() {
    const authService = new AuthService(authConfig);
    const battleTimeoutCallbackFactory = new BattleTimeoutCallbackFactory();
    const timerService = new TimerService(battleTimeoutCallbackFactory);
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
    // cacheService.registerHandler(
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
    // stateStoreService.registerHandler(
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
    // timerCallbackFactoryRegistry.registerHandler(
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

    const wsSocketContextStateStore = new StateStore<WebSocket, SocketContext>();
    const battleWsStateStore = new StateStore<Id, Set<WebSocket>>();
    const heartbeatTimers = new TimerService();

    const battleWebsocketsRegistry = new BattleWebsocketsRegistry(
        wsSocketContextStateStore,
        battleWsStateStore,
        heartbeatTimers,
    );

    const battleConnectionHandler = new ConnectionHandler(
        authService,
        authorizeProfileUseCase,
        battleLeaveUseCase,
        battleWebsocketsRegistry,
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
