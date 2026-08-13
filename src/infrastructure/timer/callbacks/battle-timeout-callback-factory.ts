import TimerCallbackInterface from "../interfaces/timer-callback.interface";
import TimerCallbackFactoryInterface from "../interfaces/timer-callback-factory.interface";
import BattleLeaveUseCase from "../../../application/use-cases/battle/battle-leave";
import BattleLeaveData from "../value-objects/battle-leave-data.vo";

export class BattleTimeoutCallbackFactory implements TimerCallbackFactoryInterface<BattleLeaveData> {

    constructor(
        private readonly battleLeaveUseCase: BattleLeaveUseCase,
    ) {
    }

    create(entity: BattleLeaveData): TimerCallbackInterface {
        return async () => {
            await this.battleLeaveUseCase.execute(entity.profileId, entity.battleId);
        };
    }
}

export default BattleTimeoutCallbackFactory;
