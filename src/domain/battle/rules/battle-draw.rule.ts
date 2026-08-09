import BattleEntity from "../battle.entity";
import CellValueEnum from "../enums/cell-value.enum";

export class BattleDrawRule {
    calculate(entity: BattleEntity): boolean {
        return entity.board.cells.every(
            cell => cell !== CellValueEnum.EMPTY,
        );
    }
}

export default BattleDrawRule;
