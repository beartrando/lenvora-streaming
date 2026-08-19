import {WebSocket} from 'ws';
import * as battleProto from "../../../contracts/proto/battle";

import BattleWebsocketsRegistry from "../../../infrastructure/websocket/registers/battle-websockets.registry";
import AccessToken from "../../../domain/common/value-objects/access-token.vo";
import BattleClient from "../../../infrastructure/grpc/clients/battle.client";
import AuthHelper from "../../../infrastructure/grpc/helpers/auth.helper";
import Id from "../../../domain/common/value-objects/id.vo";
import logger from "@shared/logger";
import BattleWebsocketSender from "../../../infrastructure/websocket/senders/battle-websocket.sender";

export class BattleStartUseCase {
    constructor(
        private readonly battleWebsocketSender: BattleWebsocketSender,
        private readonly battleWebsocketsRegistry: BattleWebsocketsRegistry,
        private readonly battleClient: BattleClient,
    ) {
    }

    async execute(
        ws: WebSocket,
        accessToken: AccessToken,
        profileId: Id,
        battleId?: Id,
    ): Promise<void> {

        const grpcRequest = battleProto.BattleStartRequest.create({
            profileId: profileId.value,
            battleId: battleId ? battleId.value : undefined
        });
        const metadata = AuthHelper.getMetadata(accessToken);
        // logger.log(grpcRequest);
        const battleResponse = await this.battleClient.start(grpcRequest, metadata);

        // logger.log(battleResponse);
        if (!battleResponse?.battle) {
            return;
        }
        // logger.log(battleResponse.battle);

        this.battleWebsocketsRegistry.subscribeBattle(ws, new Id(battleResponse.battle.id));

        this.battleWebsocketSender.send(battleResponse.battle);

    }
}

export default BattleStartUseCase;
