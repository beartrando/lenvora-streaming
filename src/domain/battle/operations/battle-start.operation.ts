import BattleEntity from "../battle.entity";
import Board from "../value-objects/board.vo";
import StatusEnum from "../enums/status.enum";
import Status from "../value-objects/status.vo";

export class BattleStartOperation {
    constructor() {
    }

    execute(
        entity: BattleEntity,
    ): BattleEntity {

        // logger.log('New battle started', battle)
        entity.board = Board.empty();
        entity.status = new Status(StatusEnum.Active);
        entity.winnerId = null;

        return entity;

    }
}

export default BattleStartOperation;

