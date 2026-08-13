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
        // try {
        //     const message = streamingProto.BattleResponse.create({battle});
        //
        //     FrontBattleStreamRegistry.writeBattleStreams(battle.id, message);
        // } catch (e) {
        //     logger.error(String(e));
        // }
        //
        // if (battle.status == BattleStatus.FINISHED) {
        //     logger.log(`Battle ${battle.id} finished. Closing streams...`);
        //     const sockets = FrontBattleStreamRegistry.getBattleSockets(battle.id);
        //
        //     if (!sockets) {
        //         return;
        //     }
        //
        //     for (const ws of [...sockets]) {
        //         FrontBattleStreamRegistry.unsubscribeBattle(ws, battle.id);
        //     }
        //     logger.log(`Removed battle ${battle.id} from activeBattleStreams`);
        // }
    }
}

export default BattleUpdatedUseCase;
