import {WebSocket} from "ws";
import * as engineProto from "../contracts/proto/engine";

import Application from "../application/application";

// Application
import HealthUseCase from "../application/use-cases/health/health";
import StatusUseCase from "../application/use-cases/health/status";
import LivezUseCase from "../application/use-cases/health/livez";
import ReadyzUseCase from "../application/use-cases/health/readyz";

import AuthorizeProfileUseCase from "../application/use-cases/auth/authorize-profile";

import BattleStartUseCase from "../application/use-cases/battle/battle-start";
import BattleMoveUseCase from "../application/use-cases/battle/battle-move";
import BattleLeaveUseCase from "../application/use-cases/battle/battle-leave";
import BattleConnectBotUseCase from "../application/use-cases/battle/battle-connect-bot";
import BattleStartedUseCase from "../application/use-cases/battle/battle-started";
import BattleUpdatedUseCase from "../application/use-cases/battle/battle-updated";

// Infrastructure
import AuthService from "../infrastructure/auth/service";
import CacheService from "../infrastructure/cache/service";
import GrpcService from "../infrastructure/grpc/service";
import JobService from "../infrastructure/job/service";
import MessageService from "../infrastructure/message/service";
import TimerService from "../infrastructure/timer/service";
import GrpcStreamService from "../infrastructure/grpc-stream/service";
import WebsocketServerService from "../infrastructure/websocket/server.service";

import ProfileClient from "../infrastructure/grpc/clients/profile.client";
import BattleClient from "../infrastructure/grpc/clients/battle.client";
import EngineStream from "../infrastructure/grpc-stream/channels/engine.stream";

import HealthHandler from "../infrastructure/grpc/handlers/health.handler";
import ConnectionHandler from "../infrastructure/websocket/connection.handler";
import BattleHandler from "../infrastructure/websocket/handlers/battle.handler";

import StateStore from "../infrastructure/state-store/state-stores/state-store";
import BattleWebsocketsRegistry from "../infrastructure/websocket/registers/battle-websockets.registry";

import TimerCallbackFactoryHolder
    from "../infrastructure/timer/callback-factory-holder";
import BattleTimeoutCallbackFactory
    from "../infrastructure/timer/callbacks/battle-timeout-callback-factory";

import BattleLeaveData
    from "../infrastructure/timer/value-objects/battle-leave-data.vo";
import Id from "../domain/common/value-objects/id.vo";
import SocketContext from "../infrastructure/websocket/types/socket-context";

// Config
import authConfig from "../infrastructure/auth/auth.config";
import grpcConfig from "../infrastructure/grpc/configs/grpc.config";
import jobConfig from "../infrastructure/job/job.config";
import messageConfig from "../infrastructure/message/configs/message.config";
import messageProducersConfig from "../infrastructure/message/configs/producers.config";
import redisConfig from "../infrastructure/cache/configs/redis.config";
import websocketServerConfig from "../infrastructure/websocket/configs/websocket-server.config";
import domainBattleConfig from "../domain/battle/config/config";
import {BattleWebsocketSender} from "../infrastructure/websocket/senders/battle-websocket.sender";


function buildApplication(): Application {
    /*
     * Infrastructure services
     */

    const authService = new AuthService(authConfig);

    const cacheService = new CacheService(redisConfig);

    const jobService = new JobService(
        jobConfig,
        messageConfig,
        messageProducersConfig,
    );

    const messageService = new MessageService(messageConfig);

    const timerCallbackFactoryHolder =
        new TimerCallbackFactoryHolder<BattleLeaveData>();

    const timerService =
        new TimerService<WebSocket, BattleLeaveData>(
            timerCallbackFactoryHolder,
            domainBattleConfig.battleTurnTimeLimit,
        );

    const grpcStreamService =
        new GrpcStreamService<engineProto.BattleRequest>();


    /*
     * External clients
     */

    const profileClient =
        new ProfileClient(grpcConfig.serviceProfileUrl);

    const battleClient =
        new BattleClient(grpcConfig.serviceBattleUrl);


    /*
     * State
     */

    const socketContextStore =
        new StateStore<WebSocket, SocketContext>();

    const battleWebsocketsStore =
        new StateStore<Id, Set<WebSocket>>();

    /*
     * WebSocket infrastructure
     */

    const battleWebsocketsRegistry =
        new BattleWebsocketsRegistry(
            socketContextStore,
            battleWebsocketsStore,
            timerService,
        );

    const battleWebsocketSender = new BattleWebsocketSender(battleWebsocketsRegistry);


    /*
     * Application — auth
     */

    const authorizeProfileUseCase =
        new AuthorizeProfileUseCase(
            profileClient,
        );


    /*
     * Application — battle
     */

    const battleLeaveUseCase =
        new BattleLeaveUseCase(
            battleWebsocketsRegistry,
            grpcStreamService,
        );

    const battleStartUseCase =
        new BattleStartUseCase(
            battleWebsocketSender,
            battleWebsocketsRegistry,
            battleClient,
        );

    const battleMoveUseCase =
        new BattleMoveUseCase(
            battleWebsocketsRegistry,
            grpcStreamService,
        );

    const battleConnectBotUseCase =
        new BattleConnectBotUseCase(
            jobService,
            socketContextStore,
            battleWebsocketsStore,
            messageProducersConfig.aiConnectingRequest,
        );


    /*
     * Timer callbacks
     */

    const battleTimeoutCallbackFactory =
        new BattleTimeoutCallbackFactory(
            battleLeaveUseCase,
        );

    timerCallbackFactoryHolder.factory =
        battleTimeoutCallbackFactory;


    /*
     * WebSocket handlers
     */

    const battleHandler =
        new BattleHandler(
            timerService,
            battleStartUseCase,
            battleMoveUseCase,
            battleConnectBotUseCase,
            battleLeaveUseCase,
        );

    const connectionHandler =
        new ConnectionHandler(
            authService,
            authorizeProfileUseCase,
            battleLeaveUseCase,
            battleWebsocketsRegistry,
            timerService,
        );

    connectionHandler.registerHandler(
        "/battle",
        battleHandler,
    );

    const websocketService =
        new WebsocketServerService(
            websocketServerConfig,
            connectionHandler,
        );


    /*
     * Engine stream
     */

    const battleStartedUseCase =
        new BattleStartedUseCase();

    const battleUpdatedUseCase =
        new BattleUpdatedUseCase();

    const engineStream =
        new EngineStream(
            grpcConfig.serviceEngineUrl,
            battleUpdatedUseCase,
        );

    grpcStreamService.stream = engineStream;


    /*
     * Health
     */

    const healthUseCase =
        new HealthUseCase(
            jobService,
            messageService,
            cacheService,
            websocketService,
            grpcStreamService,
        );

    const statusUseCase = new StatusUseCase();
    const livezUseCase = new LivezUseCase();
    const readyzUseCase = new ReadyzUseCase();

    const healthHandler =
        new HealthHandler(
            healthUseCase,
            statusUseCase,
            livezUseCase,
            readyzUseCase,
        );


    /*
     * gRPC
     */

    const grpcService =
        new GrpcService(
            grpcConfig.port,
            healthHandler,
        );


    /*
     * Application
     */

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