import BattleEntity from "./battle.entity";
import BattleMove from "./value-objects/battle-move.vo";
import BattleLeave from "./value-objects/battle-leave.vo";

import BattleMoveOperation from "./operations/battle-move.operation";
import BattleLeaveOperation from "./operations/battle-leave.operation";

import BattleCellRule from "./rules/battle-cell.rule";
import BattleDrawRule from "./rules/battle-draw.rule";
import BattleTurnRule from "./rules/battle-turn.rule";
import BattleWinRule from "./rules/battle-win.rule";
import Id from "../common/value-objects/id.vo";
import BattleStartOperation from "./operations/battle-start.operation";

const cellRule = new BattleCellRule();
const turnRule = new BattleTurnRule();
const winRule = new BattleWinRule();
const drawRule = new BattleDrawRule();

const moveOperation = new BattleMoveOperation(
    cellRule,
    turnRule,
    winRule,
    drawRule,
);

const leaveOperation = new BattleLeaveOperation(
    turnRule,
);

const startOperation = new BattleStartOperation();

export class BattleDomain {
    private constructor(private readonly _entity: BattleEntity) {
    }

    get entity(): BattleEntity {
        return this._entity;
    }

    static of(entity: BattleEntity): BattleDomain {
        return new BattleDomain(entity);
    }

    move(move: BattleMove): BattleEntity {
        return moveOperation.execute(this.entity, move);
    }

    start(): BattleEntity {
        return startOperation.execute(this.entity);
    }

    leave(leave: BattleLeave): BattleEntity {
        return leaveOperation.execute(this.entity, leave);
    }

    turn(): Id {
        return turnRule.calculate(this.entity);
    }
}

export default BattleDomain;
