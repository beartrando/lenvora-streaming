import Id from "../../../domain/common/value-objects/id.vo";
import BattleWebsocketsRegistry from "../../../infrastructure/websocket-server/registers/battle-websockets.registry";
import GrpcStreamService from "../../../infrastructure/grpc-stream/service";
import type {WebSocket} from "ws";

export class BattleLeaveUseCase {
    constructor(
        private readonly battleWebsocketsRegistry: BattleWebsocketsRegistry,
        private readonly engineStreamService: GrpcStreamService,
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
