import Id from "../../domain/common/value-objects/id.vo";
import StateStoreInterface from "./interfaces/state-store.interface";
import CacheStore from "../cache/cache-store";

export class StateStore<TEntity extends { id: Id }> implements StateStoreInterface<TEntity> {
    private readonly _registry = new Map<string, TEntity>();

    constructor(
        private readonly cacheStore: CacheStore<TEntity>,
    ) {
    }

    async save(
        entity: TEntity,
    ): Promise<void> {
        this._registry.set(
            entity.id.value,
            entity,
        );

        await this.cacheStore.set(entity);
    }

    async get(
        id: Id,
    ): Promise<TEntity | null> {
        return this._registry.get(id.value) ?? null;
    }

    async drop(
        id: Id,
    ): Promise<void> {
        this._registry.delete(id.value);

        await this.cacheStore.invalidate(id);
    }

    async clear(): Promise<void> {
        this._registry.clear();

        await this.cacheStore.clear();
    }

    async restore(): Promise<TEntity[]> {
        const entities = await this.cacheStore.loadAll();

        // this._registry.clear();

        for (const entity of entities) {
            this._registry.set(
                entity.id.value,
                entity,
            );
        }

        return entities;
    }
}

export default StateStore;
