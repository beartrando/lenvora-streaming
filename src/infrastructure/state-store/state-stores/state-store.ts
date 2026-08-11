import StateStoreInterface from "../interfaces/state-store.interface";

export class StateStore<KEntity, VEntity> implements StateStoreInterface<KEntity, VEntity> {
    private readonly _registry = new Map<KEntity, VEntity>();

    constructor() {
    }

    save(key: KEntity, entity: VEntity): void {
        this._registry.set(
            key,
            entity,
        );
    }

    get(key: KEntity): VEntity | null {
        return this._registry.get(key) ?? null;
    }

    drop(key: KEntity): void {
        this._registry.delete(key);
    }

    clear(): void {
        this._registry.clear();
    }
}

export default StateStore;
