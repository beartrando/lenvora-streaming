import * as battleProto from "../../../contracts/proto/battle";
import BattleWebsocketSender from "../../../infrastructure/websocket/senders/battle-websocket.sender";
import TimerService from "../../../infrastructure/timer/service";
import BattleWebsocketsRegistry from "../../../infrastructure/websocket/registers/battle-websockets.registry";
import BattleId from "../../../domain/battle/value-objects/user-id.vo";

export class BattleUpdatedUseCase {
    constructor(
        private readonly battleWebsocketSender: BattleWebsocketSender,
        // private readonly battleWebsocketsRegistry: BattleWebsocketsRegistry,
        // private readonly timerService: TimerService,
    ) {
    }

    async execute(
        battle: battleProto.BattleObject,
    ): Promise<void> {
        // logger.log(battle);
        // this.battleWebsocketsRegistry.getBattleSockets(new BattleId(battle.id));
        // this.timerService.restart(ws);

        this.battleWebsocketSender.send(battle);
    }
}

export default BattleUpdatedUseCase;
