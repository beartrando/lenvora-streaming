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
        const battleObject = await this.battleClient.start(grpcRequest, metadata);

        if (!battleObject?.battle) {
            return;
        }

        this.battleWebsocketsRegistry.subscribeBattle(ws, new Id(battleObject.battle.id));
        this.battleWebsocketSender.send(battleObject.battle);

    }
}

export default BattleStartUseCase;
