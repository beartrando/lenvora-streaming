import TimerCallbackInterface from "../interfaces/timer-callback.interface";
import BattleTimeoutUseCase from "../../../application/use-cases/engine/battle-timeout";
import BattleEntity from "../../../domain/battle/battle.entity";
import TimerCallbackFactoryInterface from "../interfaces/timer-callback-factory.interface";

export class BattleTimeoutCallbackFactory implements TimerCallbackFactoryInterface<BattleEntity> {

    constructor(
        private readonly battleTimeoutUseCase: BattleTimeoutUseCase,
    ) {
    }

    create(entity: BattleEntity): TimerCallbackInterface {
        const battleId = entity.id;

        return async () => {
            await this.battleTimeoutUseCase.execute(battleId);
        };
    }
}

export default BattleTimeoutCallbackFactory;
