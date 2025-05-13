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
import { DrawersService } from './drawers.service';
import { CreateDrawerDto } from './dto/create-drawer.dto';
import { UpdateDrawerDto } from './dto/update-drawer.dto';

@ApiTags('drawers')
@Controller('drawers')
export class DrawersController {
  constructor(private readonly drawersService: DrawersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Drawer' })
  @ApiResponse({ status: 201, description: 'Drawer successfully created.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async create(@Body() createDrawerDto: CreateDrawerDto) {
    try {
      return await this.drawersService.create(createDrawerDto);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all Drawers' })
  @ApiResponse({
    status: 200,
    description: 'List of Drawers successfully retrieved.',
  })
  async findAll() {
    try {
      return await this.drawersService.findAll();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get('/valt/:id')
  @ApiOperation({ summary: 'Retrieve all Drawers by Valt ID' })
  @ApiParam({ name: 'id', description: 'Valt ID' })
  @ApiResponse({
    status: 200,
    description: 'List of Drawers successfully retrieved.',
  })
  async findAllByValt(@Param('id') id: string) {
    try {
      return await this.drawersService.findAllByValt(+id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get('/partner/:id')
  @ApiOperation({ summary: 'Retrieve all Drawers by Partner ID' })
  @ApiParam({ name: 'id', description: 'Partner ID' })
  @ApiResponse({
    status: 200,
    description: 'List of Drawers successfully retrieved.',
  })
  async findAllByPartner(@Param('id') id: string) {
    try {
      return await this.drawersService.findAllByPartner(id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a Drawer by ID' })
  @ApiParam({ name: 'id', description: 'Drawer ID' })
  @ApiResponse({ status: 200, description: 'Drawer successfully retrieved.' })
  async findOne(@Param('id') id: string) {
    try {
      return await this.drawersService.findOne(id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a Drawer by ID' })
  @ApiParam({ name: 'id', description: 'Drawer ID' })
  @ApiResponse({ status: 200, description: 'Drawer successfully updated.' })
  async update(
    @Param('id') id: string,
    @Body() updateDrawerDto: UpdateDrawerDto,
  ) {
    try {
      return await this.drawersService.update(id, updateDrawerDto);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a Drawer by ID' })
  @ApiParam({ name: 'id', description: 'Drawer ID' })
  @ApiResponse({ status: 200, description: 'Drawer successfully deleted.' })
  async remove(@Param('id') id: string) {
    try {
      return await this.drawersService.remove(id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
