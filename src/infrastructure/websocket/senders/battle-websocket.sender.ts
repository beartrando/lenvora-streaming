import * as streamingProto from "../../../contracts/proto/streaming";
import * as battleProto from "../../../contracts/proto/battle";
import BattleWebsocketsRegistry from "../registers/battle-websockets.registry";
import WebsocketSender from "./websocket.sender";
import Id from "../../../domain/common/value-objects/id.vo";
import SocketEncoding from "../enums/socket-encoding";

export class BattleWebsocketSender extends WebsocketSender {
    constructor(
        private readonly battleWebsocketsRegistry: BattleWebsocketsRegistry,
    ) {
        super();
    }

    send(battleObject: battleProto.BattleObject) {
        const sockets = this.battleWebsocketsRegistry.getBattleSockets(new Id(battleObject.id));
        if (!sockets) {
            return;
        }

        const streamResponse = streamingProto.BattleResponse.create({battle: battleObject})

        for (const ws of sockets) {
            const context = this.battleWebsocketsRegistry.getSocketContext(ws);
            this.writeStream(ws, streamResponse, context?.encoding?? SocketEncoding.PROTOBUF);
        }
    }
}

export default BattleWebsocketSender;


