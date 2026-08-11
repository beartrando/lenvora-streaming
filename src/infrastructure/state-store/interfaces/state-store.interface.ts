export interface StateStoreInterface<KEntity, VEntity> {
    save(key: KEntity, entity: VEntity): void;

    get(key: KEntity): VEntity | null;

    drop(key: KEntity): void;

    clear(): void;
}

export default StateStoreInterface;
