import * as battleProto from "../../../../contracts/proto/battle";
import CellValueProtoMapper from "./cell-value.proto.mapper";
import Board from "../../../../domain/battle/value-objects/board.vo";

export class BoardProtoMapper {

    static toProto(board: Board): battleProto.BattleCellValue[] {
        return board.cells.map(CellValueProtoMapper.toProto);
    }

    static toDomain(
        cells: readonly battleProto.BattleCellValue[],
    ): Board {
        return new Board(cells.map(CellValueProtoMapper.toDomain));
    }
}

export default BoardProtoMapper;
