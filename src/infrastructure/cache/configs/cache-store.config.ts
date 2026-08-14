// import ProfileEntity from "../../../domain/battle/battle.entity";

export const cacheStoreConfig = {
    // engine: {} as ProfileEntity,
} as const;

export type CacheStoreKey = keyof typeof cacheStoreConfig;

export type CacheStoreEntity<K extends CacheStoreKey> = typeof cacheStoreConfig[K];

export default cacheStoreConfig;
