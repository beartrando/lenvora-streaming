// import CellValueEnum from "../../../../domain/engine/enums/cell-value.enum";
//
// export class CellValueRedisMapper {
//     static toPersistence(cell: CellValueEnum): string {
//         return cell;
//     }
//
//     static toDomain(cell: string): CellValueEnum {
//         if (!Object.values(CellValueEnum).includes(cell as CellValueEnum)) {
//             throw new Error(`Unknown CellValue: ${cell}`);
//         }
//
//         return cell as CellValueEnum;
//     }
// }
//
// export default CellValueRedisMapper;
