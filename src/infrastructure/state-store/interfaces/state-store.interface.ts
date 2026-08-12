export interface StateStoreInterface<KEntity, VEntity> {
    set(key: KEntity, entity: VEntity): void;

    get(key: KEntity): VEntity | null;

    delete(key: KEntity): void;

    clear(): void;
}

export default StateStoreInterface;
