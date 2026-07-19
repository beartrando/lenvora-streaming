// import * as OrchestrationClient from "../grpc/clients/orchestration.client";
// import * as grpc from "@grpc/grpc-js";
// import getUserIdFromMetadata from "../lib/getUserIdFromMetadata";
//
// export const health = async () =>
//   await OrchestrationClient.check();
//
// export const status = async () =>
//   await OrchestrationClient.status();
//
// export const livez = async () =>
//   await OrchestrationClient.livez();
//
// export const readyz = async () =>
//   await OrchestrationClient.readyz();
//
// export const getMyProfile = async (metadata: grpc.Metadata) => {
//   const userId = getUserIdFromMetadata(metadata);
//   await OrchestrationClient.getMyProfile(userId);
// }
