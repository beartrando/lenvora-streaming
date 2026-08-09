export const appConfig = {
    appName: process.env.APP_NAME ?? 'engine',
    appVersion: process.env.APP_VERSION ?? '0.0.0',
    appEnv: process.env.APP_ENV ?? 'prod',
};

export default appConfig;
