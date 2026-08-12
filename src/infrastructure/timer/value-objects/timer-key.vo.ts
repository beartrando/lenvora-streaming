import Id from "../../../domain/common/value-objects/id.vo";

export class TimerKey {
    private constructor(readonly value: string) {
    }

    static create<TEntity extends { id: Id }>(entity: TEntity): TimerKey {
        return new TimerKey(entity.id.value);
    }

    toString(): string {
        return this.value;
    }
}

export default TimerKey;
