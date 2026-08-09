import Id from "../../../domain/common/value-objects/id.vo";

export class TimerKey {
    private constructor(
        readonly value: string,
    ) {
    }

    static create<TEntity extends { id: Id }>(
        entity: TEntity,
        event?: string,
    ): TimerKey {
        const scope = entity.constructor.name;
        const entityId = entity.id.value;
        const eventKey = event ? `:${event}` : "";

        return new TimerKey(`${scope}:${entityId}${eventKey}`);
    }

    toString(): string {
        return this.value;
    }
}

export default TimerKey;
