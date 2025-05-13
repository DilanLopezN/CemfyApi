import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { ResourceAlreadyExistsError } from 'src/core/errors/ResourceAlreadyExistsError';
import * as bcrypt from 'bcrypt';

import { CreatePartnerDto } from './dto/partner-dto';
import { ResourceNotFoundError } from 'src/core/errors/ResourceNotFoundError';

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async generateHashPassword(password: string) {
    return await bcrypt.hash(password, 6);
  }

  async create(createUserDto: CreateUserDto) {
    const userAlreadyExits = await this.prismaService.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (userAlreadyExits)
      throw new ResourceAlreadyExistsError(
        'Usuário já existe, verifique novamente os dados informados!',
      );

    const user = await this.prismaService.user.create({
      data: {
        ...createUserDto,
        password: await this.generateHashPassword(createUserDto.password),
      },
    });

    return {
      user,
    };
  }

  async findAll() {
    const users = await this.prismaService.user.findMany({
      where: { isActive: true },
    });
    return users;
  }

  async findOne(id: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id, isActive: true },
    });

    if (!user) throw new ResourceNotFoundError('Usuário não encontrado');

    return user;
  }

  async findByEmail(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) throw new ResourceNotFoundError('Usuário não encontrado');

    return user;
  }

  async findPartnerUser() {
    const data = await this.prismaService.partnerUser.findMany({
      include: {
        Partner: true,
        User: true,
      },
    });

    const partners = data.map((partner) => {
      return {
        userId: partner.User.id,
        userPartnerRelationalId: partner.id,
        partnerId: partner.Partner.id,
        name: partner.Partner.name,
        email: partner.User.email,
        role: partner.User.role,
        isActive: partner.User.isActive,
        permissions: partner.Partner.permissions,
      };
    });

    return partners;
  }

  async findPartnerByUserId(userId: number) {
    const data = await this.prismaService.partnerUser.findUnique({
      where: {
        userId,
      },
      include: {
        Partner: true,
        User: true,
      },
    });

    const partner = {
      userId: data.User.id,
      userPartnerRelationalId: data.id,
      partnerId: data.Partner.id,
      name: data.Partner.name,
      email: data.User.email,
      role: data.User.role,
      isActive: data.User.isActive,
      permissions: data.Partner.permissions,
    };

    return partner;
  }
  async update(id: number, updateUserDto: UpdateUserDto) {
    if (updateUserDto.password) {
      await this.prismaService.user.update({
        where: { id },
        data: {
          ...updateUserDto,
          password: await this.generateHashPassword(updateUserDto.password),
        },
      });
    }

    await this.prismaService.user.update({
      where: { id },
      data: {
        ...updateUserDto,
        password: await this.generateHashPassword(updateUserDto.password),
      },
    });
  }

  async remove(id: number) {
    await this.prismaService.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async createPartnerUser(createPartnerDto: CreatePartnerDto) {
    const partnerAlreadyExists = await this.prismaService.user.findUnique({
      where: { email: createPartnerDto.email },
    });

    if (partnerAlreadyExists)
      throw new ResourceAlreadyExistsError(
        'Parceiro ou Usuário com esse e-mail já existem!',
      );

    const partner = await this.prismaService.$transaction(async (prisma) => {
      const user = await prisma.user.create({
        data: {
          email: createPartnerDto.email,
          name: createPartnerDto.name,
          password: await this.generateHashPassword(createPartnerDto.password),
          avatar: createPartnerDto.avatar ?? '',
          role: 'PARTNER',
        },
      });

      const partnerUser = await prisma.partner.create({
        data: {
          name: user.name,
          permissions: createPartnerDto.partnerPermissions.map(
            (permission) => permission,
          ),
        },
      });

      await prisma.partnerUser.create({
        data: { userId: user.id, partnerId: partnerUser.id },
      });

      const partner = {
        userName: user.name,
        partnerName: partnerUser.name,
        email: user.email,
        createdAt: partnerUser.createdAt,
        permissions: partnerUser.permissions,
      };

      return partner;
    });

    if (!partner) throw new Error('Falha ao criar novo parceiro!');

    return {
      partner,
    };
  }
}
