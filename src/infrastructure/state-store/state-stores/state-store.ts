import StateStoreInterface from "../interfaces/state-store.interface";
import logger from "@shared/logger";

export class StateStore<KEntity, VEntity> implements StateStoreInterface<KEntity, VEntity> {
    private readonly _registry = new Map<KEntity, VEntity>();

    set(key: KEntity, entity: VEntity): void {
        this._registry.set(
            key,
            entity,
        );
        // logger.log(this.constructor.name);
        // logger.log(this._registry.values());
    }

    get(key: KEntity): VEntity | null {
        // logger.log(this.constructor.name);
        // logger.log(this._registry.values());
        return this._registry.get(key) ?? null;
    }

    delete(key: KEntity): void {
        // logger.log(new Error().stack);
        this._registry.delete(key);
    }

    clear(): void {
        this._registry.clear();
    }
}

export default StateStore;

