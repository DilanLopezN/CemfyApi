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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreatePartnerDto } from './dto/partner-dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
  })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.usersService.create(createUserDto);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Post('partner')
  @ApiOperation({ summary: 'Create a new partner' })
  @ApiResponse({
    status: 201,
    description: 'The partner has been successfully created.',
  })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async create_partner(@Body() createPartnerDto: CreatePartnerDto) {
    try {
      return await this.usersService.createPartnerUser(createPartnerDto);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findAll() {
    try {
      return await this.usersService.findAll();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiResponse({ status: 200, description: 'Return the user.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findOne(@Param('id') id: string) {
    try {
      return await this.usersService.findOne(+id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get('/partners/:q')
  @ApiOperation({ summary: 'Get partner users' })
  @ApiResponse({ status: 200, description: 'Return partner users.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findPartner() {
    try {
      return await this.usersService.findPartnerUser();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get('/partner/user/:id')
  @ApiOperation({ summary: 'Get a partner by user ID' })
  @ApiResponse({ status: 200, description: 'Return the partner.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async findPartnerByUserId(@Param('id') id: string) {
    try {
      return await this.usersService.findPartnerByUserId(+id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully updated.',
  })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      return await this.usersService.update(+id, updateUserDto);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user by ID' })
  @ApiResponse({
    status: 200,
    description: 'The user has been successfully deleted.',
  })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async remove(@Param('id') id: string) {
    try {
      return await this.usersService.remove(+id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
