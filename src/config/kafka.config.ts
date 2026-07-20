// import {battleUpdated} from "../lib/consumers";

const kafkaConfig = {
    brokers: (process.env.KAFKA_BROKERS?.split(',') ?? ['kafka:9092']),
    clientId: process.env.KAFKA_CLIENT_ID || 'streaming-producer',
    groupId: process.env.KAFKA_GROUP_ID || 'streaming-service',
};

export const kafkaProducersConfig = {
    topicAiConnectingRequest: process.env.KAFKA_TOPIC_AI_CONNECTING_REQUEST || 'ai.connecting-request',
};

export const kafkaConsumersConfig = {
    // battleUpdated: {
    //   topic: process.env.KAFKA_TOPIC_BATTLE_UPDATED || 'battle.updated',
    //   handler: battleUpdated
    // },
};

export default kafkaConfig;
