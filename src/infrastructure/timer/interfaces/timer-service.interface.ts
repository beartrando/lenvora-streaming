export interface TimerServiceInterface<KEntity> {
    start(
        entity: KEntity,
        timeoutMs?: number,
    ): void;

    stop(
        entity: KEntity,
    ): void;

    restart(
        entity: KEntity,
        timeoutMs?: number,
    ): void;
}

export default TimerServiceInterface;
