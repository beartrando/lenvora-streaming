import type {WebSocket} from "ws";

export class BattlePingUseCase {
    constructor(
        // private readonly battleWebsocketsRegistry: BattleWebsocketsRegistry,
        // private readonly frontBattleStreamRegistry: FrontBattleStreamRegistry,
    ) {
    }

    async execute(ws: WebSocket): Promise<void> {
        // this.frontBattleStreamRegistry.writeStream(
        //     ws,
        //     emptyProto.Empty.create({}),
        // );
    }
}

export default BattlePingUseCase;
