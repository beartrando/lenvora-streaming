import TimerKey from "../value-objects/timer-key.vo";
import TimerCallbackInterface from "./timer-callback.interface";

export interface TimerServiceInterface<KEntity, TEntity> {
    start(
        key: KEntity,
        timeoutMs: number,
        entity: TEntity,
    ): void;

    stop(
        key: KEntity,
    ): void;

    restart(
        key: KEntity,
        timeoutMs: number,
        entity: TEntity,
    ): void;
}

export default TimerServiceInterface;
