import RedisConfig from "../interfaces/redis-config";

export const redisConfig: RedisConfig = {
    host: process.env.REDIS_HOST ?? "redis",
    port: Number(process.env.REDIS_PORT ?? 6379),
    password: process.env.REDIS_PASSWORD ?? "",
};

export default redisConfig;
