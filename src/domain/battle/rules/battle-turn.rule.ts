import BattleEntity from "../battle.entity";
import Id from "../../common/value-objects/id.vo";

export class BattleTurnRule {
    calculate(entity: BattleEntity): Id {
        const moves = entity.board.cells.filter(
            cell => cell !== "EMPTY",
        ).length;

        const playerIds = entity.playerIds.value;

        if (moves % 2 === 0) {
            return playerIds[0];
        }

        return playerIds[1];
    }
}

export default BattleTurnRule;
