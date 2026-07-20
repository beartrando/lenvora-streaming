import type {WebSocket} from "ws";

type AuthenticatedWebSocket = WebSocket & {
    jwt?: string;
};

export const getJwtFromWs = (
    ws: WebSocket,
): string => {
    const token = (ws as AuthenticatedWebSocket).jwt;

    if (!token) {
        throw new Error("JWT is missing");
    }

    return token;
};
