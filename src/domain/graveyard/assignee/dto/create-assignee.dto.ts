import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';

export class CreatePaymentOldDto {
  @ApiProperty({ description: 'The ID of the payment', example: 1 })
  id: number;

  @ApiProperty({ description: 'The value of the payment', example: 100 })
  valuePayment: number;

  @ApiProperty({ description: 'The payment date', example: '2025-12-31' })
  paymentDate: Date;

  @ApiProperty({ description: 'The due date', example: '2025-12-31' })
  dueDate: Date;

  @ApiProperty({ description: 'The amount paid', example: 100 })
  amountPaid: number;

  @ApiProperty({ description: 'The document number', example: '123456' })
  nDoc: string;

  @ApiProperty({ description: 'The installment number', example: 1 })
  nInstallment: number;

  @ApiProperty({ description: 'The status of the payment', example: 'PAID' })
  status: string;

  @ApiProperty({ description: 'The ID of the assignee', example: 1 })
  assigneeId: number;
}

export class CreateAddressDto {
  @ApiProperty({ description: 'The address name', example: '123 Main St.' })
  address_name: string;

  @ApiProperty({ description: 'The city', example: 'Belo Horizonte' })
  city: string;

  @ApiProperty({ description: 'The state', example: 'MG' })
  state: string;

  @ApiProperty({ description: 'The zipcode', example: '12345-678' })
  zipcode: string;

  @ApiProperty({ description: 'The neighborhood', example: 'Centro' })
  neighborhood: string;

  adress_number: string;
}

export class CreateRelationshipDto {
  fullName: string;
  phoneNumber: string;
  identityNumber: string;
  identityType: $Enums.IdentityType;
  ownershipNumber: number;
  relationship: $Enums.Relationship;
  assigneeId?: number;
}

export class LocalPaymentDto {
  assigneeId: number;
  valtId: number;
  file: Express.Multer.File;
  method: $Enums.MethodType;
  prohibited: boolean;
  prohibitedValue?: number;
  totalValue?: number;
  installmentQuantity?: number;
}
export class CreateBusinessDto {
  @ApiProperty({ description: 'The enterprise', example: 'Enterprise Inc.' })
  enterprise: string;

  @ApiProperty({ description: 'The business position', example: 'Manager' })
  businessPosition: string;

  @ApiProperty({
    description: 'The business phone number',
    example: '+55 31 98765-4321',
  })
  businessPhone: string;

  @ApiProperty({
    description: 'The business email',
    example: 'business@example.com',
  })
  businessEmail: string;

  @ApiProperty({
    description: 'The business address',
    example: '123 Business St.',
  })
  businessAddress: string;

  @ApiProperty({ description: 'The business city', example: 'Belo Horizonte' })
  businessCity: string;

  @ApiProperty({ description: 'The business state', example: 'MG' })
  businessState: string;

  @ApiProperty({ description: 'The business zipcode', example: '12345-678' })
  businessZipcode: string;

  businessAddressNumber: string;
}

export class CreatePaymentDto {
  @ApiProperty({ description: 'The transaction type', example: 'SALE' })
  transactionType: string;

  @ApiProperty({ description: 'The payment type', example: 'CREDIT_CARD' })
  payType: string;

  @ApiProperty({ description: 'The number of installments', example: 12 })
  payInstallments: number;

  @ApiProperty({ description: 'The payment date', example: '2025-12-31' })
  paymentDate: Date;

  @ApiProperty({ description: 'The discount', example: 10 })
  discount: number;

  @ApiProperty({ description: 'The due date', example: '2025-12-31' })
  dueDate: string;

  @ApiProperty({ description: 'The due day', example: '31' })
  dueDay: string;

  @ApiProperty({ description: 'The maintenance value', example: 100 })
  maintenanceValue: number;

  @ApiProperty({ description: 'The maintenance period', example: 'MONTHLY' })
  maintenancePeriod: string;

  @ApiProperty({ description: 'The type of contract', example: 'RENT' })
  typeContract: string;

  @ApiProperty({
    description: 'The URL of the contract',
    example: 'http://example.com/contract',
  })
  url: string;

