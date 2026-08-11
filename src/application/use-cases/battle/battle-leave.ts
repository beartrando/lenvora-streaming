import * as streamingProto from "../../../contracts/proto/streaming";
import BattleClient from "../../../infrastructure/grpc/clients/battle.client";
import Id from "../../../domain/common/value-objects/id.vo";

export class BattleLeaveUseCase {
    constructor(
        private readonly battleClient: BattleClient,
    ) {
    }

    async execute(
        profileId: Id,
        battleId: Id,
    ): Promise<void> {
        // await this.battleService.leave(
        //     payload.battleId,
        //     profileId,
        // );
    }
}

export default BattleLeaveUseCase;
