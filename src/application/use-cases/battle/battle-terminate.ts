import BattleRepository from "../../../domain/battle/battle.repository";
import BattleEntity from "../../../domain/battle/battle.entity";
import BattleId from "../../../domain/battle/value-objects/battle-id.vo";

export class BAttleTerminateUseCase {
    constructor(
        private readonly battleRepository: BattleRepository,
    ) {
    }

    async execute(battleId: BattleId): Promise<BattleEntity|null> {

        const battle = await this.battleRepository.findById(battleId);
        if (!battle) {
            return null;
        }
        battle.cancel();
        return await this.battleRepository.save(battle);
    }
}


export default BAttleTerminateUseCase;

