export const config = {
    grpcPort: Number(process.env.GRPC_PORT) || 50051,
    webSocketPort: Number(process.env.WEB_SOCKET_PORT) || 8080,
    serviceAuthUrl: process.env.SERVICE_AUTH_URL || 'auth:50051',
    serviceProfileUrl: process.env.SERVICE_PROFILE_URL || 'profile:50051',
    serviceTestUrl: process.env.SERVICE_ORCHESTRATION_URL || 'test:50051',
    serviceEngineUrl: process.env.SERVICE_ENGINE_URL || 'engine:50051',
    serviceBattleUrl: process.env.SERVICE_BATTLE_URL || 'battle:50051',
    rabbitHost: process.env.RABBIT_HOST || 'rabbit',
    rabbitUser: process.env.RABBIT_USER || 'user',
    rabbitPass: process.env.RABBIT_PASS || 'password',
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "your_access_secret",
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "your_refresh_secret",
};

export default config;
