import * as battleProto from "../../../contracts/proto/battle";
import BattleWebsocketSender from "../../../infrastructure/websocket/senders/battle-websocket.sender";

export class BattleUpdatedUseCase {
    constructor(
        private readonly battleWebsocketSender: BattleWebsocketSender,
    ) {
    }

    async execute(
        battle: battleProto.BattleObject,
    ): Promise<void> {
        // logger.log(battle);
        this.battleWebsocketSender.send(battle);
    }
}

export default BattleUpdatedUseCase;
