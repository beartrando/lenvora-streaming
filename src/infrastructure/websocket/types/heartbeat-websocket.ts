import {WebSocket} from "ws";

export type HeartbeatWebSocket = WebSocket & {
    isAlive: boolean;
};

export default HeartbeatWebSocket;
