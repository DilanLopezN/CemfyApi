import { ApiProperty } from '@nestjs/swagger';
import { $Enums } from '@prisma/client';

interface Dimensions {
  width: number;
  height: number;
  // Adicione outros campos conforme necessário
}

export class CreateValtType {
  @ApiProperty({
    description: 'The ID of the valt type',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The type of the valt',
    example: 'Type A',
  })
  valtType: string;

  @ApiProperty({
    description: 'Indicates if the valt type is available',
    example: true,
  })
  available: boolean;

  @ApiProperty({
    description: 'Value of rent default to type',
    example: 1000,
  })
  rentValue: number;

  @ApiProperty({
    description: 'Value of sale default to type',
    example: 1000,
  })
  saleValue: number;
}

export class CreateValtDto {
  @ApiProperty({
    description: 'The ID of the square',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  squaresId: string;

  @ApiProperty({
    description: 'The quantity of drawers',
    example: 10,
  })
  drawersQuantity: number;

  @ApiProperty({
    description: 'The coordinates of the valt',
    example: { x: 10, y: 20 },
    required: false,
  })
  coordenates?: Record<string, any>;

  @ApiProperty({
    description: 'The dimensions of the valt',
    example: { width: 100, height: 200 },
    required: false,
  })
  dimensions?: Record<string, any>;

  @ApiProperty({
    description: 'The image of the valt',
    example: 'image-url',
  })
  image: string;

  @ApiProperty({
    description: 'The status of the square',
    example: 'AVAILABLE',
  })
  status: $Enums.SquareStatus;

  @ApiProperty({
    description: 'The identificator of the valt',
    example: 'VALT-123',
  })
  identificator: string;

  @ApiProperty({
    description: 'The sale value of the valt',
    example: 1000,
  })
  saleValue: number;

  @ApiProperty({
    description: 'The rent value of the valt',
    example: 500,
  })
  rentValue: number;

  @ApiProperty({
    description: 'The type of the valt',
    required: false,
  })
  valtType?: CreateValtType;

  @ApiProperty({
    description: 'The ID of the sector',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  sectorsId: string;
}

export class BuyValtDto {
  @ApiProperty({
    description: 'The payment type',
    example: 'CREDIT_CARD',
  })
  paymentType: $Enums.MethodType;

  @ApiProperty({
    description: 'The ID of the assignee',
    example: 1,
  })
  assigneeId: number;

  @ApiProperty({
    description: 'The ID of the valt',
    example: 1,
  })
  valtId: number;

  @ApiProperty({
    description: 'The quantity of installments',
    example: 12,
  })
  installmentQuantity: number;

  @ApiProperty({
    description: 'Indicates if the payment is in installments',
    example: true,
  })
  installment: boolean;

  @ApiProperty({
    description: 'The expiration date of the payment',
    example: '2025-12-31',
  })
  expireDate: string;

  @ApiProperty({
    description: 'The credit token for the payment',
    example: 'credit-token',
    required: false,
  })
  creditToken?: string;

  @ApiProperty({
    description: 'Discount allowed in purchase',
    example: '100',
    required: false,
  })
  discountValue?: number;

  rentType?: 'BOLIX' | 'CREDITO';

  items?: Array<{
    id?: string;
    name: string;
    value: number;
    amount: number;
  }>;

  isEntry?: boolean;
  entryValue?: number;
}

export class ValtMaintenanceDto {
  @ApiProperty({
    description: 'The ID of the assignee',
    example: 1,
  })
  assigneeId: number;

  @ApiProperty({
    description: 'The ID of the valt',
    example: 1,
  })
  valtId: number;

  @ApiProperty({
    description: 'The payment type',
    example: 'CREDIT_CARD',
  })
  paymentType: $Enums.MethodType;

  @ApiProperty({
    description: 'The type of maintenance',
    example: 'CLEANING',
  })
  maintenanceType: $Enums.MaintenanceChoice;

  @ApiProperty({
    description: 'The credit token for the payment',
    example: 'credit-token',
    required: false,
  })
  creditToken?: string;

  @ApiProperty({
    description: 'The expiration date of the payment',
    example: '2025-12-31',
    required: false,
  })
  expireDate?: string;
}

export class ValtImageCoordenatesDto {
  @ApiProperty({
    description: 'The ID of the valt',
    example: 1,
  })
  valtId: number;

  @ApiProperty({
    description: 'The coordinates of the valt',
    example: { x: 10, y: 20 },
  })
  coordenates: Record<string, any>;
}
