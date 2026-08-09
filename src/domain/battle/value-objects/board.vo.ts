import CellValueEnum from "../enums/cell-value.enum";

export class Board {
    readonly cells: readonly CellValueEnum[];

    constructor(cells: readonly CellValueEnum[]) {
        if (cells.length !== 9) {
            throw new Error("Board must contain 9 cells");
        }

        if (
            cells.some(
                cell => !Object.values(CellValueEnum).includes(cell),
            )
        ) {
            throw new Error("Invalid cell value");
        }

        this.cells = [...cells];
    }

    static empty(): Board {
        return new Board(
            Array(9).fill(CellValueEnum.EMPTY),
        );
    }

    move(
        cellIndex: number,
        value: CellValueEnum,
    ): Board {
        if (cellIndex < 0 || cellIndex >= this.cells.length) {
            throw new Error("Invalid cell index");
        }

        if (this.cells[cellIndex] !== CellValueEnum.EMPTY) {
            throw new Error("Cell is not empty");
        }

        const cells = [...this.cells];
        cells[cellIndex] = value;

        return new Board(cells);
    }
}

export default Board;
