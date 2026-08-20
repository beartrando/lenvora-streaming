import Id from "../../../domain/common/value-objects/id.vo";
import * as engineProto from "../../../contracts/proto/engine";
import BattleWebsocketsRegistry from "../../../infrastructure/websocket/registers/battle-websockets.registry";
import GrpcStreamService from "../../../infrastructure/grpc-stream/service";

export class BattleLeaveUseCase {
    constructor(
        private readonly battleWebsocketsRegistry: BattleWebsocketsRegistry,
        private readonly grpcStreamService: GrpcStreamService<engineProto.BattleRequest>,
    ) {
    }

    async execute(
        profileId: Id,
        battleId: Id,
    ): Promise<void> {
        const grpcRequest = engineProto.BattleRequest.create({
            leave: engineProto.BattleLeave.create({
                battleId: battleId.value,
                profileId: profileId.value,
            }),
        });
        this.grpcStreamService.stream.write(grpcRequest);
    }
}

export default BattleLeaveUseCase;
