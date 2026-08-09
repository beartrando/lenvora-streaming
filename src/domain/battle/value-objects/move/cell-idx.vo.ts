export class CellIdx {
    constructor(public readonly value: number) {
        if (!Number.isInteger(value)) {
            throw new Error("Cell index must be an integer.");
        }

        if (value < 0 || value > 8) {
            throw new Error("Cell index must be between 0 and 8.");
        }
    }

    equals(other: CellIdx): boolean {
        return this.value === other.value;
    }
}

export default CellIdx;