  @ApiProperty({
    description: 'Indicates if the contract is signed',
    example: true,
  })
  assinado: boolean;
}

export class CreateAssigneDto {
  @ApiProperty({
    description: 'The ID of the assignee',
    example: 1,
    required: false,
  })
  id?: number;

  @ApiProperty({
    description: 'The registration number of the assignee',
    example: 123456,
    required: false,
  })
  registration?: number;

  @ApiProperty({
    description: 'The birthdate of the assignee',
    example: '1990-01-01',
  })
  birthdate: Date;

  @ApiProperty({ description: 'The name of the assignee', example: 'John Doe' })
  name: string;

  @ApiProperty({
    description: 'The CPF of the assignee',
    example: '123.456.789-00',
  })
  cpf: string;

  @ApiProperty({
    description: 'The RG of the assignee',
    example: 'MG-12.345.678',
  })
  rg: string;

  @ApiProperty({
    description: 'The phone number of the assignee',
    example: '+55 31 98765-4321',
  })
  phone: string;

  @ApiProperty({
    description: 'The email of the assignee',
    example: 'john.doe@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'The marital status of the assignee',
    example: 'Single',
  })
  maritalStatus: string;

  @ApiProperty({
    description: 'The nationality of the assignee',
    example: 'Brazilian',
  })
  nationality: string;

  @ApiProperty({ description: 'The address of the assignee' })
  address: CreateAddressDto;

  @ApiProperty({ description: 'The relationship details of the assignee' })
  responsibles: CreateRelationshipDto[];

  @ApiProperty({ description: 'The business details of the assignee' })
  business: CreateBusinessDto;

  @ApiProperty({
    description: 'The enterprise of the assignee',
    example: 'Enterprise Inc.',
  })
  enterprise: string;

  @ApiProperty({
    description: 'The business position of the assignee',
    example: 'Manager',
  })
  businessPosition: string;

  businessAddressNumber: string;

  @ApiProperty({
    description: 'The business phone number of the assignee',
    example: '+55 31 98765-4321',
  })
  businessPhone: string;

  @ApiProperty({
    description: 'The business email of the assignee',
    example: 'business@example.com',
  })
  businessEmail: string;

  @ApiProperty({
    description: 'The business address of the assignee',
    example: '123 Business St.',
  })
  businessAddress: string;

  @ApiProperty({
    description: 'The business city of the assignee',
    example: 'Belo Horizonte',
  })
  businessCity: string;

  @ApiProperty({
    description: 'The business state of the assignee',
    example: 'MG',
  })
  businessState: string;

  @ApiProperty({
    description: 'The business zipcode of the assignee',
    example: '12345-678',
  })
  businessZipcode: string;

  @ApiProperty({ description: 'The status of the assignee', example: true })
  status: boolean;

  @ApiProperty({
    description: 'The ID of the square',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  squaresId: string;

  @ApiProperty({ description: 'The ID of the valt', example: 1 })
  valtsId: number;

  @ApiProperty({
    description: 'The ID of the drawer',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  drawersId: string;

  @ApiProperty({ description: 'The sale value of the valt', example: 1000 })
  saleValue: number;

  @ApiProperty({ description: 'The rent value of the valt', example: 500 })
  rentValue: number;

  @ApiProperty({ description: 'The payment details of the assignee' })
  payment: CreatePaymentDto;

  @ApiProperty({ description: 'The old payment details of the assignee' })
  paymentOld: CreatePaymentOldDto;
}

export class CreateDocumentDto {
  @ApiProperty({
    description: 'The UUID of the document',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  documentUuid: string;

  @ApiProperty({
    description: 'The status of the document',
    example: 'PENDENTE',
  })
  documentStatus: string;

  @ApiProperty({
    description: 'The ID of the assignee associated with the document',
    example: 1,
  })
  assigneeId: number;
}

export type ContractType =
  | 'VENDA_GAVETA'
  | 'VENDA_JAZIGO'
  | 'ALUGUEL_GAVETA'
  | 'ALUGUEL_JAZIGO';

export class GenerateContractDto {
  contractType: ContractType;
  valtId?: number;
  drawerId?: string;
  assigneeId: number;
}
