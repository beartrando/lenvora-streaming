import WebsocketServerConfig from "../types/websocket-server-config";

export const websocketServerConfig: WebsocketServerConfig = {
    port: Number(process.env.WEBSOCKET_PORT ?? 8080),
};

export default websocketServerConfig;
