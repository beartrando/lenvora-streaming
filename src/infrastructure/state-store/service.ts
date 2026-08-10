import StateStoreInterface from "./interfaces/state-store.interface";
import {StateStoreEntity, StateStoreKey} from "./configs/state-store.config";


export class StateStoreService {

    private readonly registry = new Map<
        StateStoreKey,
        StateStoreInterface<any>
    >();

    async start(): Promise<void> {
        await this.restore();
    }

    async stop(): Promise<void> {
        await this.clearAll();
    }

    register<K extends StateStoreKey>(
        key: K,
        store: StateStoreInterface<StateStoreEntity<K>>,
    ): void {
        if (this.registry.has(key)) {
            throw new Error(
                `State store "${key}" is already registered`,
            );
        }

        this.registry.set(key, store);
    }

    async check(): Promise<boolean> {
        return true;
    }

    store<K extends StateStoreKey>(
        key: K,
    ): StateStoreInterface<StateStoreEntity<K>> {
        const store = this.registry.get(key);

        if (!store) {
            throw new Error(
                `State store "${key}" is not registered`,
            );
        }

        return store as StateStoreInterface<StateStoreEntity<K>>;
    }

    async clearAll(): Promise<void> {
        for (const store of this.registry.values()) {
            await store.clear();
        }
    }

    async restore(): Promise<void> {
        for (const store of this.registry.values()) {
            await store.restore();
        }
    }
}

export default StateStoreService;
