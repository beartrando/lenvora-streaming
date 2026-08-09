import Board from "./value-objects/board.vo";
import PlayerIds from "./value-objects/player-ids.vo";
import Status from "./value-objects/status.vo";
import BattleStatusEnum from "./enums/status.enum";
import BattleMove from "./value-objects/battle-move.vo";
import BattleLeave from "./value-objects/battle-leave.vo";
import Id from "../common/value-objects/id.vo";

export type BattleEntityProps = {
    id?: Id;
    playerIds: PlayerIds;
    board?: Board;
    status?: Status;
    winnerId?: Id | null;
    lastMoveAt?: Date | null;
};

export class BattleEntity {
    constructor(
        readonly id: Id,
        readonly playerIds: PlayerIds,
        public board: Board,
        public status: Status,
        public winnerId: Id | null,
        public lastMoveAt: Date | null,
    ) {
    }

    static create(props: BattleEntityProps): BattleEntity {
        return new BattleEntity(
            props.id ?? Id.create(),
            props.playerIds,
            props.board ?? Board.empty(),
            props.status ?? new Status(BattleStatusEnum.New),
            props.winnerId ?? null,
            props.lastMoveAt ?? null,
        );
    }

    start(): BattleEntity {
        this.board = Board.empty();
        this.status = new Status(BattleStatusEnum.Active);
        this.winnerId = null;
        this.lastMoveAt = new Date();

        return this;
    }

    move(move: BattleMove): BattleEntity {
        const cellValue = this.playerIds.cellValueOf(move.profileId);

        this.board = this.board.move(
            move.cellIdx.value,
            cellValue,
        );

        this.lastMoveAt = new Date();

        return this;
    }

    leave(leave: BattleLeave): BattleEntity {
        this.status = new Status(BattleStatusEnum.Finished);
        this.winnerId = this.playerIds.opponentOf(leave.profileId);
        this.lastMoveAt = new Date();

        return this;
    }

    finish(playerId?: Id): BattleEntity {
        this.status = new Status(BattleStatusEnum.Finished);
        if (playerId) {
            this.winnerId = playerId;
        }

        return this;
    }
}

export default BattleEntity;
