import * as streamingProto from "../../../contracts/proto/streaming";
import * as engineProto from "../../../contracts/proto/engine";
import BattleWebsocketsRegistry from "../../../infrastructure/websocket-server/registers/battle-websockets.registry";
import GrpcStreamService from "../../../infrastructure/grpc-stream/service";
import type {WebSocket} from "ws";
import Id from "../../../domain/common/value-objects/id.vo";

export class BattleMoveUseCase {
    constructor(
        private readonly battleWebsocketsRegistry: BattleWebsocketsRegistry,
        private readonly grpcStreamService: GrpcStreamService,

    ) {
    }

    async execute(
        profileId: Id,
        payload: streamingProto.BattleMove,
    ): Promise<void> {
        const grpcRequest = engineProto.BattleRequest.create({
            move: engineProto.BattleMove.create({
                profileId: profileId.value,
                ...payload,
            }),
        });

        this.grpcStreamService.client.write(grpcRequest);
    }
}

export default BattleMoveUseCase;
