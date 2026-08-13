// import type {WebSocket} from "ws";
// import * as streamingProto from "../../../contracts/proto/streaming";
// import WebsocketHandlerInterface from "../interfaces/websocket-handler.interface";
//
// import BattleStartUseCase from "../../../application/use-cases/battle/battle-start";
// import BattleMoveUseCase from "../../../application/use-cases/battle/battle-move";
// import BattleLeaveUseCase from "../../../application/use-cases/battle/battle-leave";
// import BattleConnectBotUseCase from "../../../application/use-cases/battle/battle-connect-bot";
// import BattlePingUseCase from "../../../application/use-cases/battle/battle-ping";
// import SocketEncoding from "../enums/socket-encoding";
//
// export class BattleHandler implements WebsocketHandlerInterface {
//     constructor(
//         private readonly start: BattleStartUseCase,
//         private readonly move: BattleMoveUseCase,
//         private readonly ping: BattlePingUseCase,
//         private readonly connectBot: BattleConnectBotUseCase,
//         private readonly leave: BattleLeaveUseCase,
//     ) {
//     }
//
//     writeBattleStreams(battleId: string, streamRequest: streamingProto.BattleResponse) {
//         const sockets = this.getBattleSockets(battleId);
//         if (!sockets) {
//             return;
//         }
//
//         for (const socket of sockets) {
//             this.writeStream(socket, streamRequest);
//         }
//     }
//
//     writeStream(ws: WebSocket, streamRequest: streamingProto.BattleResponse) {
//         // logger.log("new websocket channel message:", streamRequest);
//
//         const encoding =
//             this.getSocketContext(ws)?.encoding ?? SocketEncoding.PROTOBUF;
//
//         const buffer =
//             encoding === SocketEncoding.PROTOBUF
//                 ? streamingProto.BattleResponse.encode(streamRequest).finish()
//                 : JSON.stringify(streamRequest);
//
//         if (ws.readyState === WebSocket.OPEN) {
//             ws.send(buffer);
//         }
//     }
// }
//
// export default BattleHandler;
//
//
