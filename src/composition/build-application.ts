import Application from "../application/application";

import GrpcService from "../infrastructure/grpc/service";

import AuthService from "../infrastructure/auth/service";
import authConfig from "../infrastructure/auth/auth.config";

import CacheService from "../infrastructure/cache/service";
import redisConfig from "../infrastructure/cache/configs/redis.config";
import JobService from "../infrastructure/job/service";
import jobConfig from "../infrastructure/job/job.config";
import messageConfig from "../infrastructure/message/configs/message.config";
import messageProducersConfig from "../infrastructure/message/configs/producers.config";

import TimerService from "../infrastructure/timer/service";
import grpcConfig from "../infrastructure/grpc/configs/grpc.config";
import HealthUseCase from "../application/use-cases/health/health";
import websocketConfig from "../infrastructure/websocket/configs/websocket.config";
import MessageService from "../infrastructure/message/service";
import WebsocketServerService from "../infrastructure/websocket/server.service";
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
import ConnectionHandler from "../infrastructure/websocket/connection.handler";
import SocketContext from "../infrastructure/websocket/types/socket-context";
import BattleWebsocketsRegistry from "../infrastructure/websocket/registers/battle-websockets.registry";
import BattleTimeoutCallbackFactory from "../infrastructure/timer/callbacks/battle-timeout-callback-factory";
import BattleHandler from "../infrastructure/websocket/handlers/battle.handler";
import BattleStartUseCase from "../application/use-cases/battle/battle-start";
import BattleMoveUseCase from "../application/use-cases/battle/battle-move";
import BattleConnectBotUseCase from "../application/use-cases/battle/battle-connect-bot";
import EngineStream from "../infrastructure/grpc-stream/channels/engine.stream";
import BattleStartedUseCase from "../application/use-cases/battle/battle-started";
import BattleUpdatedUseCase from "../application/use-cases/battle/battle-updated";
import * as engineProto from "../contracts/proto/engine";
import TimerCallbackFactoryHolder from "../infrastructure/timer/callback-factory-holder";
import domainBattleConfig from "../domain/battle/config/config";
import BattleLeaveData from "../infrastructure/timer/value-objects/battle-leave-data.vo";


function buildApplication() {
    const authService = new AuthService(authConfig);
    const timerCallbackFactoryHolder = new TimerCallbackFactoryHolder<BattleLeaveData>();
    const timerService = new TimerService<WebSocket, BattleLeaveData>(
        timerCallbackFactoryHolder,
        domainBattleConfig.battleTurnTimeLimit
    );
    const cacheService = new CacheService(redisConfig);
    const grpcStreamService = new GrpcStreamService<engineProto.BattleRequest>();

    const jobService = new JobService(
        jobConfig,
        messageConfig,
        messageProducersConfig,
    );

    const profileClinent = new ProfileClient(grpcConfig.serviceProfileUrl);

    const authorizeProfileUseCase = new AuthorizeProfileUseCase(
        profileClinent,
    );

    const messageService = new MessageService(
        messageConfig,
        messageConsumersConfig,
        // battleStartedConsumer,
    );

    const wsSocketContextStateStore = new StateStore<WebSocket, SocketContext>();
    const battleWsStateStore = new StateStore<Id, Set<WebSocket>>();

    const battleWebsocketsRegistry = new BattleWebsocketsRegistry(
        wsSocketContextStateStore,
        battleWsStateStore,
        timerService,
    );

    const battleClient = new BattleClient(grpcConfig.serviceBattleUrl);

    const battleLeaveUseCase = new BattleLeaveUseCase(
        battleWebsocketsRegistry,
        grpcStreamService,
    );

    const battleTimeoutCallbackFactory = new BattleTimeoutCallbackFactory(
        battleLeaveUseCase,
    );

    timerCallbackFactoryHolder.factory = battleTimeoutCallbackFactory;

    const battleStartUseCase = new BattleStartUseCase(
        battleWebsocketsRegistry,
        battleClient,
    );
    const battleMoveUseCase = new BattleMoveUseCase(
        battleWebsocketsRegistry,
        grpcStreamService,
    );

    const battleConnectBotUseCase = new BattleConnectBotUseCase(
        jobService,
        wsSocketContextStateStore,
        battleWsStateStore,
        messageProducersConfig.aiConnectingRequest,
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

    const websocketService = new WebsocketServerService(
        websocketConfig,
        connectionHandler,
    );

    const battleStartedUseCase = new BattleStartedUseCase;
    const battleUpdatedUseCase = new BattleUpdatedUseCase;

    const engineStream = new EngineStream(
        grpcConfig.serviceEngineUrl,
        battleUpdatedUseCase
    );

    grpcStreamService.stream = engineStream;

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
        healthHandler,
    );


    return new Application(
        grpcService,
        jobService,
        messageService,
        cacheService,
        websocketService,
        grpcStreamService,
        timerService,
    );
}

export default buildApplication;
