export interface StateStoreInterface<KEntity, VEntity> {
    save(key: KEntity, entity: VEntity): Promise<void>;

    get(key: KEntity): Promise<VEntity | null>;

    drop(key: KEntity): Promise<void>;

    clear(): Promise<void>;
}

export default StateStoreInterface;
