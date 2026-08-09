import TimerCallbackFactory from "../callbacks/timer-callback-factory";

export interface TimerCallbackFactoryRegistryInterface {
    register(factory: TimerCallbackFactory<any>): void;

    get(key: string,): TimerCallbackFactory<any>;
}

export default TimerCallbackFactoryRegistryInterface;
