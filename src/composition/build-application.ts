import Application from "../application/application";

import HealthUseCase from "../application/use-cases/health/health";
import LivezUseCase from "../application/use-cases/health/livez";
import ReadyzUseCase from "../application/use-cases/health/readyz";
import StatusUseCase from "../application/use-cases/health/status";

import BattleStartUseCase from "../application/use-cases/engine/battle-start";
import BattleMoveUseCase from "../application/use-cases/engine/battle-move";
import BattleLeaveUseCase from "../application/use-cases/engine/battle-leave";

import GrpcService from "../infrastructure/grpc/service";
import grpcConfig from "../infrastructure/grpc/grpc.config";
import EngineHandler from "../infrastructure/grpc/handlers/engine.handler";
import HealthHandler from "../infrastructure/grpc/handlers/health.handler";

import AuthService from "../infrastructure/auth/service";
import authConfig from "../infrastructure/auth/auth.config";

import CacheService from "../infrastructure/cache/service";
import CacheStore from "../infrastructure/cache/cache-store";
import redisConfig from "../infrastructure/cache/config/redis.config";
import BattleRedisMapper from "../infrastructure/state-store/mappers/battle.redis.mapper";

import StateStore from "../infrastructure/state-store/state-store";
import StateStoreService from "../infrastructure/state-store/service";

import JobService from "../infrastructure/job/service";
import jobConfig from "../infrastructure/job/job.config";

import MessageService from "../infrastructure/message/service";
import messageConfig from "../infrastructure/message/config/message.config";
import messageConsumersConfig from "../infrastructure/message/config/consumers.config";
import BattleStartedConsumer from "../infrastructure/message/consumers/battle-started";
import messageProducersConfig from "../infrastructure/message/config/producers.config";

import TimerService from "../infrastructure/timer/service";
import BattleTimeoutCallbackFactory from "../infrastructure/timer/callbacks/battle-timeout-callback-factory";
import BattleTimeoutUseCase from "../application/use-cases/engine/battle-timeout";
import domainBattleConfig from "../domain/battle/config/config";
import TimerCallbackFactoryRegistry from "../infrastructure/timer/callback-factory-registry";


function buildApplication() {
    // Infrastructure
    const authService = new AuthService(authConfig);
    const timerService = new TimerService();
    const timerCallbackFactoryRegistry = new TimerCallbackFactoryRegistry();

    const cacheService = new CacheService(redisConfig);

    const jobService = new JobService(
        jobConfig,
        messageConfig,
        messageProducersConfig,
    );

    // Cache stores
    const battleCacheStore = new CacheStore(
        "battle:",
        "battle:index",
        BattleRedisMapper,
    );

    cacheService.register(
        "battle",
        battleCacheStore,
    );

    // State stores
    const stateStoreService = new StateStoreService();

    const battleStateStore = new StateStore(
        battleCacheStore,
    );

    stateStoreService.register(
        "battle",
        battleStateStore,
    );

    // Battle use cases
    const battleStartUseCase = new BattleStartUseCase(
        battleStateStore,
        timerService,
        timerCallbackFactoryRegistry,
        jobService,
        messageProducersConfig.battleStarted,
        domainBattleConfig.battleTurnTimeLimit,
    );

    const battleMoveUseCase = new BattleMoveUseCase(
        battleStateStore,
        timerService,
        timerCallbackFactoryRegistry,
        jobService,
        messageProducersConfig.battleUpdated,
        domainBattleConfig.battleTurnTimeLimit,
    );

    const battleLeaveUseCase = new BattleLeaveUseCase(
        battleStateStore,
        timerService,
        timerCallbackFactoryRegistry,
        jobService,
        messageProducersConfig.battleUpdated
    );

    const battleTimeoutUseCase = new BattleTimeoutUseCase(
        battleStateStore,
        timerService,
        timerCallbackFactoryRegistry,
        jobService,
        messageProducersConfig.battleUpdated,
    );

    // Timer callbacks
    const battleTimeoutCallbackFactory = new BattleTimeoutCallbackFactory(
        battleTimeoutUseCase,
    );

    timerCallbackFactoryRegistry.register(
        battleTimeoutCallbackFactory,
    );

    // Message consumers
    const battleStartedConsumer = new BattleStartedConsumer(
        battleStartUseCase,
    );

    const messageService = new MessageService(
        messageConfig,
        messageConsumersConfig,
        battleStartedConsumer,
    );

    // Health
    const healthUseCase = new HealthUseCase(
        messageService,
        jobService,
        cacheService,
    );

    const statusUseCase = new StatusUseCase();
    const livezUseCase = new LivezUseCase();
    const readyzUseCase = new ReadyzUseCase();

    // Handlers
    const engineHandler = new EngineHandler(
        battleStartUseCase,
        battleMoveUseCase,
        battleLeaveUseCase,
    );

    const healthHandler = new HealthHandler(
        healthUseCase,
        statusUseCase,
        livezUseCase,
        readyzUseCase,
    );

    // Transport
    const grpcService = new GrpcService(
        grpcConfig.port,
        engineHandler,
        healthHandler,
    );

    return new Application(
        grpcService,
        stateStoreService,
        jobService,
        messageService,
        cacheService,
    );
}

export default buildApplication;
