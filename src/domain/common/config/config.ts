export const domainConfig = {
    heartbeatTimeout: Number(process.env.HEARTBEAT_TIMEOUT ?? 30),//engine heartbeat.
};

export default domainConfig;

