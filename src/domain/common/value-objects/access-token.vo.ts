export class AccessToken {
    constructor(
        readonly value: string,
    ) {
        if (!value) {
            throw new Error("AccessToken cannot be empty");
        }
    }

    equals(other: AccessToken): boolean {
        return this.value === other.value;
    }

    toString(): string {
        return this.value;
    }
}

export default AccessToken;
