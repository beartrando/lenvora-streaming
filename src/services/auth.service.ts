import * as authClient from '../grpc/clients/auth.client';

export const register = async (email: string, password: string) =>
  await authClient.register(email, password);

export const login = async (email: string, password: string) =>
  await authClient.login(email, password);

export const refreshTokens = async (token: string) =>
  await authClient.refreshTokens(token);

export const logout = async (userId: string) =>
  await authClient.logout(userId);

export const forgotPassword = async (email: string) =>
  await authClient.forgotPassword(email);

export const resetPassword = async (token: string, newPassword: string) =>
  await authClient.resetPassword(token, newPassword);

export const health = async () =>
  await authClient.check();

export const status = async () =>
  await authClient.status();

export const livez = async () =>
  await authClient.livez();

export const readyz = async () =>
  await authClient.readyz();

export const anonymousSignIn = async (deviceId: string) => {
  return await authClient.anonymousSignIn(deviceId);
}
