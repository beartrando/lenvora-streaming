import TimerCallbackInterface from "../interfaces/timer-callback.interface";
// import BattleTimeoutUseCase from "../../../application/use-cases/engine/engine-timeout";
import BattleEntity from "../../../domain/battle/battle.entity";
import {TimerCallbackFactory} from "./timer-callback-factory";

export class BattleTimeoutCallbackFactory extends TimerCallbackFactory<BattleEntity> {

    protected readonly event = "leave";

    constructor(
        // private readonly battleTimeoutUseCase: BattleTimeoutUseCase,
    ) {
        super();
    }

    create(entity: BattleEntity): TimerCallbackInterface {
        const battleId = entity.id;

        return async () => {
            // await this.battleTimeoutUseCase.execute(battleId);
        };
    }
}

export default BattleTimeoutCallbackFactory;
