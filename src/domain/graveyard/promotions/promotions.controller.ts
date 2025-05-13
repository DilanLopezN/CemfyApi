import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  InternalServerErrorException,
  NotFoundException,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import {
  AssignPromotion,
  CreatePromotionDto,
} from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('promotions')
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new promotion' })
  @ApiResponse({ status: 201, description: 'Promotion successfully created.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async create(@Body() createPromotionDto: CreatePromotionDto) {
    try {
      return await this.promotionsService.create(createPromotionDto);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Erro ao criar promoção. Por favor, tente novamente mais tarde.',
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all promotions' })
  @ApiResponse({ status: 200, description: 'List of promotions retrieved.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findAll() {
    try {
      return await this.promotionsService.findAll();
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Erro ao buscar promoções. Por favor, tente novamente mais tarde.',
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a promotion by ID' })
  @ApiParam({ name: 'id', description: 'Promotion ID' })
  @ApiResponse({
    status: 200,
    description: 'Promotion successfully retrieved.',
  })
  @ApiResponse({ status: 404, description: 'Promotion not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findOne(@Param('id') id: string) {
    try {
      return await this.promotionsService.findOne(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(error);
      throw new InternalServerErrorException(
        'Erro ao buscar promoção. Por favor, tente novamente mais tarde.',
      );
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a promotion by ID' })
  @ApiParam({ name: 'id', description: 'Promotion ID' })
  @ApiResponse({ status: 200, description: 'Promotion successfully updated.' })
  @ApiResponse({ status: 404, description: 'Promotion not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async update(
    @Param('id') id: string,
    @Body() updatePromotionDto: UpdatePromotionDto,
  ) {
    try {
      return await this.promotionsService.update(id, updatePromotionDto);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(error);
      throw new InternalServerErrorException(
        'Erro ao atualizar promoção. Por favor, tente novamente mais tarde.',
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a promotion by ID' })
  @ApiParam({ name: 'id', description: 'Promotion ID' })
  @ApiResponse({ status: 200, description: 'Promotion successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Promotion not found.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async remove(@Param('id') id: string) {
    try {
      return await this.promotionsService.remove(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error(error);
      throw new InternalServerErrorException(
        'Erro ao deletar promoção. Por favor, tente novamente mais tarde.',
      );
    }
  }

  @Post('/assign')
  @ApiOperation({
    summary: 'Assign a promotion to services, graveyards, or vault types',
  })
  @ApiResponse({
    status: 200,
    description: 'Promotion successfully assigned.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or promotion assignment failed.',
  })
  @ApiBody({
    description: 'Data for assigning a promotion',
    schema: {
      type: 'object',
      properties: {
        promotionId: { type: 'string', description: 'ID of the promotion' },
        servicesIds: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of service IDs to assign the promotion to',
        },
        graveyards: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of graveyard IDs to assign the promotion to',
        },
        vaultTypes: {
          type: 'array',
          items: { type: 'number' },
          description: 'Array of vault type IDs to assign the promotion to',
        },
      },
    },
  })
  async assignPromotion(
    @Body()
    assignPromotionDto: AssignPromotion,
  ) {
    try {
      return await this.promotionsService.assignPromotion(assignPromotionDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
