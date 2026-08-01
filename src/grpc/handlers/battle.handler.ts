// import * as grpc from '@grpc/grpc-js';
// import * as battleProto from '../generated/battle';
// import * as streamingProto from '../generated/streaming';
// import grpcRequestMetadata from "../../utils/grpcRequestMetadata";
// import * as engineService from "../../services/engine.service";
// import * as battleService from "../../services/battle.service";
// import logger from "@shared/logger";
// import BattleStreamRegistry from "../../channels/engine.battle.stream";
//
// export async function battleChannel(
//   call: grpc.ServerDuplexStream<streamingProto.BattleRequest, battleProto.BattleObject>) {
//
//   call.on('data', async (event: streamingProto.BattleRequest) => {
//
//
//     const userId = grpcRequestMetadata(call);
//
//     if (event.join) {
//       logger.log("Battle join event");
//       const battle = await battleService.upsertBattle(userId);
//
//       if (!battle) {
//         call.emit("error", new Error("Battle not found"));
//         return;
//       }
//       BattleStreamRegistry.setBattleStream(battle.id, call);
//       logger.log("Battle stream was set:" + battle.id);
//       BattleStreamRegistry.writeBattleStreams(battle);
//     }
//
//     if (event.move) {
//       logger.log("Battle move event");
//       if (userId != event.move.userId) {
//         call.emit("error", new Error("Unknown error"));
//       }
//       engineService.makeMove(event.move);
//     }
//
//     // if (event.leave) {
//     //   const battleId = event.leave.battleId;
//     //   const streams = battleStreams.get(battleId);
//     //   if (streams) {
//     //     streams.delete(call);
//     //     if (streams.size === 0) {
//     //       battleStreams.delete(battleId);
//     //     }
//     //   }
//     //   call.end();
//     // }
//     //
//     // if (event.end) {
//     //   const battleId = event.end.battleId;
//     //   const streams = battleStreams.get(battleId);
//     //   if (streams) {
//     //     for (const stream of streams) {
//     //       stream.end();
//     //     }
//     //     battleStreams.delete(battleId);
//     //   }
//     // }
//     //
//     // if (event.ping) {
//     //   call.write({ ping: true } as any); // можно вернуть простое подтверждение
//     // }
//   });
// }
//
