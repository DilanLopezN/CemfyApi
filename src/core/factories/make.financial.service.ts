import { ManagementService } from 'src/domain/management/management.service';
import { PrismaService } from '../prisma/prisma.service';

export async function makeManagementService() {
  const prismaService = new PrismaService();
  const managementService = new ManagementService(prismaService);
  return managementService;
}
