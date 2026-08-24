import BattleId from "./value-objects/user-id.vo";

export type BattleEntityProps = {
    id?: BattleId;
};

export class BattleEntity {
    constructor(
        readonly id: BattleId,
    ) {
    }

    static create(props: BattleEntityProps): BattleEntity {
        return new BattleEntity(
            props.id ?? BattleId.create(),
        );
    }
}

export default BattleEntity;
