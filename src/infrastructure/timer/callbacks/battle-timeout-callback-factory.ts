import {WebSocket} from "ws";
import TimerCallbackInterface from "../interfaces/timer-callback.interface";
import TimerCallbackFactoryInterface from "../interfaces/timer-callback-factory.interface";
import WebsocketDisconnectUseCase from "../../../application/use-cases/websocket/websocket-disconnect";

export class BattleTimeoutCallbackFactory implements TimerCallbackFactoryInterface<WebSocket> {

    constructor(
        private readonly websocketDisconnectUseCase: WebsocketDisconnectUseCase,
    ) {
    }

    create(ws: WebSocket): TimerCallbackInterface {
        return async () => {
            // logger.log(2333);
            await this.websocketDisconnectUseCase.execute(ws);
        };
    }
}

export default BattleTimeoutCallbackFactory;
