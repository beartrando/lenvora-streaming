export const grpcConfig = {
    port: Number(process.env.GRPC_PORT ?? 50051),

    serviceAuthUrl: process.env.SERVICE_AUTH_URL ?? 'auth:50051',
    serviceProfileUrl: process.env.SERVICE_PROFILE_URL ?? 'profile:50051',
    serviceEngineUrl: process.env.SERVICE_ENGINE_URL ?? 'engine:50051',
    serviceBattleUrl: process.env.SERVICE_BATTLE_URL ?? 'engine:50051',
    serviceSpeechToTextUrl: process.env.SERVICE_SPEECH_TO_TEXT_URL ?? 'speech-to-text:50051',
};

export default grpcConfig;
