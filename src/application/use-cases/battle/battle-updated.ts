import * as battleProto from "../../../contracts/proto/battle";
import * as streamingProto from "../../../contracts/proto/streaming";
import AuthHelper from "../../../infrastructure/grpc/helpers/auth.helper";
import Id from "../../../domain/common/value-objects/id.vo";
import BattleWebsocketSender from "../../../infrastructure/websocket/senders/battle-websocket.sender";
import logger from "@shared/logger";

export class BattleUpdatedUseCase {
    constructor(
        private readonly battleWebsocketSender: BattleWebsocketSender,
    ) {
    }

    async execute(
        battle: battleProto.BattleObject,
    ): Promise<void> {
        logger.log(battle);
        this.battleWebsocketSender.send(battle);
    }
}

export default BattleUpdatedUseCase;
