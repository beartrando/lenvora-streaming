export class WebsocketService implements TokenService {
    async start(): Promise<void> {
    }

    async stop(): Promise<void> {
    }

    async check(): Promise<boolean> {
        return true;
    }
}

export default WebsocketService;
