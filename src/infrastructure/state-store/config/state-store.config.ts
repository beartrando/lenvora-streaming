import BattleEntity from "../../../domain/battle/battle.entity";

export const stateStoreConfig = {
    battle: {} as BattleEntity,
} as const;

export type StateStoreKey = keyof typeof stateStoreConfig;

export type StateStoreEntity<K extends StateStoreKey> = typeof stateStoreConfig[K];

export default stateStoreConfig;
