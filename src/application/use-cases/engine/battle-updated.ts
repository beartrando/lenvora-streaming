import Id from "../../../domain/common/value-objects/id.vo";
import BattleWebsocketsRegistry from "../../../infrastructure/websocket-server/registers/battle-websockets.registry";
import GrpcStreamService from "../../../infrastructure/grpc-stream/service";
import type {WebSocket} from "ws";
import * as battleProto from "../../../contracts/proto/battle";

export class BattleUpdatedUseCase {
    constructor(
        // private readonly battleWebsocketsRegistry: BattleWebsocketsRegistry,
        // private readonly grpcStreamService: GrpcStreamService,
    ) {
    }

    async execute(
        battleId: battleProto.BattleObject,
    ): Promise<void> {
        // await this.battleService.leave(
        //     payload.battleId,
        //     profileId,
        // );
    }
}

export default BattleUpdatedUseCase;
