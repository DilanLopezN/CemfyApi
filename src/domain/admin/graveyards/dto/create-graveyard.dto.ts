import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGraveyardDto {
  @ApiProperty({ description: 'Nome do cemitério' })
  nameGraveyard: string;

  @ApiProperty({ description: 'Nome da empresa' })
  nameEnterprise: string;

  @ApiProperty({
    description: 'CNPJ da empresa',
    example: '00.000.000/0000-00',
  })
  cnpj: string;

  @ApiProperty({ description: 'CEP do endereço', example: '00000-000' })
  cep: string;

  @ApiProperty({ description: 'Rua do endereço' })
  street: string;

  @ApiProperty({ description: 'Número do endereço' })
  streetNumber: string;

  @ApiPropertyOptional({ description: 'Bairro do endereço' })
  neighborhood?: string;

  @ApiPropertyOptional({ description: 'Cidade do endereço' })
  city?: string;

  @ApiProperty({ description: 'Estado do endereço', example: 'SP' })
  state: string;

  @ApiPropertyOptional({
    description: 'Número de telefone',
    example: '(00) 00000-0000',
  })
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'URL da imagem' })
  image?: string;

  @ApiProperty({ description: 'ID do parceiro' })
  partnerId: string;

  @ApiPropertyOptional({ description: 'Indica se está ativo', default: true })
  isActive?: boolean;
}
