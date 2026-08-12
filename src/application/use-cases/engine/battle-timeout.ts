import Id from "../../../domain/common/value-objects/id.vo";
import BattleWebsocketsRegistry from "../../../infrastructure/websocket-server/registers/battle-websockets.registry";
import GrpcStreamService from "../../../infrastructure/grpc-stream/service";
import type {WebSocket} from "ws";
import * as engineProto from "../../../contracts/proto/engine";

export class BattleTimeoutUseCase {
    constructor(
    ) {
    }

    async execute(
    ): Promise<void> {
        // await this.battleService.leave(
        //     payload.battleId,
        //     profileId,
        // );
    }
}

export default BattleTimeoutUseCase;
