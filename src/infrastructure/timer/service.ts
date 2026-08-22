import TimerServiceInterface from "./interfaces/timer-service.interface";
import TimerCallbackFactoryHolderInterface from "./interfaces/timer-callback-factory-holder.interface";
import logger from "@shared/logger";

export class TimerService<TEntity> implements TimerServiceInterface<TEntity> {
    private readonly timers = new Map<TEntity, NodeJS.Timeout>();

    constructor(
        private readonly _callbackFactoryHolder: TimerCallbackFactoryHolderInterface<TEntity>,
        private readonly timeoutS: number,
    ) {
    }

    start(
        entity: TEntity,
        timeoutS?: number,
    ): void {
        const timeout = 1000*(timeoutS ?? this.timeoutS);
        const callbackFactory = this._callbackFactoryHolder.factory;

        const callback = callbackFactory.create(entity);

        // logger.log('1');
        // logger.log(timeout);
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
        timeoutS?: number,
    ): void {
        this.start(entity, timeoutS);
    }
}

export default TimerService;
