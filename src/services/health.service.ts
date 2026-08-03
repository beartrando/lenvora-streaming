import prisma from '../lib/prisma';
import logger from '@shared/logger';
import messageConfig from '../config/kafka.config';
import {createProducer} from '@shared/kafka-manager';
import * as healthProto from '../grpc/generated/common/health';

const startedAt = Date.now();

export const check = async (): Promise<healthProto.HealthReport> => {
    const [pgOk, kafkaOk] = await Promise.all([checkPostgres(), checkKafka()]);

    return {
        service: 'streaming',
        status:
            pgOk && kafkaOk
                ? healthProto.HealthStatus.HEALTH_STATUS_OK
                : healthProto.HealthStatus.HEALTH_STATUS_FAIL,
        components: {
            postgres: pgOk
                ? healthProto.HealthStatus.HEALTH_STATUS_OK
                : healthProto.HealthStatus.HEALTH_STATUS_FAIL,
            kafka: kafkaOk
                ? healthProto.HealthStatus.HEALTH_STATUS_OK
                : healthProto.HealthStatus.HEALTH_STATUS_FAIL,
        },
        timestamp: new Date(),
    };
};

export const status = async (): Promise<healthProto.ServiceStatus> => {
    const uptimeMs = Date.now() - startedAt;

    return {
        name: 'streaming',
        version: process.env.BUILD_VERSION || 'dev',
        env: process.env.NODE_ENV || 'development',
        uptimeSeconds: {
            seconds: Math.floor(uptimeMs / 1000),
            nanos: (uptimeMs % 1000) * 1_000_000,
        },
        timestamp: new Date(),
    };
}

export const livez = async (): Promise<healthProto.LiveStatus> => ({
    live: true,
});

export const readyz = async (): Promise<healthProto.ReadyStatus> => {
    const [pgOk, kafkaOk] = await Promise.all([checkPostgres(), checkKafka()]);
    return {ready: pgOk && kafkaOk};
};

export const checkPostgres = async (): Promise<boolean> => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return true;
    } catch (err) {
        logger.error('❌ Prisma/Postgres health check failed:', err);
        return false;
    }
};

export const checkKafka = async (): Promise<boolean> => {
    try {
        const producer = await createProducer(messageConfig);
        producer.send('healthcheck', [{value: 'ping'}]);
        return true;
    } catch (err) {
        logger.error('❌ Kafka health check failed:', err);
        return false;
    }
};
