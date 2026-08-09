import TimerCallbackInterface from "./interfaces/timer-callback.interface";
import TimerKey from "./value-objects/timer-key.vo";
import TimerServiceInterface from "./interfaces/timer-service.interface";

export class TimerService implements TimerServiceInterface {
    private readonly timers = new Map<TimerKey, NodeJS.Timeout>();

    start(
        key: TimerKey,
        timeoutMs: number,
        callback: TimerCallbackInterface,
    ): void {
        this.stop(key);

        const timer = setTimeout(async () => {
            this.timers.delete(key);
            await callback();
        }, timeoutMs);

        this.timers.set(key, timer);
    }

    stop(key: TimerKey): void {
        const timer = this.timers.get(key);

        if (!timer) {
            return;
        }

        clearTimeout(timer);
        this.timers.delete(key);
    }

    restart(
        key: TimerKey,
        timeoutMs: number,
        callback: TimerCallbackInterface,
    ): void {
        this.start(key, timeoutMs, callback);
    }
}

export default TimerService;
