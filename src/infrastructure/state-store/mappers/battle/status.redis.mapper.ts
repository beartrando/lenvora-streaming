// import Status from "../../../../domain/battle/value-objects/status.vo";
// import StatusEnum from "../../../../domain/battle/enums/status.enum";
//
// export class StatusRedisMapper {
//
//     static toPersistence(status: Status): string {
//         return status.value;
//     }
//
//     static toDomain(status: string): Status {
//         switch (status) {
//             case StatusEnum.New:
//                 return new Status(StatusEnum.New);
//             case StatusEnum.Active:
//                 return new Status(StatusEnum.Active);
//             case StatusEnum.Finished:
//                 return new Status(StatusEnum.Finished);
//             default:
//                 return new Status(StatusEnum.Unknown);
//         }
//     }
// }
//
// export default StatusRedisMapper;
