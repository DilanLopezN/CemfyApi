import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  InternalServerErrorException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SquaresService } from './squares.service';
import { CreateSquareDto } from './dto/create-square.dto';
import { UpdateSquareDto } from './dto/update-square.dto';

@ApiTags('squares')
@Controller('squares')
export class SquaresController {
  constructor(private readonly squaresService: SquaresService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Square' })
  @ApiResponse({ status: 201, description: 'Square successfully created.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async create(@Body() createSquareDto: CreateSquareDto) {
    try {
      return await this.squaresService.create(createSquareDto);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get('/graveyard/:id')
  @ApiOperation({ summary: 'Retrieve all Squares by graveyard' })
  @ApiParam({ name: 'id', description: 'Graveyard ID' })
  @ApiResponse({
    status: 200,
    description: 'List of Squares successfully retrieved.',
  })
  async findAllByGraveyard(@Param('id') id: string) {
    try {
      return await this.squaresService.findAllByGraveyard(id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get('/')
  @ApiOperation({ summary: 'Retrieve all Squares' })
  @ApiResponse({
    status: 200,
    description: 'List of Squares successfully retrieved.',
  })
  async findAll() {
    try {
      return await this.squaresService.findAll();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get('/partner/:id')
  @ApiOperation({ summary: 'Retrieve all Squares by partner' })
  @ApiParam({ name: 'id', description: 'Partner ID' })
  @ApiResponse({
    status: 200,
    description: 'List of Squares successfully retrieved.',
  })
  async findAllByPartner(@Param('id') id: string) {
    try {
      return await this.squaresService.findAllByPartner(id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a Square by ID' })
  @ApiParam({ name: 'id', description: 'Square ID' })
  @ApiResponse({ status: 200, description: 'Square successfully retrieved.' })
  async findOne(@Param('id') id: string) {
    try {
      return await this.squaresService.findOne(id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a Square by ID' })
  @ApiParam({ name: 'id', description: 'Square ID' })
  @ApiResponse({ status: 200, description: 'Square successfully updated.' })
  async update(
    @Param('id') id: string,
    @Body() updateSquareDto: UpdateSquareDto,
  ) {
    try {
      return await this.squaresService.update(id, updateSquareDto);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a Square by ID' })
  @ApiParam({ name: 'id', description: 'Square ID' })
  @ApiResponse({ status: 200, description: 'Square successfully deleted.' })
  async remove(@Param('id') id: string) {
    try {
      return await this.squaresService.remove(id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
