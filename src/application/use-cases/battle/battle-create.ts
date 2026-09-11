import {WebSocket} from 'ws';
import * as battleProto from "../../../contracts/proto/battle";

import BattleWebsocketsRegistry from "../../../infrastructure/websocket/registers/battle-websockets.registry";
import SessionAccessToken from "../../../domain/session/value-objects/session-access-token.vo";
import BattleClient from "../../../infrastructure/grpc/clients/battle.client";
import AuthHelper from "../../../infrastructure/grpc/helpers/auth.helper";
import BattleWebsocketSender from "../../../infrastructure/websocket/senders/battle-websocket.sender";
import ProfileId from "../../../domain/profile/value-objects/profile-id.vo";
import BattleId from "../../../domain/battle/value-objects/user-id.vo";
import logger from "@shared/logger";

export class BattleCreateUseCase {
    constructor(
        private readonly battleWebsocketSender: BattleWebsocketSender,
        private readonly battleWebsocketsRegistry: BattleWebsocketsRegistry,
        private readonly battleClient: BattleClient,
    ) {
    }

    async execute(
        ws: WebSocket,
        accessToken: SessionAccessToken,
        profileId: ProfileId,
        battleId?: BattleId,
    ): Promise<void> {

        // logger.log(
        //     accessToken,
        //     profileId,
        //     battleId,
        // )
        const grpcRequest = battleProto.BattleInitRequest.create({
            profileId: profileId.value,
            battleId: battleId ? battleId.value : undefined
        });
        const metadata = AuthHelper.getMetadata(accessToken);
        // logger.log(grpcRequest);
        const battleResponse = await this.battleClient.create(grpcRequest, metadata);

        // logger.log(battleResponse);

        if (!battleResponse?.battle) {
            return;
        }
        // logger.log(battleResponse.battle);

        this.battleWebsocketsRegistry.subscribeBattle(ws, new BattleId(battleResponse.battle.id));

        this.battleWebsocketSender.send(battleResponse.battle);

    }
}

export default BattleCreateUseCase;
