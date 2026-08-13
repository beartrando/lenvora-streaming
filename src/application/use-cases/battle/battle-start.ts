import * as battleProto from "../../../contracts/proto/battle";

import BattleWebsocketsRegistry from "../../../infrastructure/websocket-server/registers/battle-websockets.registry";
import AccessToken from "../../../domain/common/value-objects/access-token.vo";
import BattleClient from "../../../infrastructure/grpc/clients/battle.client";
import AuthHelper from "../../../infrastructure/grpc/helpers/auth.helper";
import Id from "../../../domain/common/value-objects/id.vo";

export class BattleStartUseCase {
    constructor(
        private readonly battleWebsocketsRegistry: BattleWebsocketsRegistry,
        private readonly battleClient: BattleClient,
    ) {
    }

    async execute(
        accessToken: AccessToken,
        profileId: Id,
        battleId?: Id,
    ): Promise<void> {

        const grpcRequest = battleProto.BattleStartRequest.create({
            profileId: profileId.value,
            battleId: battleId ? battleId.value : undefined
        });
        const metadata = AuthHelper.getMetadata(accessToken);
        await this.battleClient.start(grpcRequest, metadata);
    }
}

export default BattleStartUseCase;
