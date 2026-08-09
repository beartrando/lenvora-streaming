import Id from "../../../domain/common/value-objects/id.vo";

export interface StateStoreInterface<TEntity extends { id: Id }> {
    save(entity: TEntity): Promise<void>;

    get(id: Id): Promise<TEntity | null>;

    drop(id: Id): Promise<void>;

    clear(): Promise<void>;

    restore(): Promise<TEntity[]>;
}

export default StateStoreInterface;
