// import * as battleClient from "../grpc/api/battle.client";
// import * as profileProto from "../grpc/generated/profile";
// import * as battleProto from "../grpc/generated/engine";
// import * as engineProto from "../grpc/generated/engine";
// import {BattleObject, BattleStatus} from "../grpc/generated/engine";
// import FrontBattleStreamRegistry from "../websocket/registers/front.engine.stream";
// import logger from "@shared/logger";
// import * as streamingProto from "../grpc/generated/streaming";
// import {metadataWithJwt} from "../lib/grpcRequestMetadata";
// import engineStream from "../grpc/registers/engine.stream";
//
// export const upsert = async (profileId: string, jwt: string) => {
//     const grpcRequest = profileProto.ProfileIdRequest.create({profileId});
//     const metadata = metadataWithJwt(jwt);
//
//     return await battleClient.upsert(grpcRequest, metadata);
// }
//
// export const join = async (battleId: string, profileId: string, jwt: string) => {
//     const grpcRequest: battleProto.BattleStartRequest = {battleId, profileId};
//     const metadata = metadataWithJwt(jwt);
//     return await battleClient.join(grpcRequest, metadata);
// }
//
// export const leave = async (battleId: string, profileId: string) => {
//     const grpcRequest = engineProto.BattleRequest.create({
//         leave: {
//             battleId,
//             profileId,
//         },
//     });
//
//     await engineStream.write(grpcRequest);
// };
//
// export const update = async (battle: BattleObject) => {
//     // logger.log('update engine:', engine);
//     try {
//         const message = streamingProto.BattleResponse.create({battle});
//
//         FrontBattleStreamRegistry.writeBattleStreams(battle.id, message);
//     } catch (e) {
//         logger.error(String(e));
//     }
//
//     if (battle.status == BattleStatus.FINISHED) {
//         logger.log(`Battle ${battle.id} finished. Closing streams...`);
//         const sockets = FrontBattleStreamRegistry.getBattleSockets(battle.id);
//
//         if (!sockets) {
//             return;
//         }
//
//         for (const ws of [...sockets]) {
//             FrontBattleStreamRegistry.unsubscribeBattle(ws, battle.id);
//         }
//         logger.log(`Removed battle ${battle.id} from activeBattleStreams`);
//     }
// };
