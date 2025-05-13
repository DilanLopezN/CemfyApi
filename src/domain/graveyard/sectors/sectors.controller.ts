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
import { SectorsService } from './sectors.service';
import { CreateSectorDto, CreateSectorTagDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

@ApiTags('Sectors') // Tag para a documentação
@Controller('sectors')
export class SectorsController {
  constructor(private readonly sectorsService: SectorsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new sector' })
  @ApiResponse({
    status: 201,
    description: 'The sector has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(@Body() createSectorDto: CreateSectorDto) {
    try {
      return await this.sectorsService.create(createSectorDto);
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('/tag')
  async createSectorTag(@Body() createSectorTagDto: CreateSectorTagDto) {
    try {
      return await this.sectorsService.createSectorTag(createSectorTagDto);
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all sectors' })
  @ApiResponse({ status: 200, description: 'Successfully retrieved sectors.' })
  async findAll() {
    try {
      return await this.sectorsService.findAll();
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.INTERNAL_SERVER_ERROR, error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a sector by id' })
  @ApiParam({ name: 'id', description: 'The id of the sector' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the sector.',
  })
  @ApiResponse({ status: 404, description: 'Sector not found' })
  async findOne(@Param('id') id: string) {
    try {
      const sector = await this.sectorsService.findOne(id);
      if (!sector) {
        throw new HttpException(
          { status: HttpStatus.NOT_FOUND, error: 'Sector not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      return sector;
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.INTERNAL_SERVER_ERROR, error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing sector' })
  @ApiParam({ name: 'id', description: 'The id of the sector' })
  @ApiResponse({
    status: 200,
    description: 'The sector has been successfully updated.',
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async update(
    @Param('id') id: string,
    @Body() updateSectorDto: UpdateSectorDto,
  ) {
    try {
      return await this.sectorsService.update(updateSectorDto);
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, error: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a sector by id' })
  @ApiParam({ name: 'id', description: 'The id of the sector' })
  @ApiResponse({
    status: 200,
    description: 'The sector has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Sector not found' })
  async remove(@Param('id') id: string) {
    try {
      const result = await this.sectorsService.remove(id);
      if (result === false) {
        throw new HttpException(
          { status: HttpStatus.NOT_FOUND, error: 'Sector not found' },
          HttpStatus.NOT_FOUND,
        );
      }
      return result;
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.INTERNAL_SERVER_ERROR, error: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
