// import StateStoreInterface from "./interfaces/state-store.interface";
// import {
//     StateStoreEntity,
//     StateStoreKey,
// } from "./configs/state-store.config";
//
// export class StateStoreService {
//     private readonly registry = new Map<
//         StateStoreKey,
//         StateStoreInterface<any, any>
//     >();
//
//     async start(): Promise<void> {
//     }
//
//     async stop(): Promise<void> {
//     }
//
//     register<K extends StateStoreKey>(
//         key: K,
//         store: StateStoreInterface<
//             string,
//             StateStoreEntity<K>
//         >,
//     ): void {
//         if (this.registry.has(key)) {
//             throw new Error(
//                 `State store "${key}" is already registered`,
//             );
//         }
//
//         this.registry.set(key, store);
//     }
//
//     async check(): Promise<boolean> {
//         return true;
//     }
//
//     store<K extends StateStoreKey>(
//         key: K,
//     ): StateStoreInterface<
//         string,
//         StateStoreEntity<K>
//     > {
//         const store = this.registry.get(key);
//
//         if (!store) {
//             throw new Error(
//                 `State store "${key}" is not registered`,
//             );
//         }
//
//         return store as StateStoreInterface<
//             string,
//             StateStoreEntity<K>
//         >;
//     }
//
//     async clearAll(): Promise<void> {
//         for (const store of this.registry.values()) {
//             await store.clear();
//         }
//     }
// }
//
// export default StateStoreService;