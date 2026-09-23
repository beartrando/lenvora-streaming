import * as battleProto from "../../../../contracts/proto/battle";
import BattleCellValueEnum from "../../../../domain/battle/enums/battle-cell-value.enum";

export class BattleCellValueProtoMapper {

    static toProto(cell: BattleCellValueEnum): battleProto.BattleCellValue {
        switch (cell) {
            case BattleCellValueEnum.EMPTY:
                return battleProto.BattleCellValue.CELL_EMPTY;
            case BattleCellValueEnum.X:
                return battleProto.BattleCellValue.CELL_X;
            case BattleCellValueEnum.O:
                return battleProto.BattleCellValue.CELL_O;
            default:
                throw new Error(`Unknown BattleCellValueEnum: ${cell}`);
        }


    }

    static toDomain(cell: battleProto.BattleCellValue): BattleCellValueEnum {
        switch (cell) {
            case battleProto.BattleCellValue.CELL_EMPTY:
                return BattleCellValueEnum.EMPTY;
            case battleProto.BattleCellValue.CELL_X:
                return BattleCellValueEnum.X;
            case battleProto.BattleCellValue.CELL_O:
                return BattleCellValueEnum.O;
            default:
                throw new Error(`Unknown BattleCellValueEnum: ${cell}`);
        }
    }

}

export default BattleCellValueProtoMapper;
