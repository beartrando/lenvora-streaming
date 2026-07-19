import * as battleClient from "../grpc/clients/battle.client";
import FrontBattleStreamRegistry from "../websocket/channels/front.battle.stream";
import {BattleObject, BattleStatus} from "../grpc/generated/battle";
import logger from "@shared/logger";
import * as streamingGrpc from "../grpc/generated/streaming";

// export const health = async () =>
//   await battleClient.check();
//
// export const status = async () =>
//   await battleClient.status();
//
// export const livez = async () =>
//   await battleClient.livez();
//
// export const readyz = async () =>
//   await battleClient.readyz();

export const upsertBattle = async (profileId: string) =>
  await battleClient.upsertBattle(profileId);

export const joinBattle = async (battleId: string, profileId: string) =>
  await battleClient.joinBattle(battleId, profileId);

export const leaveBattle = async (battleId: string, profileId: string) =>
  await battleClient.leaveBattle(battleId, profileId);

export const updateBattle = async (battle: BattleObject) => {
  // logger.log('update battle:', battle);
  try {
    const message = streamingGrpc.BattleStreamResponse.create({battle});

    FrontBattleStreamRegistry.writeBattleStreams(battle.id, message);
  } catch (e) {
    logger.error(String(e));
  }

  if (battle.status == BattleStatus.FINISHED) {
    logger.log(`Battle ${battle.id} finished. Closing streams...`);
    FrontBattleStreamRegistry.deleteBattleStreams(battle.id);
    logger.log(`Removed battle ${battle.id} from activeBattleStreams`);
  }
};
