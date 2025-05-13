import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  InternalServerErrorException,
  HttpStatus,
  HttpCode,
  BadRequestException,
  NotFoundException,
  ParseIntPipe,
  ValidationPipe,
  Logger,
  UseInterceptors,
  ClassSerializerInterceptor,
  Query,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { ValtsService } from './valts.service';
import {
  BuyValtDto,
  CreateValtDto,
  CreateValtType,
  ValtImageCoordenatesDto,
  ValtMaintenanceDto,
} from './dto/create-valt.dto';
import { UpdateValtDto } from './dto/update-valt.dto';

@ApiTags('valts')
@Controller('valts')
@UseInterceptors(ClassSerializerInterceptor)
export class ValtsController {
  private readonly logger = new Logger(ValtsController.name);

  constructor(private readonly valtsService: ValtsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar um novo jazigo' })
  @ApiBody({ type: CreateValtDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Jazigo criado com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos fornecidos',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro interno no servidor',
  })
  async create(
    @Body(new ValidationPipe({ transform: true })) createValtDto: CreateValtDto,
  ) {
    try {
      const result = await this.valtsService.create(createValtDto);
      return {
        status: HttpStatus.CREATED,
        message: 'Jazigo criado com sucesso',
        data: result,
      };
    } catch (error) {
      this.handleError(error, error.message);
    }
  }

  @Post('type')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Criar um novo tipo de jazigo' })
  @ApiBody({ type: CreateValtType })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tipo de jazigo criado com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos fornecidos',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro interno no servidor',
  })
  async createValtType(
    @Body(new ValidationPipe({ transform: true }))
    createValtType: CreateValtType,
  ) {
    try {
      const result = await this.valtsService.createValtType(createValtType);
      return {
        status: HttpStatus.CREATED,
        message: 'Tipo de jazigo criado com sucesso',
        data: result,
      };
    } catch (error) {
      this.handleError(error, 'Erro ao criar tipo de jazigo');
    }
  }

  @Get('type')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obter todos os tipos de jazigos' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de tipos de jazigos obtida com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro interno no servidor',
  })
  async findAllValtType() {
    try {
      const result = await this.valtsService.findAllValtTypes();
      return {
        status: HttpStatus.OK,
        message: 'Tipos de jazigos obtidos com sucesso',
        data: result,
      };
    } catch (error) {
      this.handleError(error, 'Erro ao buscar tipos de jazigos');
    }
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obter todos os jazigos' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Limite de registros a serem retornados',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Número de registros a serem pulados',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de jazigos obtida com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro interno no servidor',
  })
  async findAll(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    try {
      // O serviço atual não implementa paginação, mas adicionei a estrutura
      const result = await this.valtsService.findAll();
      return {
        status: HttpStatus.OK,
        message: 'Jazigos obtidos com sucesso',
        data: result,
        metadata: {
          total: result.length,
          // Se a paginação for implementada no serviço, estes valores seriam dinâmicos
          limit: limit || result.length,
          offset: offset || 0,
        },
      };
    } catch (error) {
      this.handleError(error, 'Erro ao buscar jazigos');
    }
  }

  @Get('/without-owner')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obter todos os jazigos sem propritários' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de jazigos obtida com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro interno no servidor',
  })
  async findAllWithoutOwner() {
    try {
      // O serviço atual não implementa paginação, mas adicionei a estrutura
      const result = await this.valtsService.findAllWithoutOwners();
      return {
        status: HttpStatus.OK,
        message: 'Jazigos obtidos com sucesso',
        data: result,
        metadata: {
          total: result.length,
        },
      };
    } catch (error) {
      this.handleError(error, 'Erro ao buscar jazigos');
    }
  }

  @Get('/graveyard/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obter todos os jazigos de um cemitério' })
  @ApiParam({ name: 'id', type: String, description: 'ID do cemitério' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de jazigos do cemitério obtida com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cemitério não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro interno no servidor',
  })
  async findAllByGraveyard(@Param('id') id: string) {
    try {
      if (!id) {
        throw new BadRequestException('ID do cemitério é obrigatório');
      }

      const result = await this.valtsService.findAllByGraveyard(id);
      return {
        status: HttpStatus.OK,
        message: `Jazigos do cemitério ${id} obtidos com sucesso`,
        data: result,
        metadata: {
          total: result.length,
          cemitérioId: id,
        },
      };
    } catch (error) {
      this.handleError(error, `Erro ao buscar jazigos do cemitério ${id}`);
    }
  }

  @Get('/partner/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obter todos os jazigos de um parceiro' })
  @ApiParam({ name: 'id', type: String, description: 'ID do parceiro' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de jazigos do parceiro obtida com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Parceiro não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro interno no servidor',
  })
  async findAllByPartner(@Param('id') id: string) {
    try {
      if (!id) {
        throw new BadRequestException('ID do parceiro é obrigatório');
      }

      const result = await this.valtsService.findAllByPartner(id);
      return {
        status: HttpStatus.OK,
        message: `Jazigos do parceiro ${id} obtidos com sucesso`,
        data: result,
        metadata: {
          total: result.length,
          parceiroId: id,
        },
      };
    } catch (error) {
      this.handleError(error, `Erro ao buscar jazigos do parceiro ${id}`);
    }
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obter um jazigo pelo ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do jazigo' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Jazigo obtido com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Jazigo não encontrado',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'ID inválido' })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro interno no servidor',
  })
  async findOne(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: string,
  ) {
    try {
      const result = await this.valtsService.findOne(+id);
      return {
        status: HttpStatus.OK,
        message: `Jazigo ${id} obtido com sucesso`,
        data: result,
      };
    } catch (error) {
      this.handleError(error, `Erro ao buscar jazigo ${id}`);
    }
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Atualizar um jazigo' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do jazigo' })
  @ApiBody({ type: UpdateValtDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Jazigo atualizado com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Jazigo não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos fornecidos ou ID inválido',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro interno no servidor',
  })
  async update(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: string,
    @Body(new ValidationPipe({ transform: true })) updateValtDto: UpdateValtDto,
  ) {
    try {
      await this.valtsService.update(+id, updateValtDto);
      return {
        status: HttpStatus.OK,
        message: `Jazigo ${id} atualizado com sucesso`,
      };
    } catch (error) {
      this.handleError(error, `Erro ao atualizar jazigo ${id}`);
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remover um jazigo' })
  @ApiParam({ name: 'id', type: Number, description: 'ID do jazigo' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Jazigo removido com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Jazigo não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'ID inválido ou jazigo não pode ser removido',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro interno no servidor',
  })
  async remove(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: string,
  ) {
    try {
      await this.valtsService.remove(+id);
      return {
        status: HttpStatus.OK,
        message: `Jazigo ${id} removido com sucesso`,
      };
    } catch (error) {
      this.handleError(error, `Erro ao remover jazigo ${id}`);
    }
  }

  @Get('/qrcode/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obter um jazigo pelo ID do QR code' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID do jazigo no QR code',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Jazigo obtido com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Jazigo não encontrado',
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'ID inválido' })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro interno no servidor',
  })
  async findOnebyQrCode(
    @Param(
      'id',
      new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    id: string,
  ) {
    try {
      const result = await this.valtsService.findByQrCode(+id);
      return {
        status: HttpStatus.OK,
        message: `Informações do QR code do jazigo ${id} obtidas com sucesso`,
        data: result,
      };
    } catch (error) {
      this.handleError(error, `Erro ao buscar jazigo pelo QR code ${id}`);
    }
  }

  @Get('/square/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obter todos os jazigos de uma quadra' })
  @ApiParam({ name: 'id', type: String, description: 'ID da quadra' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de jazigos da quadra obtida com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Quadra não encontrada',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro interno no servidor',
  })
  async findAllBySquare(@Param('id') id: string) {
    try {
      if (!id) {
        throw new BadRequestException('ID da quadra é obrigatório');
      }

      const result = await this.valtsService.findAllBySquare(id);
      return {
        status: HttpStatus.OK,
        message: `Jazigos da quadra ${id} obtidos com sucesso`,
        data: result,
        metadata: {
          total: result.length,
          quadraId: id,
        },
      };
    } catch (error) {
      this.handleError(error, `Erro ao buscar jazigos da quadra ${id}`);
    }
  }

  @Post('/buy')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Comprar um jazigo' })
  @ApiBody({ type: BuyValtDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Compra de jazigo processada com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos fornecidos',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro interno no servidor',
  })
  async buyValt(
    @Body(new ValidationPipe({ transform: true })) buyValtDto: BuyValtDto,
  ) {
    try {
      console.log('DTO', buyValtDto);
      const result = await this.valtsService.buyValt(buyValtDto);
      return {
        status: HttpStatus.CREATED,
        message: 'Processo de compra do jazigo iniciado com sucesso',
        data: result,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Post('/buy/maintenance')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Comprar manutenção de jazigo' })
  @ApiBody({ type: ValtMaintenanceDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Manutenção de jazigo processada com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos fornecidos',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro interno no servidor',
  })
  async buyMaintenance(
    @Body(new ValidationPipe({ transform: true }))
    maintenanceDto: ValtMaintenanceDto,
  ) {
    try {
      const result = await this.valtsService.valtMaintenance(maintenanceDto);
      return {
        status: HttpStatus.CREATED,
        message: 'Processo de manutenção do jazigo iniciado com sucesso',
        data: result,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
      this.handleError(error, 'Erro ao processar manutenção do jazigo');
    }
  }

  @Post('/image/coordenates')
  async valtImageCoordenates(
    @Body(new ValidationPipe({ transform: true }))
    valtImageCoordenatesDto: ValtImageCoordenatesDto,
  ) {
    try {
      const result = await this.valtsService.valtImageCoordenates(
        valtImageCoordenatesDto,
      );
      return {
        status: HttpStatus.CREATED,
        message: 'Coordenadas da imagem do jazigo salvas com sucesso',
        data: result,
      };
    } catch (error) {
      this.handleError(error, 'Erro ao salvar coordenadas da imagem do jazigo');
    }
  }

  @Get('/image/coordenates')
  async valtWithCoordenades() {
    try {
      const result = await this.valtsService.getValtsWithAreas();
      return {
        status: HttpStatus.OK,
        message: 'Coordenadas da imagem do jazigo salvas com sucesso',
        data: result,
      };
    } catch (error) {
      this.handleError(error, 'Erro ao salvar coordenadas da imagem do jazigo');
    }
  }

  /**
   * Método auxiliar para lidar com erros de forma padronizada
   * @param error Erro capturado
   * @param logMessage Mensagem para registro no log
   * @throws Exceção HTTP adequada ao tipo de erro
   */
  private handleError(error: any, logMessage: string): never {
    this.logger.error(`${logMessage}: ${error.message}`, error.stack);

    if (error instanceof BadRequestException) {
      throw error;
    }

    if (error instanceof NotFoundException) {
      throw error;
    }

    if (error instanceof InternalServerErrorException) {
      throw error;
    }

    throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  }
}
