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
import GrpcStreamService from "../infrastructure/grpc-stream/service";
import AuthorizeProfileUseCase from "../application/use-cases/auth/authorize-profile";
import ProfileClient from "../infrastructure/grpc/clients/profile.client";
import StateStore from "../infrastructure/state-store/state-stores/state-store";
import Id from "../domain/common/value-objects/id.vo";

import {WebSocket,} from "ws";
import BattleLeaveUseCase from "../application/use-cases/battle/battle-leave";
import BattleClient from "../infrastructure/grpc/clients/battle.client";
import ConnectionHandler from "../infrastructure/websocket-server/connection.handler";
import SocketContext from "../infrastructure/websocket-server/types/socket-context";
import BattleWebsocketsRegistry from "../infrastructure/websocket-server/registers/battle-websockets.registry";
import BattleTimeoutCallbackFactory from "../infrastructure/timer/callbacks/battle-timeout-callback-factory";
import BattleHandler from "../infrastructure/websocket-server/handlers/battle.handler";
import BattleStartUseCase from "../application/use-cases/battle/battle-start";
import BattleMoveUseCase from "../application/use-cases/battle/battle-move";
import BattleConnectBotUseCase from "../application/use-cases/battle/battle-connect-bot";
import EngineStream from "../infrastructure/grpc-stream/channels/engine.stream";
import EngineHandler from "../infrastructure/grpc/handlers/engine.handler";
import BattleStartedUseCase from "../application/use-cases/battle/battle-started";
import BattleUpdatedUseCase from "../application/use-cases/battle/battle-updated";
import BattleFinishedUseCase from "../application/use-cases/battle/battle-finished";


function buildApplication() {
    const authService = new AuthService(authConfig);
    const timerCallbackFactoryRegistry = new TimerCallbackFactoryRegistry();
    const timerService = new TimerService(timerCallbackFactoryRegistry);
    const cacheService = new CacheService(redisConfig);



    const jobService = new JobService(
        jobConfig,
        messageConfig,
        messageProducersConfig,
    );

    const profileClinent = new ProfileClient(grpcConfig.serviceProfileUrl);

    const authorizeProfileUseCase = new AuthorizeProfileUseCase(
        profileClinent,
    );

    const battleTimeoutCallbackFactory = new BattleTimeoutCallbackFactory(
        //     battleTimeoutUseCase,
    );

    timerCallbackFactoryRegistry.register(battleTimeoutCallbackFactory);

    const messageService = new MessageService(
        messageConfig,
        messageConsumersConfig,
        // battleStartedConsumer,
    );

    const wsSocketContextStateStore = new StateStore<WebSocket, SocketContext>();
    const battleWsStateStore = new StateStore<Id, Set<WebSocket>>();

    const heartbeatTimers = new TimerService(timerCallbackFactoryRegistry);

    const battleWebsocketsRegistry = new BattleWebsocketsRegistry(
        wsSocketContextStateStore,
        battleWsStateStore,
        heartbeatTimers,
    );

    const battleClient = new BattleClient(grpcConfig.serviceBattleUrl);
    const battleLeaveUseCase = new BattleLeaveUseCase(
        battleWebsocketsRegistry,
        grpcStreamService,
    );

    const battleStartUseCase = new BattleStartUseCase(
        battleWebsocketsRegistry,
        battleClient,
    );
    const battleMoveUseCase = new BattleMoveUseCase(
        battleWebsocketsRegistry,
        grpcStreamService,
    );

    const battleConnectBotUseCase = new BattleConnectBotUseCase(
        battleWebsocketsRegistry,
        messageService,
    );

    const battleHandler = new BattleHandler(
        timerService,
        battleStartUseCase,
        battleMoveUseCase,
        battleConnectBotUseCase,
        battleLeaveUseCase,
    );

    const connectionHandler = new ConnectionHandler(
        authService,
        authorizeProfileUseCase,
        battleLeaveUseCase,
        battleWebsocketsRegistry,
        timerService,
    );

    connectionHandler.registerHandler('/battle', battleHandler);

    const websocketService = new WebsocketService(
        websocketConfig,
        connectionHandler,
    );

    const battleStartedUseCase = BattleStartedUseCase;
    const battleUpdatedUseCase = BattleUpdatedUseCase;
    const battleFinishedUseCase = BattleFinishedUseCase;

    const engineStream = new EngineStream(
        grpcConfig.serviceEngineUrl,
        battleUpdatedUseCase
    );

    const grpcStreamService = new GrpcStreamService(engineStream);

    const engineHandler = new EngineHandler(
        battleStartedUseCase,
        battleUpdatedUseCase,
        battleFinishedUseCase,
    );

    const healthUseCase = new HealthUseCase(
        jobService,
        messageService,
        cacheService,
        websocketService,
        grpcStreamService,
    );

    const statusUseCase = new StatusUseCase();
    const livezUseCase = new LivezUseCase();
    const readyzUseCase = new ReadyzUseCase();

    const healthHandler = new HealthHandler(
        healthUseCase,
        statusUseCase,
        livezUseCase,
        readyzUseCase,
    );

    const grpcService = new GrpcService(
        grpcConfig.port,
        engineHandler,
        healthHandler,
    );


    return new Application(
        grpcService,
        // stateStoreService,
        jobService,
        messageService,
        cacheService,
        websocketService,
        grpcStreamService,
        timerService,
    );
}

export default buildApplication;
