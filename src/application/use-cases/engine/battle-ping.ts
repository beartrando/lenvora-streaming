import type {WebSocket} from "ws";
import * as emptyProto from "../../grpc/generated/common/empty";
import FrontBattleStreamRegistry from "../../infrastructure/websocket/registers/front.engine.stream";
import BattleWebsocketsRegistry from "../../../infrastructure/websocket-server/registers/battle-websockets.registry";

export class BattlePingUseCase {
    constructor(
        private readonly battleWebsocketsRegistry: BattleWebsocketsRegistry,
        private readonly frontBattleStreamRegistry: FrontBattleStreamRegistry,
    ) {
    }

    async execute(ws: WebSocket): Promise<void> {
        this.frontBattleStreamRegistry.writeStream(
            ws,
            emptyProto.Empty.create({}),
        );
    }
}

export default BattlePingUseCase;
