export const messageProducersConfig: Record<string, string> = {
    botConnectingRequest: process.env.MESSAGE_TOPIC_BOT_CONNECTING_REQUEST ?? 'bot.connecting-request',
};
export default messageProducersConfig;
