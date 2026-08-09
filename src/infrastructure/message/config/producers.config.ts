export const messageProducersConfig: Record<string, string> = {
    battleUpdated: process.env.MESSAGE_PRODUCER_TOPIC_BATTLE_UPDATED ?? 'engine.battle_updated',
    battleStarted: process.env.MESSAGE_PRODUCER_TOPIC_BATTLE_STARTED ?? 'engine.battle_started',
};

export default messageProducersConfig;
