import Redis from "ioredis";
import Id from "../../../domain/common/value-objects/id.vo";

export interface CacheStoreInterface<TEntity extends { id: Id }> {
    setClient(client: Redis): void;

    set(entity: TEntity): Promise<void>;

    get(id: Id): Promise<TEntity | null>;

    invalidate(id: Id): Promise<void>;

    exists(id: Id): Promise<boolean>;

    loadAll(): Promise<TEntity[]>;

    clear(): Promise<void>;
}

export default CacheStoreInterface;
