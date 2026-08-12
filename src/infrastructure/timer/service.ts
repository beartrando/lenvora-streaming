import TimerKey from "./value-objects/timer-key.vo";
import TimerServiceInterface from "./interfaces/timer-service.interface";
import TimerCallbackFactoryRegistry from "./callback-factory-registry";

export class TimerService implements TimerServiceInterface {
    private readonly timers = new Map<TimerKey, NodeJS.Timeout>();

    constructor(
        private readonly _callbackFactoryRegistry: TimerCallbackFactoryRegistry,
    ) {
    }

    get callbackFactoryRegistry(): TimerCallbackFactoryRegistry {
        return this._callbackFactoryRegistry;
    }

    start(
        key: string,
        timeoutMs: number,
        entity: any,
    ): void {
        const callbackFactory = this.callbackFactoryRegistry.get(key);

        const timerKey = callbackFactory.createKey(entity);
        const callback = callbackFactory.create(entity);

        this.stop(key, entity);

        const timer = setTimeout(async () => {
            this.timers.delete(timerKey);
            await callback();
        }, timeoutMs);

        this.timers.set(timerKey, timer);
    }

    stop(
        key: string,
        entity: any,
    ): void {
        const callbackFactory = this.callbackFactoryRegistry.get(key);

        const timerKey = callbackFactory.createKey(entity);

        const timer = this.timers.get(timerKey);

        if (!timer) {
            return;
        }

        clearTimeout(timer);
        this.timers.delete(timerKey);
    }

    restart(
        key: string,
        timeoutMs: number,
        entity: any,
    ): void {
        this.start(key, timeoutMs, entity);
    }
}

export default TimerService;
