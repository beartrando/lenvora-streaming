const messageConfig = {
    brokers: process.env.KAFKA_BROKERS?.split(',') ?? ['kafka:9092'],
    clientId: process.env.KAFKA_CLIENT_ID ?? 'streaming-client',
    groupId: process.env.KAFKA_GROUP_ID ?? 'streaming-service',
};

export const messageConsumersConfig: Record<string, ConsumerConfig> = {};

export const messageProducersConfig: Record<string, string> = {
    aiConnectingRequest: process.env.MESSAGE_TOPIC_AI_CONNECTING_REQUEST ?? 'bot.connecting-request',
};

export default messageConfig;
