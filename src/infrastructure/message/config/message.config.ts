export const messageConfig = {
    brokers: process.env.KAFKA_BROKERS?.split(',') ?? ['kafka:9092'],
    clientId: process.env.KAFKA_CLIENT_ID ?? 'engine-client',
    groupId: process.env.KAFKA_GROUP_ID ?? 'engine-service',
};


export default messageConfig;
