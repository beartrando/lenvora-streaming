import {WebSocket,} from "ws";

import Id from "../../../domain/common/value-objects/id.vo";
import TimerService from "../../../infrastructure/timer/service";

export class BattleTimeoutUseCase {
    constructor(
        private readonly timerService: TimerService,
    ) {
    }

    async execute(ws: WebSocket): Promise<void> {
        // await this.battleService.leave(
        //     payload.battleId,
        //     profileId,
        // );
    }
}

export default BattleTimeoutUseCase;
