import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { MemorialService } from './memorial.service';
import { CreateHomageDto, CreateMemorialDto } from './dto/create-memorial.dto';
import { UpdateMemorialDto } from './dto/update-memorial.dto';

@ApiTags('Memorial')
@Controller('memorial')
export class MemorialController {
  constructor(private readonly memorialService: MemorialService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new memorial' })
  @ApiResponse({ status: 201, description: 'Memorial successfully created.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  createMemorial(@Body() createMemorialDto: CreateMemorialDto) {
    return this.memorialService.create_memorial(createMemorialDto);
  }

  @Post('/homage')
  @ApiOperation({ summary: 'Create a new homage' })
  @ApiResponse({ status: 201, description: 'Homage successfully created.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  createHomenage(@Body() createMemorialDto: CreateHomageDto) {
    return this.memorialService.create_homenage(createMemorialDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all memorials' })
  @ApiResponse({
    status: 200,
    description: 'List of memorials successfully retrieved.',
  })
  findAll() {
    return this.memorialService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a memorial by ID' })
  @ApiParam({ name: 'id', description: 'Memorial ID' })
  @ApiResponse({ status: 200, description: 'Memorial successfully retrieved.' })
  findOne(@Param('id') id: string) {
    return this.memorialService.findByDeceased(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a memorial by ID' })
  @ApiParam({ name: 'id', description: 'Memorial ID' })
  @ApiResponse({ status: 200, description: 'Memorial successfully updated.' })
  update(
    @Param('id') id: string,
    @Body() updateMemorialDto: UpdateMemorialDto,
  ) {
    return this.memorialService.update(+id, updateMemorialDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a memorial by ID' })
  @ApiParam({ name: 'id', description: 'Memorial ID' })
  @ApiResponse({ status: 200, description: 'Memorial successfully deleted.' })
  remove(@Param('id') id: number) {
    return this.memorialService.remove(id);
  }
}
