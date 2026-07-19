import logger from "@shared/logger";
// import prisma from '../lib/prisma';
import kafkaConfig from "../config/kafka.config";
import {createProducer} from "@shared/kafka-manager";

const startedAt = Date.now();

export const check = async () => {
  const [kafkaOk] = await Promise.all([
    checkKafka(),
  ]);

  return {
    healthy: kafkaOk,
    components: {
      kafka: kafkaOk ? 'ok' : 'fail',
    },
  };
};

export const status = async () => {
  return {
    name: 'auth',
    version: process.env.BUILD_VERSION || 'dev',
    env: process.env.NODE_ENV || 'development',
    uptime: Math.floor((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString(),
  };
};

export const livez = async () => {
  return {
    live: true,
  };
};

export const readyz = async () => {
  const [kafkaOk] = await Promise.all([
    checkKafka(),
  ]);

  return {ready: kafkaOk};
};

export const checkKafka = async (): Promise<boolean> => {
  // return true;
  try {
    const producer = await createProducer(kafkaConfig);
    // producer.send('healthcheck', [{value: 'ping'}]);
    return true;
  } catch (err) {
    logger.error('❌ Kafka health check failed:', err);
    return false;
  }
};
