export const messageProducersConfig: Record<string, string> = {
    aiConnectingRequest: process.env.MESSAGE_TOPIC_AI_CONNECTING_REQUEST ?? 'bot.connecting-request',
};
export default messageProducersConfig;
