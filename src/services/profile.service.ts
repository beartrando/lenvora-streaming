import * as profileClient from "../grpc/clients/profile.client";
import * as profileGrpc from "../grpc/generated/profile";

// export const health = async () =>
//   await profileClient.check();
//
// export const status = async () =>
//   await profileClient.status();
//
// export const livez = async () =>
//   await profileClient.livez();
//
// export const readyz = async () =>
//   await profileClient.readyz();

export const getProfileByUser = async (userId: string): Promise<profileGrpc.ProfileObject | null> =>
  await profileClient.getProfileByUser(userId);