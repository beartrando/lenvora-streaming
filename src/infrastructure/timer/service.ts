import TimerServiceInterface from "./interfaces/timer-service.interface";
import TimerCallbackFactoryHolderInterface from "./interfaces/timer-callback-factory-holder.interface";

export class TimerService<TEntity> implements TimerServiceInterface<TEntity> {
    private readonly timers = new Map<TEntity, NodeJS.Timeout>();

    constructor(
        private readonly _callbackFactoryHolder: TimerCallbackFactoryHolderInterface<TEntity>,
        private readonly timeoutMs: number,
    ) {
    }

    start(
        entity: TEntity,
        timeoutMs?: number,
    ): void {
        const timeout = timeoutMs ?? this.timeoutMs;
        const callbackFactory = this._callbackFactoryHolder.factory;

        const callback = callbackFactory.create(entity);

        this.stop(entity);

        const timer = setTimeout(async () => {
            this.timers.delete(entity);
            await callback();
        }, timeout);

        this.timers.set(entity, timer);
    }

    stop(
        entity: TEntity,
    ): void {
        const timer = this.timers.get(entity);

        if (!timer) {
            return;
        }

        clearTimeout(timer);
        this.timers.delete(entity);
    }

    restart(
        entity: TEntity,
        timeoutMs?: number,
    ): void {
        this.start(entity, timeoutMs);
    }
}

export default TimerService;
