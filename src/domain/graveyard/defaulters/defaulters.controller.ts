import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import { DefaultersService } from './defaulters.service';
import { CreateDefaulterDto } from './dto/create-defaulter.dto';
import { UpdateDefaulterDto } from './dto/update-defaulter.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { DeliquencyStatus } from '@prisma/client';

@ApiTags('Defaulters')
@Controller('defaulters')
export class DefaultersController {
  constructor(private readonly defaultersService: DefaultersService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo registro de inadimplência' })
  @ApiBody({ type: CreateDefaulterDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Registro de inadimplência criado com sucesso',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Registro de inadimplência criado com sucesso',
        },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Requisição inválida',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário ou gerenciamento financeiro não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro interno do servidor',
  })
  create(@Body() createDefaulterDto: CreateDefaulterDto) {
    return this.defaultersService.create(createDefaulterDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os registros de inadimplência' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de registros de inadimplência',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        count: { type: 'number', example: 10 },
        data: { type: 'array', items: { type: 'object' } },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro interno do servidor',
  })
  findAll() {
    return this.defaultersService.findAll();
  }

  @Get('by-assignee/:assigneeId')
  @ApiOperation({ summary: 'Buscar registros de inadimplência por usuário' })
  @ApiParam({
    name: 'assigneeId',
    type: 'number',
    description: 'ID do usuário',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de registros de inadimplência do usuário',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        count: { type: 'number', example: 5 },
        data: { type: 'array', items: { type: 'object' } },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuário não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro interno do servidor',
  })
  findByAssignee(@Param('assigneeId', ParseIntPipe) assigneeId: number) {
    return this.defaultersService.findByAssignee(assigneeId);
  }

  @Get('by-status')
  @ApiOperation({ summary: 'Buscar registros de inadimplência por status' })
  @ApiQuery({
    name: 'status',
    type: 'string',
    required: true,
    description: 'Status do registro de inadimplência',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Lista de registros de inadimplência com o status especificado',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        count: { type: 'number', example: 8 },
        data: { type: 'array', items: { type: 'object' } },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro interno do servidor',
  })
  findByStatus(@Query('status') status: DeliquencyStatus) {
    return this.defaultersService.findByStatus(status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um registro de inadimplência pelo ID' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID do registro de inadimplência',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Registro de inadimplência encontrado',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Registro de inadimplência não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro interno do servidor',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.defaultersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um registro de inadimplência' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID do registro de inadimplência',
  })
  @ApiBody({ type: UpdateDefaulterDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Registro de inadimplência atualizado com sucesso',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Registro de inadimplência atualizado com sucesso',
        },
        data: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Requisição inválida',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Registro de inadimplência não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro interno do servidor',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDefaulterDto: UpdateDefaulterDto,
  ) {
    return this.defaultersService.update(id, updateDefaulterDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um registro de inadimplência' })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID do registro de inadimplência',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Registro de inadimplência removido com sucesso',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        message: {
          type: 'string',
          example: 'Registro de inadimplência removido com sucesso',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Registro de inadimplência não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Não é possível remover o registro pois ele está vinculado a outros registros',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro interno do servidor',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.defaultersService.remove(id);
  }
}
