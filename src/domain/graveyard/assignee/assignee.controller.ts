import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  InternalServerErrorException,
  UploadedFile,
  UseInterceptors,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AssigneeService } from './assignee.service';
import {
  CreateAssigneDto,
  GenerateContractDto,
  LocalPaymentDto,
} from './dto/create-assignee.dto';
import { UpdateAssigneeDto } from './dto/update-assignee.dto';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('assignee')
@Controller('assignee')
export class AssigneeController {
  constructor(private readonly assigneService: AssigneeService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Assignee' })
  @ApiResponse({ status: 201, description: 'Assignee successfully created.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  create(@Body() createAssigneDto: CreateAssigneDto) {
    try {
      return this.assigneService.create(createAssigneDto);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all Assignees with pagination' })
  @ApiResponse({
    status: 200,
    description:
      'List of Assignees successfully retrieved with pagination metadata.',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (starts from 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'pageSize',
    required: false,
    type: Number,
    description: 'Number of items per page',
    example: 10,
  })
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
  ) {
    return this.assigneService.findAll(page, pageSize);
  }

  @Get('/search')
  @ApiOperation({ summary: 'Search Assignees by name prefix' })
  @ApiResponse({
    status: 200,
    description: 'List of Assignees matching the name prefix.',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Name prefix to search (case insensitive)',
    example: 'ga',
  })
  findAllByName(@Query('name') name?: string) {
    try {
      return this.assigneService.findAllAssignesByName(name);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve an Assignee by ID' })
  @ApiParam({ name: 'id', description: 'Assignee ID' })
  @ApiResponse({ status: 200, description: 'Assignee successfully retrieved.' })
  findOne(@Param('id') id: string) {
    try {
      return this.assigneService.findOne(+id);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get('/memorial/link/:id')
  @ApiOperation({ summary: 'Send memorial link for an Assignee' })
  @ApiParam({ name: 'id', description: 'Assignee ID' })
  @ApiResponse({ status: 200, description: 'Memorial link successfully sent.' })
  sendMemorialLink(@Param('id') id: string) {
    return this.assigneService.sendMemorialLink(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an Assignee by ID' })
  @ApiParam({ name: 'id', description: 'Assignee ID' })
  @ApiResponse({ status: 200, description: 'Assignee successfully updated.' })
  update(
    @Param('id') id: string,
    @Body() updateAssigneeDto: UpdateAssigneeDto,
  ) {
    return this.assigneService.update(+id, updateAssigneeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an Assignee by ID' })
  @ApiParam({ name: 'id', description: 'Assignee ID' })
  @ApiResponse({ status: 200, description: 'Assignee successfully deleted.' })
  remove(@Param('id') id: string) {
    return this.assigneService.remove(+id);
  }

  @Post('/contract')
  @ApiOperation({
    summary: 'Generate and retrieve contract PDF for an Assignee',
  })
  @ApiParam({ name: 'id', description: 'Assignee ID' })
  @ApiResponse({
    status: 200,
    description: 'Contract PDF successfully generated.',
  })
  async getContractPdf(
    @Body() generateContractDto: GenerateContractDto,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.assigneService.generateContractPdf(
      generateContractDto,
    );
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=contract.pdf',
      'Content-Length': pdfBuffer?.length,
    });
    res.end(pdfBuffer);
  }

  @Post('process-ret')
  @UseInterceptors(FileInterceptor('file'))
  async processRetFile(@UploadedFile() file: Express.Multer.File) {
    const filePath = `./uploads/${file.originalname}`;
    if (!fs.existsSync('./uploads')) {
      fs.mkdirSync('./uploads', { recursive: true });
    }
    fs.writeFileSync(filePath, file.buffer);

    const fileStream = fs.createReadStream(filePath, { encoding: 'latin1' });
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity,
    });

    for await (const line of rl) {
      const tipoRegistro = line[0];

      if (tipoRegistro === '1') {
        const nossoNumero = line.substring(47, 62).trim();
        const valorPago = parseFloat(line.substring(160, 167).trim()) / 100000;
        const dataPagamento = line.substring(146, 152).trim();

        console.log(
          `Nosso Número: ${nossoNumero}, Valor Pago: ${valorPago}, Data: ${dataPagamento}`,
        );

        await this.assigneService.updatePaymentStatus(
          nossoNumero,
          valorPago,
          dataPagamento,
        );
      }
    }

    return { message: 'Arquivo RET processado com sucesso' };
  }

  @Post('/debits')
  @ApiOperation({ summary: 'Retrieve Assignee debits' })
  @ApiResponse({ status: 200, description: 'Debits successfully retrieved.' })
  async getAssigneeDebits(
    @Query('assigneeId') assigneeId: string,
    @Query('valtId') valtId: string,
  ) {
    try {
      if (!assigneeId || !valtId) {
        throw new Error(
          'Id do jazigo e cessionario são necesários para a busca',
        );
      }
      return await this.assigneService.FindAllAssigneeDebits(
        +assigneeId,
        +valtId,
      );
    } catch (error) {
      console.log(error);
    }
  }

  @Post('/local/payment')
  @UseInterceptors(FileInterceptor('file'))
  async processLocalPayment(
    @Body() localPaymentDto: LocalPaymentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      if (!file) {
        throw new BadRequestException('Arquivo de comprovante é obrigatório');
      }

      localPaymentDto.file = file;

      const result = await this.assigneService.buyValtLocalPayment(
        localPaymentDto,
      );
      return {
        statusCode: 201,
        message: 'Pagamento local processado com sucesso',
        data: result,
      };
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Erro ao processar pagamento local',
      );
    }
  }
}
