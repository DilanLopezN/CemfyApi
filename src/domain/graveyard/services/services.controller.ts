import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  ParseUUIDPipe,
  Logger,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ServicesService } from '../services/services.service';
import { CreateServiceDto } from '../services/dto/create-service.dto';
import { UpdateServiceDto } from '../services/dto/update-service.dto';

@ApiTags('graveyard-services')
@Controller('services')
export class ServicesController {
  private readonly logger = new Logger(ServicesController.name);

  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new graveyard service' })
  @ApiBody({ type: CreateServiceDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The service has been successfully created.',
    type: CreateServiceDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid data provided or service already exists.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Graveyard not found.',
  })
  async create(@Body() createServiceDto: CreateServiceDto) {
    try {
      return await this.servicesService.create(createServiceDto);
    } catch (error) {
      return this.handleError(error, 'Error creating graveyard service');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all graveyard services' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of all graveyard services.',
    type: [CreateServiceDto],
  })
  async findAll() {
    try {
      return await this.servicesService.findAll();
    } catch (error) {
      return this.handleError(error, 'Error retrieving all graveyard services');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific graveyard service by ID' })
  @ApiParam({ name: 'id', description: 'Service ID', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The found service record.',
    type: CreateServiceDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service not found.',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    try {
      return await this.servicesService.findOne(id);
    } catch (error) {
      return this.handleError(
        error,
        `Error retrieving graveyard service with ID ${id}`,
      );
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a graveyard service' })
  @ApiParam({ name: 'id', description: 'Service ID', type: String })
  @ApiBody({ type: UpdateServiceDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The service has been successfully updated.',
    type: UpdateServiceDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid data provided.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service not found.',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    try {
      return await this.servicesService.update(id, updateServiceDto);
    } catch (error) {
      return this.handleError(
        error,
        `Error updating graveyard service with ID ${id}`,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a graveyard service' })
  @ApiParam({ name: 'id', description: 'Service ID', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The service has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Service not found.',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    try {
      return await this.servicesService.remove(id);
    } catch (error) {
      return this.handleError(
        error,
        `Error deleting graveyard service with ID ${id}`,
      );
    }
  }

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

    throw new InternalServerErrorException(
      error.message || 'Ocorreu um erro interno no servidor',
    );
  }
}
