import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  InternalServerErrorException,
  ParseUUIDPipe,
  UploadedFiles,
  HttpStatus,
  HttpException,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { DeceasedsService } from './deceaseds.service';
import {
  AttachDocumentsDto,
  CreateDeceasedDto,
} from './dto/create-deceased.dto';
import { UpdateDeceasedDto } from './dto/update-deceased.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@ApiTags('deceaseds')
@Controller('deceaseds')
export class DeceasedsController {
  constructor(private readonly deceasedsService: DeceasedsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Deceased record' })
  @ApiResponse({
    status: 201,
    description: 'Deceased record successfully created.',
  })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async create(@Body() createDeceasedDto: CreateDeceasedDto) {
    try {
      return await this.deceasedsService.create(createDeceasedDto);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all Deceased records' })
  @ApiResponse({
    status: 200,
    description: 'List of Deceased records successfully retrieved.',
  })
  async findAll() {
    try {
      return await this.deceasedsService.findAll();
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a Deceased record by ID' })
  @ApiParam({ name: 'id', description: 'Deceased record ID' })
  @ApiResponse({
    status: 200,
    description: 'Deceased record successfully retrieved.',
  })
  async findOne(@Param('id') id: string) {
    try {
      return await this.deceasedsService.findOne(id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a Deceased record by ID' })
  @ApiParam({ name: 'id', description: 'Deceased record ID' })
  @ApiResponse({
    status: 200,
    description: 'Deceased record successfully updated.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDeceasedDto: UpdateDeceasedDto,
  ) {
    try {
      return await this.deceasedsService.update(id, updateDeceasedDto);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a Deceased record by ID' })
  @ApiParam({ name: 'id', description: 'Deceased record ID' })
  @ApiResponse({
    status: 200,
    description: 'Deceased record successfully deleted.',
  })
  async remove(@Param('id') id: string) {
    try {
      return await this.deceasedsService.remove(id);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  @Post(':deceasedId/documents')
  // Use o interceptor FilesInterceptor e especifique o NOME DO CAMPO dos arquivos
  // Usamos 'files' aqui porque o frontend agora envia os arquivos sob essa chave
  @UseInterceptors(FilesInterceptor('files')) // <--- ADICIONE/CORRIJA ISTO!
  async uploadAttachments(
    @Param('deceasedId', new ParseUUIDPipe()) deceasedId: string,
    // @UploadedFiles() agora receberá os arquivos do campo 'files'
    @UploadedFiles() files: Express.Multer.File[],
    // @Body() deverá receber os outros campos, incluindo 'names' que o FormData envia como um array
    @Body() attachDocumentsDto: AttachDocumentsDto,
  ) {
    try {
      // Agora, 'files' deve conter o array de arquivos
      // e 'attachDocumentsDto.names' deve conter o array de nomes (ou uma string, se for só um)

      if (!files || files.length === 0) {
        // O Multer FilesInterceptor geralmente já lança erro se não vier arquivo,
        // mas essa verificação extra pode ser útil.
        throw new Error('No files provided for upload');
      }

      // --- CORREÇÃO AQUI ---
      // Verifica se attachDocumentsDto.names é uma string e o converte para array se for o caso
      if (typeof attachDocumentsDto.names === 'string') {
        attachDocumentsDto.names = [attachDocumentsDto.names];
      }
      // --- FIM DA CORREÇÃO ---

      // Opcional: Verifique se o número de nomes corresponde ao número de arquivos
      if (
        !attachDocumentsDto.names ||
        attachDocumentsDto.names.length !== files.length
      ) {
        // Decida a regra: lançar erro, usar nome original, etc.
        throw new HttpException(
          'Number of names does not match the number of files',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Mapeia os documentos usando os arquivos recebidos e os nomes do DTO
      const documents = files.map((file, index) => ({
        name: attachDocumentsDto.names[index] || file.originalname, // Use o nome do DTO, fallback para original
        file,
      }));

      console.log('ID', deceasedId);
      console.log('Received Files Count:', files.length); // Log para verificar quantos arquivos chegaram
      console.log('Received Names:', attachDocumentsDto.names); // Agora sempre será um array aqui
      console.log(
        'Received Names Length (after fix):',
        attachDocumentsDto.names.length,
      ); // Agora será correto
      console.log('Processed Documents:', documents); // Log para ver a estrutura final

      // Descomente e use o service
      const result = await this.deceasedsService.attachDeceasedsDocuments(
        documents,
        deceasedId,
      );

      console.log('RESULTTT', result);

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Documents attached successfully',
        data: result,
      };
    } catch (error) {
      console.error('Error uploading documents:', error); // Log mais detalhado do erro no servidor

      if (error instanceof HttpException) {
        throw error; // Re-lança exceções HTTP já criadas
      } else if (error.message === 'No files provided for upload') {
        throw new HttpException(
          'No files provided for upload',
          HttpStatus.BAD_REQUEST,
        );
      } else if (error.message === 'Deceased not found') {
        // Seu service pode lançar isso
        throw new HttpException('Deceased not found', HttpStatus.NOT_FOUND);
      } else {
        // Captura outros erros inesperados
        throw new HttpException(
          error.message || 'Failed to attach documents',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
