import JobService from "../../../infrastructure/job/service";
import StateStore from "../../../infrastructure/state-store/state-stores/state-store";
import {WebSocket} from "ws";
import SocketContext from "../../../infrastructure/websocket/types/socket-context";
import * as streamingProto from "../../../contracts/proto/streaming";
import ProfileId from "../../../domain/profile/value-objects/profile-id.vo";
import BattleId from "../../../domain/battle/value-objects/user-id.vo";

export class BattleConnectBotUseCase {
    constructor(
        private readonly jobService: JobService,
        private readonly wsSocketContextStateStore: StateStore<WebSocket, SocketContext>,
        private readonly battleWsStateStore: StateStore<string, Set<WebSocket>>,
        private readonly aiConnectingRequest: string,
    ) {
    }

    async execute(
        profileId: ProfileId,
        battleId: BattleId,
    ): Promise<void> {

        const websockets = this.battleWsStateStore.get(battleId.value);
        if (!websockets) {
            return;
        }

        for (const websocket of websockets) {
            const context = this.wsSocketContextStateStore.get(websocket);
            if (profileId === context?.profileId) {
                const message = streamingProto.BattleJoinBot.create({battleId: battleId.value});
                await this.jobService.enqueue(this.aiConnectingRequest, message);
            }
        }
    }
}

export default BattleConnectBotUseCase;
