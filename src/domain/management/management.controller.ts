import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ManagementService } from './management.service';
import { CreateFinancialManagementDto } from './dto/create-management.dto';
import { UpdateFinancialManagementDto } from './dto/update-management.dto';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Management')
@Controller('management')
export class ManagementController {
  constructor(private readonly managementService: ManagementService) {}

  @Post()
  @ApiOperation({ summary: 'Create financial control record' })
  @ApiResponse({
    status: 201,
    description: 'Financial record successfully created',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiBody({
    type: CreateFinancialManagementDto,
    description: 'Financial management creation details',
  })
  create(@Body() createFinancialManagementDto: CreateFinancialManagementDto) {
    return this.managementService.create_financial_control(
      createFinancialManagementDto,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all financial management records' })
  @ApiResponse({
    status: 200,
    description: 'List of all financial management records',
  })
  findAll() {
    return this.managementService.findAll();
  }

  @Get('active')
  @ApiOperation({
    summary: 'Retrieve the currently active financial management',
  })
  @ApiResponse({
    status: 200,
    description: 'Active financial management record',
  })
  getActiveFinancialManagement() {
    return this.managementService.getActiveFinancialManagement();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific financial management record' })
  @ApiResponse({
    status: 200,
    description: 'Financial management record found',
  })
  @ApiResponse({
    status: 404,
    description: 'Financial management record not found',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID of the financial management record',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.managementService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a financial management record' })
  @ApiResponse({
    status: 200,
    description: 'Financial management record successfully updated',
  })
  @ApiResponse({
    status: 404,
    description: 'Financial management record not found',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID of the financial management record to update',
  })
  @ApiBody({
    type: UpdateFinancialManagementDto,
    description: 'Financial management update details',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFinancialManagementDto: UpdateFinancialManagementDto,
  ) {
    return this.managementService.update(id, updateFinancialManagementDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a financial management record' })
  @ApiResponse({
    status: 200,
    description: 'Financial management record successfully deleted',
  })
  @ApiResponse({
    status: 404,
    description: 'Financial management record not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete active financial management',
  })
  @ApiParam({
    name: 'id',
    type: 'number',
    description: 'ID of the financial management record to delete',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.managementService.remove(id);
  }
}
