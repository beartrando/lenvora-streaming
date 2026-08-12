import TimerCallbackInterface from "../interfaces/timer-callback.interface";
import BattleTimeoutUseCase from "../../../application/use-cases/engine/battle-timeout";
import BattleEntity from "../../../domain/battle/battle.entity";
import TimerCallbackFactoryInterface from "../interfaces/timer-callback-factory.interface";
import {WebSocket,} from "ws";

export class BattleTimeoutCallbackFactory implements TimerCallbackFactoryInterface<WebSocket> {

    constructor(
        private readonly battleTimeoutUseCase: BattleTimeoutUseCase,
    ) {
    }

    create(entity: WebSocket): TimerCallbackInterface {
        return async () => {
            await this.battleTimeoutUseCase.execute(entity);
        };
    }
}

export default BattleTimeoutCallbackFactory;
