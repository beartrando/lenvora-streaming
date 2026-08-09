export const messageConsumersConfig: Record<string, string> = {
    battleUpdated: process.env.MESSAGE_CONSUMER_TOPIC_BATTLE_STARTED ?? 'battle.started',
};

export default messageConsumersConfig;

