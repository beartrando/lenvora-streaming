import BattleEntity from "../battle.entity";
import BattleLeave from "../value-objects/battle-leave.vo";
import BattleTurnRule from "../rules/battle-turn.rule";

export class BattleLeaveOperation {
    constructor(
        private readonly turnRule: BattleTurnRule,
    ) {
    }

    execute(
        entity: BattleEntity,
        leave: BattleLeave,
    ): BattleEntity {
        const currentPlayerId = this.turnRule.calculate(entity);

        // здесь логика leave
        // ...

        return entity;
    }
}

export default BattleLeaveOperation;
