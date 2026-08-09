import Id from "../../common/value-objects/id.vo";
import CellValueEnum from "../enums/cell-value.enum";

export class PlayerIds {
    constructor(
        readonly value: readonly Id[],
    ) {
        if (value.length < 1 || value.length > 2) {
            throw new Error(
                "Battle must contain one or two players",
            );
        }

        if (
            value.length === 2 &&
            value[0].equals(value[1])
        ) {
            throw new Error(
                "Players must be different",
            );
        }
    }

    cellValueOf(playerId: Id): CellValueEnum {
        if (this.value[0].equals(playerId)) {
            return CellValueEnum.X;
        }

        if (
            this.value.length === 2 &&
            this.value[1].equals(playerId)
        ) {
            return CellValueEnum.O;
        }

        throw new Error("Player does not belong to battle");
    }

    opponentOf(playerId: Id): Id | null {
        const index = this.value.findIndex(
            id => id.equals(playerId),
        );

        if (index === -1) {
            throw new Error("Player does not belong to battle");
        }

        if (this.value.length === 1) {
            return null;
        }

        return this.value[index === 0 ? 1 : 0];
    }
}

export default PlayerIds;
