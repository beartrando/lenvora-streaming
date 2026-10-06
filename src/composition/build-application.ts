import {WebSocket} from "ws";

import Application from "../application/application";

// Application
import HealthUseCase from "../application/use-cases/health/health";
import StatusUseCase from "../application/use-cases/health/status";
import LivezUseCase from "../application/use-cases/health/livez";
import ReadyzUseCase from "../application/use-cases/health/readyz";

import AuthorizeProfileUseCase from "../application/use-cases/auth/authorize-profile";
import WebsocketDisconnectUseCase from "../application/use-cases/websocket/websocket-disconnect";

// Infrastructure
import AuthService from "../infrastructure/auth/service";
import GrpcService from "../infrastructure/grpc/service";
import JobService from "../infrastructure/job/service";
import MessageService from "../infrastructure/message/service";
import WebsocketServerService from "../infrastructure/websocket/server.service";

import ProfileClient from "../infrastructure/grpc/clients/profile.client";

import HealthHandler from "../infrastructure/grpc/handlers/health.handler";
import ConnectionHandler from "../infrastructure/websocket/connection.handler";

import StateStore from "../infrastructure/state-store/state-stores/state-store";
import EventWebsocketsRegistry from "../infrastructure/websocket/registers/event-websockets.registry";
import SocketContext from "../infrastructure/websocket/types/socket-context";

// Config
import authConfig from "../infrastructure/auth/auth.config";
import grpcConfig from "../infrastructure/grpc/configs/grpc.config";
import jobConfig from "../infrastructure/job/job.config";
import messageConfig from "../infrastructure/message/configs/message.config";
import messageProducersConfig from "../infrastructure/message/configs/producers.config";
import websocketServerConfig from "../infrastructure/websocket/configs/websocket-server.config";
import EventWebsocketSender from "../infrastructure/websocket/senders/event-websocket.sender";
import EventHandler from "../infrastructure/websocket/handlers/event.handler";
import VoiceStreamUseCase, {VoiceSession} from "../application/use-cases/voice/voice-stream";


function buildApplication(): Application {
    /*
     * Infrastructure services
     */

    const authService = new AuthService(authConfig);

    const jobService = new JobService(
        jobConfig,
        messageConfig,
        messageProducersConfig,
    );

    const messageService = new MessageService(messageConfig);

    /*
     * External client
     */

    const profileClient =
        new ProfileClient(grpcConfig.serviceProfileUrl);

    /*
     * State
     */

    const socketContextStore =
        new StateStore<WebSocket, SocketContext>();

    const profileWebsocketStore =
        new StateStore<string, WebSocket>();
    /*
     * WebSocket infrastructure
     */

    const eventWebsocketsRegistry = new EventWebsocketsRegistry(socketContextStore, profileWebsocketStore);

    const eventWebsocketSender = new EventWebsocketSender(eventWebsocketsRegistry);

    const voiceSessionStore =
        new StateStore<WebSocket, VoiceSession>();

    /*
     * Application — voice
     */

    const voiceStreamUseCase = new VoiceStreamUseCase(
        grpcConfig.serviceSpeechToTextUrl,
        voiceSessionStore,
        eventWebsocketSender,
        eventWebsocketsRegistry,
    );

    /*
     * Application — auth
     */

    const authorizeProfileUseCase =
        new AuthorizeProfileUseCase(
            profileClient,
        );


    const websocketDisconnectUseCase = new WebsocketDisconnectUseCase(
        eventWebsocketsRegistry,
        voiceStreamUseCase,
    );

    /*
     * WebSocket handlers
     */

    const eventHandler =
        new EventHandler(
            voiceStreamUseCase,
        );


    const connectionHandler =
        new ConnectionHandler(
            authService,
            authorizeProfileUseCase,
            websocketDisconnectUseCase,
            eventWebsocketsRegistry,
        );

    connectionHandler.registerHandler(
        "/event",
        eventHandler,
    );

    const websocketService =
        new WebsocketServerService(
            websocketServerConfig,
            connectionHandler,
        );


    /*
     * Health
     */

    const healthUseCase =
        new HealthUseCase(
            jobService,
            messageService,
            websocketService,
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
        websocketService,
    );
}

export default buildApplication;
