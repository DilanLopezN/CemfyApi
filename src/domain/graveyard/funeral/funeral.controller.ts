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
import { FuneralService } from './funeral.service';
import { CreateFuneralDto } from './dto/create-funeral.dto';
import { UpdateFuneralDto } from './dto/update-funeral.dto';
import { CreateRoomDto } from './dto/create-room.dto';

@ApiTags('Funeral')
@Controller('funeral')
export class FuneralController {
  constructor(private readonly funeralService: FuneralService) {}

  @Post('/rooms')
  @ApiOperation({ summary: 'Create a new room' })
  @ApiResponse({ status: 201, description: 'Room successfully created.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  create_room(@Body() createRoomDto: CreateRoomDto) {
    return this.funeralService.create_room(createRoomDto);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new funeral' })
  @ApiResponse({ status: 201, description: 'Funeral successfully created.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  create_funeral(@Body() createFuneralDto: CreateFuneralDto) {
    return this.funeralService.create_funeral(createFuneralDto);
  }

  @Get('/rooms')
  @ApiOperation({ summary: 'Retrieve all rooms' })
  @ApiResponse({
    status: 200,
    description: 'List of rooms successfully retrieved.',
  })
  findAllRooms() {
    return this.funeralService.findAllRooms();
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all funerals' })
  @ApiResponse({
    status: 200,
    description: 'List of funerals successfully retrieved.',
  })
  findAllFunerals() {
    return this.funeralService.findAllFunerals();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a funeral by ID' })
  @ApiParam({ name: 'id', description: 'Funeral ID' })
  @ApiResponse({ status: 200, description: 'Funeral successfully retrieved.' })
  findOne(@Param('id') id: string) {
    return this.funeralService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a funeral by ID' })
  @ApiParam({ name: 'id', description: 'Funeral ID' })
  @ApiResponse({ status: 200, description: 'Funeral successfully updated.' })
  update(@Param('id') id: string, @Body() updateFuneralDto: UpdateFuneralDto) {
    return this.funeralService.update(+id, updateFuneralDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a funeral by ID' })
  @ApiParam({ name: 'id', description: 'Funeral ID' })
  @ApiResponse({ status: 200, description: 'Funeral successfully deleted.' })
  remove(@Param('id') id: string) {
    return this.funeralService.remove(+id);
  }

  @Patch('/finish/:id')
  @ApiOperation({ summary: 'Update a funeral by ID' })
  @ApiParam({ name: 'id', description: 'Funeral ID' })
  @ApiResponse({ status: 200, description: 'Funeral successfully updated.' })
  endFuneral(
    @Param('id') id: string,
    @Body() updateFuneralDto: UpdateFuneralDto,
  ) {
    return this.funeralService.finishFuneral(+id);
  }
}
