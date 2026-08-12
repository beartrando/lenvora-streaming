import TimerKey from "../value-objects/timer-key.vo";
import TimerCallbackInterface from "./timer-callback.interface";

export interface TimerServiceInterface {
    start(
        key: string,
        timeoutMs: number,
        entity: any,
    ): void;

    stop(
        key: string,
        entity: any,
    ): void;

    restart(
        key: string,
        timeoutMs: number,
        entity: any,
    ): void;
}

export default TimerServiceInterface;
