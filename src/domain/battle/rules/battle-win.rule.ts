import BattleEntity from "../battle.entity";
import CellValueEnum from "../enums/cell-value.enum";

export class BattleWinRule {
    calculate(entity: BattleEntity): boolean {
        const cells = entity.board.cells;

        const winningLines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],

            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],

            [0, 4, 8],
            [2, 4, 6],
        ];

        return winningLines.some(([a, b, c]) => {
            const value = cells[a];

            return (
                value !== CellValueEnum.EMPTY &&
                value === cells[b] &&
                value === cells[c]
            );
        });
    }
}

export default BattleWinRule;
