import {randomUUID} from "crypto";

export class Id {
    constructor(
        readonly value: string,
    ) {
        if (!value) {
            throw new Error("DeviceId cannot be empty");
        }
    }

    static create(): Id {
        return new Id(randomUUID());
    }

    equals(other: Id): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }
}

export default Id;
