import { $Enums } from '@prisma/client';

export class CreateRoomDto {
  roomIdentificator: string;
  occupancylimit: number;
  status: $Enums.FuneralRoomStatus;
}
