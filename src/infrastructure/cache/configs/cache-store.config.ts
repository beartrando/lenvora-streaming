// import BattleEntity from "../../../domain/engine/engine.entity";

export const cacheStoreConfig = {
    // engine: {} as BattleEntity,
} as const;

export type CacheStoreKey = keyof typeof cacheStoreConfig;

export type CacheStoreEntity<K extends CacheStoreKey> = typeof cacheStoreConfig[K];

export default cacheStoreConfig;
