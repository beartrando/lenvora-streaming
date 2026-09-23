import BattleStatusEnum from "../enums/battle-status.enum";

export class BattleStatus {
    constructor(
        readonly value: BattleStatusEnum,
    ) {
    }

    static create(status: BattleStatusEnum) {
        return new BattleStatus(status);
    }

    equals(other: BattleStatus): boolean {
        return this.value === other.value;
    }
}

export default BattleStatus;
