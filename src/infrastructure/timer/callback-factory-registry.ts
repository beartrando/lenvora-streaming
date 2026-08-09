import TimerCallbackFactoryRegistryInterface from "./interfaces/timer-callback-factory-registry.interface";
import TimerCallbackFactory from "./callbacks/timer-callback-factory";

export class TimerCallbackFactoryRegistry implements TimerCallbackFactoryRegistryInterface {
    private readonly factories = new Map<string, TimerCallbackFactory<any>>();

    register(factory: TimerCallbackFactory<any>): void {
        const key = factory.constructor.name;
        if (this.factories.has(key)) {
            throw new Error(`Timer callback factory "${key}" is already registered`,);
        }
        this.factories.set(key, factory);
    }

    get(key: string,): TimerCallbackFactory<any> {
        const factory = this.factories.get(key);
        if (!factory) {
            throw new Error(`Timer callback factory "${key}" is not registered`,);
        }
        return factory;
    }
}

export default TimerCallbackFactoryRegistry;
