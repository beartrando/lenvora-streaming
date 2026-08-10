import * as streamingProto from "../../grpc/generated/streaming";
import * as engineProto from "../../grpc/generated/engine";
import EngineStream from "../../grpc/channels/engine.stream";

export class BattleMoveUseCase {
    constructor(
        private readonly engineStream: EngineStream,
    ) {
    }

    async execute(
        profileId: string,
        payload: streamingProto.BattleMove,
    ): Promise<void> {
        const grpcRequest = engineProto.BattleRequest.create({
            move: engineProto.BattleMove.create({
                profileId,
                ...payload,
            }),
        });

        this.engineStream.write(grpcRequest);
    }
}

export default BattleMoveUseCase;
