import * as streamingProto from "../../grpc/generated/streaming";
import BattleService from "../../services/battle.service";

export class BattleLeaveUseCase {
    constructor(
        private readonly battleService: BattleService,
    ) {
    }

    async execute(
        profileId: string,
        payload: streamingProto.BattleLeave,
    ): Promise<void> {
        await this.battleService.leave(
            payload.battleId,
            profileId,
        );
    }
}

export default BattleLeaveUseCase;
