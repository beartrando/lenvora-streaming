import {WebSocket,} from "ws";

import Id from "../../../domain/common/value-objects/id.vo";
import TimerService from "../../../infrastructure/timer/service";
import TimerKey from "../../../infrastructure/timer/value-objects/timer-key.vo";

export class BattleTimeoutUseCase {
    constructor(
        private readonly timerService: TimerService<TimerKey, WebSocket>,
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
