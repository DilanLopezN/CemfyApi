import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';

@Injectable()
export class AssigneeHooksService {
  constructor(private readonly prismaService: PrismaService) {}

  async updateDocumentStatus(
    uuidDocument: string,
    status: string,
  ): Promise<void> {
    try {
      // Verifica se o documento existe no modelo Documents
      const documentExists = await this.prismaService.documents.findUnique({
        where: { documentUuid: uuidDocument },
      });

      if (!documentExists) {
        console.warn(`Documento com UUID ${uuidDocument} não encontrado.`);
        return;
      }

      // Atualiza o status do documento no modelo Documents
      await this.prismaService.documents.update({
        where: { documentUuid: uuidDocument },
        data: { documentStatus: status },
      });

      console.log(
        `Status do documento ${uuidDocument} atualizado para ${status}`,
      );

      // Atualiza o status do Assignee para true
      if (status === 'ASSINADO') {
        // Exemplo: atualiza apenas se o documento for assinado
        await this.prismaService.assignee.update({
          where: { id: documentExists.assigneeId },
          data: { status: true, payment: { update: { assinado: true } } },
        });

        await this.prismaService.valtOwners.update({
          where: { assigneeId: documentExists.assigneeId },
          data: {
            isActive: true,
          },
        });

        console.log(
          `Status do Assignee com ID ${documentExists.assigneeId} atualizado para true`,
        );
      }
    } catch (error) {
      console.error(
        `Erro ao atualizar status do documento ${uuidDocument}:`,
        error,
      );
      throw new Error(
        `Não foi possível atualizar o status do documento: ${error.message}`,
      );
    }
  }
}
