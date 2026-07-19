import * as engineClient from "../grpc/clients/engine.client";
import * as engineGrpc from '../grpc/generated/engine';

export const health = async () =>
  await engineClient.check();

export const status = async () =>
  await engineClient.status();

export const livez = async () =>
  await engineClient.livez();

export const readyz = async () =>
  await engineClient.readyz();

