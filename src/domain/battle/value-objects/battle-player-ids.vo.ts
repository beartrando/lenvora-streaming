import BattleCellValueEnum from "../enums/battle-cell-value.enum";
import ProfileId from "../../profile/value-objects/profile-id.vo";

export class BattlePlayerIds {
    constructor(
        readonly value: readonly ProfileId[],
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

    cellValueOf(playerId: ProfileId): BattleCellValueEnum {
        if (this.value[0].equals(playerId)) {
            return BattleCellValueEnum.X;
        }

        if (
            this.value.length === 2 &&
            this.value[1].equals(playerId)
        ) {
            return BattleCellValueEnum.O;
        }

        throw new Error("Player does not belong to battle");
    }

    opponentOf(playerId: ProfileId): ProfileId | null {
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

export default BattlePlayerIds;
