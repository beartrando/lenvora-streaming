import Id from "../../common/value-objects/id.vo";

export type LeaveProps = {
    battleId: Id;
    profileId: Id;
};

export class BattleLeave {
    public constructor(
        public readonly battleId: Id,
        public readonly profileId: Id,
    ) {
    }

    static create(props: LeaveProps): BattleLeave {
        return new BattleLeave(
            props.battleId,
            props.profileId,
        );
    }
}

export default BattleLeave;
