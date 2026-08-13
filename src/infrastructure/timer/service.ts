import TimerServiceInterface from "./interfaces/timer-service.interface";
import TimerCallbackFactoryHolderInterface from "./interfaces/timer-callback-factory-holder.interface";

export class TimerService<KEntity, TEntity> implements TimerServiceInterface<KEntity, TEntity> {
    private readonly timers = new Map<KEntity, NodeJS.Timeout>();

    constructor(
        private readonly _callbackFactoryHolder: TimerCallbackFactoryHolderInterface<TEntity>,
        private readonly timeoutMs: number,
    ) {
    }

    start(
        key: KEntity,
        entity: TEntity,
        timeoutMs?: number,
    ): void {
        const timeout = timeoutMs ?? this.timeoutMs;
        const callbackFactory = this._callbackFactoryHolder.factory;

        const callback = callbackFactory.create(entity);

        this.stop(key);

        const timer = setTimeout(async () => {
            this.timers.delete(key);
            await callback();
        }, timeout);

        this.timers.set(key, timer);
    }

    stop(
        key: KEntity,
    ): void {
        const timer = this.timers.get(key);

        if (!timer) {
            return;
        }

        clearTimeout(timer);
        this.timers.delete(key);
    }

    restart(
        key: KEntity,
        entity: TEntity,
        timeoutMs?: number,
    ): void {
        this.start(key, entity, timeoutMs);
    }
}

export default TimerService;
