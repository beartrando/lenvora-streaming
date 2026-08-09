import BattleEntity from "../battle.entity";
import BattleMove from "../value-objects/battle-move.vo";

import BattleCellRule from "../rules/battle-cell.rule";
import BattleDrawRule from "../rules/battle-draw.rule";
import BattleTurnRule from "../rules/battle-turn.rule";
import BattleWinRule from "../rules/battle-win.rule";

export class BattleMoveOperation {
    constructor(
        private readonly cellRule: BattleCellRule,
        private readonly turnRule: BattleTurnRule,
        private readonly winRule: BattleWinRule,
        private readonly drawRule: BattleDrawRule,
    ) {
    }

    execute(
        entity: BattleEntity,
        move: BattleMove,
    ): BattleEntity {
        const playerId = move.profileId;

        if (playerId != this.turnRule.calculate(entity)) {
            return entity;
        }

        if (!this.cellRule.calculate(entity, move.cellIdx)) {
            return entity;
        }

        entity.move(move);

        if (this.winRule.calculate(entity)) {
            entity.finish(playerId);
        } else if (this.drawRule.calculate(entity)) {
            entity.finish();
        }

        return entity;
    }
}

export default BattleMoveOperation;
