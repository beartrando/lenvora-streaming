const kafkaConfig = {
    brokers: process.env.KAFKA_BROKERS?.split(',') ?? ['kafka:9092'],
    clientId: process.env.KAFKA_CLIENT_ID ?? 'streaming-client',
    groupId: process.env.KAFKA_GROUP_ID ?? 'streaming-service',
};

type ConsumerConfig = {
    topic: string;
    handler: (message: unknown) => Promise<void>;
};

export const kafkaConsumersConfig: Record<string, ConsumerConfig> = {};

export const kafkaProducersConfig: Record<string, string> = {
    aiConnectingRequest: process.env.KAFKA_TOPIC_AI_CONNECTING_REQUEST ?? 'bot.connecting-request',
};

export default kafkaConfig;
