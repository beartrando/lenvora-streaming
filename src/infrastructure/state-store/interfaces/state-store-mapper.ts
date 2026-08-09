export interface StateStoreMapper<TEntity> {
    toPersistence(entity: TEntity): unknown;

    toDomain(data: unknown): TEntity;
}

export default StateStoreMapper;
