import Id from "../common/value-objects/id.vo";

export type BattleEntityProps = {
    id?: Id;
};

export class BattleEntity {
    constructor(
        readonly id: Id,
    ) {
    }

    static create(props: BattleEntityProps): BattleEntity {
        return new BattleEntity(
            props.id ?? Id.create(),
        );
    }
}

export default BattleEntity;
