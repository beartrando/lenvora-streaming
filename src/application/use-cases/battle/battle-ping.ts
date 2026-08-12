import type {WebSocket} from "ws";
import * as emptyProto from "../../grpc/generated/common/empty";
import FrontBattleStreamRegistry from "../../infrastructure/websocket/registers/front.battle.stream";

export class BattlePingUseCase {
    constructor(
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
