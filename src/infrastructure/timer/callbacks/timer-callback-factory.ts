import TimerKey from "../value-objects/timer-key.vo";
import Id from "../../../domain/common/value-objects/id.vo";
import TimerCallbackInterface from "../interfaces/timer-callback.interface";

export abstract class TimerCallbackFactory<TEntity extends {
    id: Id
}> {
    protected abstract readonly event: string;

    createKey(entity: TEntity): TimerKey {
        return TimerKey.create(entity, this.event);
    }


    abstract create(entity: TEntity): TimerCallbackInterface;
}

export default TimerCallbackFactory;
