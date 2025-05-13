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
} from '@nestjs/common';
import { ExhumationService } from './exhumation.service';
import { CreateExhumationDto } from './dto/create-exhumation.dto';
import { UpdateExhumationDto } from './dto/update-exhumation.dto';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('exhumation')
@Controller('exhumation')
export class ExhumationController {
  constructor(private readonly exhumationService: ExhumationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new exhumation record' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiBody({ type: CreateExhumationDto })
  async create(@Body() createExhumationDto: CreateExhumationDto) {
    try {
      return await this.exhumationService.create(createExhumationDto);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all exhumation records' })
  @ApiResponse({ status: 200, description: 'List of all exhumation records.' })
  @ApiResponse({ status: 500, description: 'Internal Server Error.' })
  async findAll() {
    try {
      return await this.exhumationService.findAll();
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific exhumation record by ID' })
  @ApiResponse({
    status: 200,
    description: 'The exhumation record with the specified ID.',
  })
  @ApiResponse({ status: 404, description: 'Record not found.' })
  @ApiParam({ name: 'id', type: 'number' })
  async findOne(@Param('id') id: string) {
    try {
      const record = await this.exhumationService.findOne(+id);
      if (!record) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'Exhumation record not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return record;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a specific exhumation record by ID' })
  @ApiResponse({
    status: 200,
    description: 'The exhumation record has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Record not found.' })
  @ApiParam({ name: 'id', type: 'number' })
  @ApiBody({ type: UpdateExhumationDto })
  async update(
    @Param('id') id: string,
    @Body() updateExhumationDto: UpdateExhumationDto,
  ) {
    try {
      const updatedRecord = await this.exhumationService.update(
        +id,
        updateExhumationDto,
      );
      if (!updatedRecord) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'Exhumation record not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return updatedRecord;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a specific exhumation record by ID' })
  @ApiResponse({
    status: 200,
    description: 'The exhumation record has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Record not found.' })
  @ApiParam({ name: 'id', type: 'number' })
  async remove(@Param('id') id: string) {
    try {
      const deletedRecord = await this.exhumationService.remove(+id);
      if (!deletedRecord) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: 'Exhumation record not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return deletedRecord;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
