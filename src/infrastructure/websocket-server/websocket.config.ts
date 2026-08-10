import WebsocketConfig from "./types";

export const websocketConfig: WebsocketConfig = {
    port: Number(process.env.WEBSOCKET_PORT) ?? 8080,
};

export default websocketConfig;
