export interface TimerServiceInterface<KEntity> {
    start(
        entity: KEntity,
        timeoutS?: number,
    ): void;

    stop(
        entity: KEntity,
    ): void;

    restart(
        entity: KEntity,
        timeoutS?: number,
    ): void;
}

export default TimerServiceInterface;
