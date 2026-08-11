import StateStoreInterface from "../interfaces/state-store.interface";

export class StateStore<KEntity, VEntity> implements StateStoreInterface<KEntity, VEntity> {
    private readonly _registry = new Map<KEntity, VEntity>();

    constructor() {
    }

    async save(
        key: KEntity,
        entity: VEntity,
    ): Promise<void> {
        this._registry.set(
            key,
            entity,
        );
    }

    async get(
        key: KEntity,
    ): Promise<VEntity | null> {
        return this._registry.get(key) ?? null;
    }

    async drop(
        key: KEntity,
    ): Promise<void> {
        this._registry.delete(key);
    }

    async clear(): Promise<void> {
        this._registry.clear();
    }
}

export default StateStore;
