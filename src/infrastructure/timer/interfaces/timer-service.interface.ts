export interface TimerServiceInterface<KEntity> {
    start(
        entity: TEntity,
        timeoutMs?: number,
    ): void;

    stop(
        entity: TEntity,
    ): void;

    restart(
        entity: TEntity,
        timeoutMs?: number,
    ): void;
}

export default TimerServiceInterface;
