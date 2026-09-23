import BattleEntity from "./battle.entity";
import BattleMove from "./value-objects/battle-move.vo";
import BattleLeave from "./value-objects/battle-leave.vo";

import BattleMoveOperation from "./operations/battle-move.operation";
import BattleLeaveOperation from "./operations/battle-leave.operation";

import BattleCellRule from "./rules/battle-cell.rule";
import BattleDrawRule from "./rules/battle-draw.rule";
import BattleTurnRule from "./rules/battle-turn.rule";
import BattleWinRule from "./rules/battle-win.rule";
import BattleCreateOperation from "./operations/battle-init.operation";
import BattleStatusReadyRule from "./rules/battle-status-ready.rule";
import BattleStatusMatchedRule from "./rules/battle-status-matched.rule";
import logger from "@shared/logger";
import ProfileId from "../profile/value-objects/profile-id.vo";
import BattleStart from "./value-objects/battle-start.vo";
import BattleStartApprovedRule from "./rules/battle-start-approved.rule";
import BattleStartOperation from "./operations/battle-start.operation";
import BattleStatusStartedRule from "./rules/battle-status-started.rule";
import BattleStatusEnum from "./enums/battle-status.enum";
import BattleStatus from "./value-objects/battle-status.vo";

const cellRule = new BattleCellRule();
const turnRule = new BattleTurnRule();
const winRule = new BattleWinRule();
const drawRule = new BattleDrawRule();
const battleStatusReadyRule = new BattleStatusReadyRule();
const battleStatusMatchedRule = new BattleStatusMatchedRule();
const battleStatusStartedRule = new BattleStatusStartedRule();
const battleApprovedRule = new BattleStartApprovedRule();

const moveOperation = new BattleMoveOperation(
    battleStatusStartedRule,
    cellRule,
    turnRule,
    winRule,
    drawRule,
);

const leaveOperation = new BattleLeaveOperation(
    turnRule,
);

const startOperation = new BattleStartOperation(
    battleStatusReadyRule,
    battleApprovedRule,
);

const createOperation = new BattleCreateOperation(
    battleStatusMatchedRule,
);

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

    init(): BattleEntity {
        return createOperation.execute(this.entity);
    }

    leave(leave: BattleLeave): BattleEntity {
        logger.log(leave);
        return leaveOperation.execute(this.entity, leave);
    }

    turn(): ProfileId {
        return turnRule.calculate(this.entity);
    }

    start(start: BattleStart): BattleEntity {
        return startOperation.execute(this.entity, start);
    }

    cancel(): BattleEntity {
        this.entity.status = BattleStatus.create(BattleStatusEnum.Cancelled);
        return this.entity;
    }
}

export default BattleDomain;
