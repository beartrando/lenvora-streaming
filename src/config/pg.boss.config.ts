const pgBossConfig = {
    max: Number(process.env.PG_BOSS_MAX) || 5,
    maintenanceIntervalSeconds: Number(process.env.PG_BOSS_MAINTENANCE_INTERVAL_SECONDS) || 60,
    applicationName: process.env.PG_BOSS_APPLICATION_NAME || 'streaming-pg-boss',
};

export default pgBossConfig;
