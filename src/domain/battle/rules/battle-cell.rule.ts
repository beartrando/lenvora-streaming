import BattleEntity from "../battle.entity";
import CellIdx from "../value-objects/move/cell-idx.vo";
import CellValueEnum from "../enums/cell-value.enum";

export class BattleCellRule {
    calculate(
        entity: BattleEntity,
        cellIdx: CellIdx,
    ): boolean {
        return entity.board.cells[cellIdx.value] === CellValueEnum.EMPTY;
    }
}

export default BattleCellRule;
