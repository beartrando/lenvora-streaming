import * as battleProto from "../../../../contracts/proto/battle";
import CellValueEnum from "../../../../domain/battle/enums/cell-value.enum";

export class CellValueProtoMapper {

    static toProto(cell: CellValueEnum): battleProto.BattleCellValue {
        switch (cell) {
            case CellValueEnum.EMPTY:
                return battleProto.BattleCellValue.CELL_EMPTY;
            case CellValueEnum.X:
                return battleProto.BattleCellValue.CELL_X;
            case CellValueEnum.O:
                return battleProto.BattleCellValue.CELL_O;
            default:
                throw new Error(`Unknown BattleCellValueEnum: ${cell}`);
        }


    }

    static toDomain(cell: battleProto.BattleCellValue): CellValueEnum {
        switch (cell) {
            case battleProto.BattleCellValue.CELL_EMPTY:
                return CellValueEnum.EMPTY;
            case battleProto.BattleCellValue.CELL_X:
                return CellValueEnum.X;
            case battleProto.BattleCellValue.CELL_O:
                return CellValueEnum.O;
            default:
                throw new Error(`Unknown BattleCellValueEnum: ${cell}`);
        }
    }

}

export default CellValueProtoMapper;
