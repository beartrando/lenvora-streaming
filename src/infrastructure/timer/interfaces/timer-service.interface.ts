import TimerKey from "../value-objects/timer-key.vo";
import TimerCallbackInterface from "./timer-callback.interface";

export interface TimerServiceInterface {
    start(
        key: TimerKey,
        timeoutMs: number,
        callback: TimerCallbackInterface,
    ): void;

    stop(key: TimerKey): void;

    restart(
        key: TimerKey,
        timeoutMs: number,
        callback: TimerCallbackInterface,
    ): void;
}

export default TimerServiceInterface;
