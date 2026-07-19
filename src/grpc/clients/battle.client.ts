import * as grpc from '@grpc/grpc-js';
import * as battleGrpc from '../generated/battle';
import * as healthGrpc from '../generated/common/health';
import * as emptyGrpc from '../generated/common/empty';
import * as profileGrpc from '../generated/profile';
import config from '../../config/config';
import {GrpcClientManager} from '@shared/grpc-client-manager';
import logger from "@shared/logger";

const battleManager = new GrpcClientManager<battleGrpc.BattleClient>(() => {
  return new battleGrpc.BattleClient(config.serviceBattleUrl, grpc.credentials.createInsecure());
});

// export const health = (): Promise<healthGrpc.HealthReport | null> => {
//   const grpcRequest: emptyGrpc.Empty = {};
//   return battleManager.call((client, cb) => client.check(grpcRequest, cb));
// };
//
// export const status = (): Promise<healthGrpc.StatusInfo | null> => {
//   const grpcRequest: emptyGrpc.Empty = {};
//   return battleManager.call((client, cb) => client.status(grpcRequest, cb));
// };
//
// export const livez = (): Promise<healthGrpc.LiveStatus | null> => {
//   const grpcRequest: emptyGrpc.Empty = {};
//   return battleManager.call((client, cb) => client.livez(grpcRequest, cb));
// };
//
// export const readyz = (): Promise<healthGrpc.ReadyStatus | null> => {
//   const grpcRequest: emptyGrpc.Empty = {};
//   return battleManager.call((client, cb) => client.readyz(grpcRequest, cb));
// };

export const joinBattle = (battleId: string, profileId: string): Promise<battleGrpc.BattleObject | null> => {

  const grpcRequest: battleGrpc.StartBattleRequest = {battleId, profileId};

  return battleManager.call<battleGrpc.BattleObject>((client, cb) => client.joinBattle(grpcRequest, cb)
  ).catch((err) => {
    logger.error("joinBattle failed:", err);
    return null;
  });
};


export const leaveBattle = (battleId: string, profileId: string): Promise<emptyGrpc.Empty | null> => {
  const grpcRequest: battleGrpc.BattleLeaveRequest = {battleId, profileId};
  return battleManager.call<emptyGrpc.Empty>(
    (client, cb) => client.leaveBattle(grpcRequest, cb)
  ).catch((err) => {
    logger.error("leaveBattle failed:", err);
    return null;
  });
};


export const upsertBattle = (profileId: string): Promise<battleGrpc.BattleObject | null> => {
  const grpcRequest = profileGrpc.ProfileIdRequest.create({profileId});
  return battleManager.call<battleGrpc.BattleObject>(
    (client, cb) => client.upsertBattle(grpcRequest, cb)
  ).catch((err) => {
    logger.error("Upsert battle failed:", err);
    return null;
  });
};
