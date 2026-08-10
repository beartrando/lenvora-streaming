import Redis from "ioredis";

import logger from "@shared/logger";

import sleep from "../../utils/sleep";
import RedisConfig from "./interfaces/redis-config";
import CacheStoreInterface from "./interfaces/cache-store.interface";
import {CacheStoreKey, CacheStoreEntity} from "./config/cache-store.config";


export class CacheService {

    private readonly registry = new Map<
        CacheStoreKey,
        CacheStoreInterface<any>
    >();

    constructor(
        private readonly config: RedisConfig,
    ) {
    }

    private _client?: Redis;

    get client(): Redis {
        if (!this._client) {
            throw new Error("CacheStoreService is not started");
        }

        return this._client;
    }

    async start(): Promise<void> {
        await this.retryInit(async () => {
            await this.connect();
            this.initStores();
        });
    }

    async stop(): Promise<void> {
        if (this._client) {
            await this._client.quit();
            this._client = undefined;
        }
    }

    register<K extends CacheStoreKey>(
        key: K,
        store: CacheStoreInterface<CacheStoreEntity<K>>,
    ): void {
        if (this.registry.has(key)) {
            throw new Error(
                `Cache store "${key}" is already registered`,
            );
        }

        this.registry.set(key, store);
    }

    async check(): Promise<boolean> {
        try {
            const redis = this.client;

            await redis.ping();

            return true;
        } catch (err) {
            logger.error("Redis health check failed", err);

            return false;
        }
    }

    store<K extends CacheStoreKey>(
        key: K,
    ): CacheStoreInterface<CacheStoreEntity<K>> {
        const store = this.registry.get(key);

        if (!store) {
            throw new Error(
                `Cache store "${key}" is not registered`,
            );
        }

        return store as CacheStoreInterface<CacheStoreEntity<K>>;
    }

    async loadAll(): Promise<void> {
        for (const store of this.registry.values()) {
            await store.loadAll();
        }
    }

    private async connect(): Promise<void> {
        if (this._client) {
            return;
        }

        const client = new Redis({
            host: this.config.host,
            port: this.config.port,
            password: this.config.password,
        });

        await new Promise<void>((resolve, reject) => {
            client.once("ready", resolve);
            client.once("error", reject);
        });

        this._client = client;

        logger.info("✅ Redis initialized");
    }

    private initStores() {
        for (const store of this.registry.values()) {
            store.setClient(this.client);
        }
    }

    private async retryInit(
        fn: () => Promise<void>,
    ): Promise<void> {
        while (true) {
            try {
                await fn();

                return;
            } catch (err) {
                logger.warn(
                    {err},
                    "Redis unavailable. Retrying in 3 seconds..."
                );

                await sleep(3000);
            }
        }
    }
}

export default CacheService;
