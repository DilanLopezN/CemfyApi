import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GraveyardsService } from './graveyards.service';
import { CreateGraveyardDto } from './dto/create-graveyard.dto';
import { UpdateGraveyardDto } from './dto/update-graveyard.dto';

@ApiTags('graveyards')
@Controller('graveyards')
export class GraveyardsController {
  private readonly logger = new Logger(GraveyardsController.name);

  constructor(private readonly graveyardsService: GraveyardsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new graveyard' })
  @ApiResponse({
    status: 201,
    description: 'The graveyard has been successfully created.',
  })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async create(@Body() createGraveyardDto: CreateGraveyardDto) {
    try {
      return await this.graveyardsService.create(createGraveyardDto);
    } catch (error) {
      this.logger.error(
        `Erro ao criar cemitério: ${error.message}`,
        error.stack,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      if (error.name === 'UnauthorizedError') {
        throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);
      }

      throw new HttpException(
        'Erro ao criar cemitério',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all graveyards' })
  @ApiResponse({ status: 200, description: 'Return all graveyards.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findAll() {
    try {
      return await this.graveyardsService.findAll();
    } catch (error) {
      this.logger.error(
        `Erro ao buscar cemitérios: ${error.message}`,
        error.stack,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Erro ao buscar cemitérios',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/squares/:graveyardId')
  @ApiOperation({ summary: 'Get all graveyard squares with valts' })
  @ApiResponse({ status: 200, description: 'Return all graveyard squares.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findAllSquares(@Param('graveyardId') graveyardId: string) {
    try {
      return await this.graveyardsService.getGraveyardSquares(graveyardId);
    } catch (error) {
      this.logger.error(
        `Erro ao buscar cemitérios: ${error.message}`,
        error.stack,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Erro ao buscar cemitérios',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a graveyard by ID' })
  @ApiResponse({ status: 200, description: 'Return the graveyard.' })
  @ApiResponse({ status: 404, description: 'Graveyard not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findOne(@Param('id') id: string) {
    try {
      const graveyard = await this.graveyardsService.findOne(id);

      if (!graveyard) {
        throw new HttpException(
          'Cemitério não encontrado',
          HttpStatus.NOT_FOUND,
        );
      }

      return graveyard;
    } catch (error) {
      this.logger.error(
        `Erro ao buscar cemitério ${id}: ${error.message}`,
        error.stack,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Erro ao buscar cemitério',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('/partner/:tenantId')
  @ApiOperation({ summary: 'Get all graveyards by tenant ID' })
  @ApiResponse({
    status: 200,
    description: 'Return all graveyards by tenant ID.',
  })
  @ApiResponse({ status: 400, description: 'Tenant ID is required.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findAllByTenant(@Param('tenantId') tenantId: string) {
    try {
      if (!tenantId) {
        throw new HttpException(
          'ID do parceiro é obrigatório',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.graveyardsService.findAllByTenant(tenantId);
    } catch (error) {
      this.logger.error(
        `Erro ao buscar cemitérios do parceiro ${tenantId}: ${error.message}`,
        error.stack,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Erro ao buscar cemitérios do parceiro',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a graveyard by ID' })
  @ApiResponse({
    status: 200,
    description: 'The graveyard has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'Graveyard not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async update(
    @Param('id') id: string,
    @Body() updateGraveyardDto: UpdateGraveyardDto,
  ) {
    try {
      console.log('BATI AQUI', updateGraveyardDto);
      const graveyard = await this.graveyardsService.findOne(id);

      if (!graveyard) {
        throw new HttpException(
          'Cemitério não encontrado',
          HttpStatus.NOT_FOUND,
        );
      }

      return await this.graveyardsService.update(id, updateGraveyardDto);
    } catch (error) {
      this.logger.error(
        `Erro ao atualizar cemitério ${id}: ${error.message}`,
        error.stack,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Erro ao atualizar cemitério',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a graveyard by ID' })
  @ApiResponse({
    status: 200,
    description: 'The graveyard has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Graveyard not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async remove(@Param('id') id: string) {
    try {
      if (!id) {
        throw new HttpException('ID inválido', HttpStatus.BAD_REQUEST);
      }

      const graveyard = await this.graveyardsService.findOne(id);

      if (!graveyard) {
        throw new HttpException(
          'Cemitério não encontrado',
          HttpStatus.NOT_FOUND,
        );
      }

      return await this.graveyardsService.remove(id);
    } catch (error) {
      this.logger.error(
        `Erro ao remover cemitério ${id}: ${error.message}`,
        error.stack,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Erro ao remover cemitério',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
