import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';

export class CreateDeceasedDto {
  seal: string;
  drawerId: string;
  valtId: string;
  assigneeId: string;
  graveRegistration: string;
  typeOfGrave: string;
  buriedIn: string; // ISO date string
  deceasedIn: string; // ISO date string
  observations: string;
  transferDate: string; // ISO date string
  funeralHome: string;
  vehiclePlate: string;
  driverName: string;
  authorizeBurial: boolean;
  status: string;
  registration: string;
  addObservation: boolean;
  relationship: string;
  declaredBy: string;
  registryOffice: string;
  crm: string;
  doctorName: string;
  deathCause: string;
  religion: string;
  motherName: string;
  fatherName: string;
  birthPlace: string;
  gender: string;
  race: string;
  maritalStatus: string;
  birthDay: string; // ISO date string
  fullName: string;
  identificationDoc: string;
  docType: string;
}

export class AttachDocumentsDto {
  files: any[];
  names: string[];
  deceasedId?: string;
}
