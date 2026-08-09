import StatusEnum from "../enums/status.enum";

export class Status {
    constructor(
        readonly value: StatusEnum,
    ) {
    }

    equals(other: Status): boolean {
        return this.value === other.value;
    }
}

export default Status;
