import { $Enums, PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
  await prisma.user.createManyAndReturn({
    select: { id: true },
    data: [
      {
        email: 'dev@gmail.com',
        password: await bcrypt.hash('123456', 6),
        role: $Enums.Roles.DEV,
        name: 'Dev',
      },
     
    ],
  });
  // const partnerResponse = await prisma.partner.create({
  //   select: { id: true },
  //   data: {
  //     name: 'John Partner',
  //     permissions: [
  //       $Enums.PartnerPermissions.CREATE,
  //       $Enums.PartnerPermissions.READ,
  //       $Enums.PartnerPermissions.UPDATE,
  //       $Enums.PartnerPermissions.DELETE,
  //     ],
  //   },
  // });
  // await prisma.partnerUser.create({
  //   data: {
  //     userId: userResponse[3].id,
  //     partnerId: partnerResponse.id,
  //   },
  // });

  // const graveyard = await prisma.graveyards.create({
  //   select: { id: true },
  //   data: {
  //     nameGraveyards: 'Cemiterio Teste',
  //     nameEnterprise: 'Empresa Teste',
  //     cep: '01502001',
  //     city: 'São Paulo',
  //     street: 'Rua dos bobos',
  //     state: 'SP',
  //     streetNumber: '0',
  //     partnerId: partnerResponse.id,
  //   },
  // });

  // const square = await prisma.squares.create({
  //   select: { id: true },
  //   data: {
  //     identificator: 'bf68465c-e3c6-415f-b976-fe22030aa3d6',
  //     graveyardsId: graveyard.id,
  //   },
  // });
  // const valtType = await prisma.valtType.create({
  //   select: { id: true },
  //   data: {
  //     valtType: 'Type Teste',
  //   },
  // });
  // const valt = await prisma.valts.create({
  //   select: { id: true },
  //   data: {
  //     valtTypeId: valtType.id,
  //     drawersQuantity: 4,
  //     identificator: 'a4dc4d6d-c1b6-4050-bc00-e0f10947439e',
  //   },
  // });
  // const assignee = await prisma.assignee.create({
  //   select: { id: true },
  //   data: {
  //     name: 'Familiar teste',
  //     squaresId: square.id,
  //     valtsId: valt.id,
  //   },
  // });

  // await prisma.deceased.create({
  //   select: { id: true },
  //   data: {
  //     registration: '2931cc5d-2256-4493-876a-e53a44a4c0d8',
  //     fullName: 'Morto Teste',
  //     identificationDoc: '123123123123',
  //     assigneeId: assignee.id,
  //   },
  // });

  // const usedEmails = new Set();
  // const usedCnpjs = new Set();

  // await prisma.user.create({
  //   data: {
  //     name: faker.person.fullName(),
  //     email: 'dev@gmail.com',
  //     password: await bcrypt.hash('123456', 6),
  //     role: 'DEV',
  //   },
  // });

  // // Create 10 fake partners
  // for (let i = 0; i < 10; i++) {
  //   let email;
  //   do {
  //     email = faker.internet.email();
  //   } while (usedEmails.has(email));
  //   usedEmails.add(email);

  //   const user = await prisma.user.create({
  //     data: {
  //       name: faker.name.fullName(),
  //       email: email,
  //       password: await bcrypt.hash(faker.internet.password(), 6),
  //       role: 'PARTNER',
  //     },
  //   });

  //   const partnerUser = await prisma.partner.create({
  //     data: {
  //       name: user.name,
  //       permissions: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
  //     },
  //   });

  //   await prisma.partnerUser.create({
  //     data: { userId: user.id, partnerId: partnerUser.id },
  //   });

  //   let cnpj;
  //   do {
  //     cnpj = faker.string.uuid(); // Use a unique identifier for CNPJ
  //   } while (usedCnpjs.has(cnpj));
  //   usedCnpjs.add(cnpj);

  //   const graveyards = await prisma.graveyards.create({
  //     data: {
  //       cep: faker.location.zipCode(),
  //       city: faker.location.city(),
  //       nameEnterprise: faker.company.name(),
  //       nameGraveyards: faker.company.name(),
  //       state: faker.location.state(),
  //       street: faker.location.street(),
  //       streetNumber: faker.number.int().toString(),
  //       cnpj: cnpj,
  //       Partner: {
  //         connect: { id: partnerUser.id },
  //       },
  //     },
  //   });

  //   const squares = await prisma.squares.create({
  //     data: {
  //       identificator: faker.number.int().toString(),
  //       Graveyards: {
  //         connect: {
  //           id: graveyards.id,
  //         },
  //       },
  //     },
  //   });

  //   const valts = await prisma.valts.create({
  //     data: {
  //       identificator: faker.number.int().toString(),
  //       drawersQuantity: 1,
  //       Squares: {
  //         connect: { id: squares.id },
  //       },
  //     },
  //   });

  //   const drawers = await prisma.drawers.create({
  //     data: {
  //       identificator: faker.number.int().toString(),
  //       Valts: {
  //         connect: { id: valts.id },
  //       },
  //     },
  //   });

  //   const assigneeData = {
  //     birthdate: faker.date.birthdate(),
  //     name: faker.name.fullName(),
  //     cpf: faker.string.numeric(11),
  //     rg: faker.string.numeric(9),
  //     phone: faker.phone.number(),
  //     email: faker.internet.email(),

  //     maritalStatus: faker.helpers.arrayElement([
  //       'SOLTEIRO',
  //       'CASADO',
  //       'DIVORCIADO',
  //       'VIUVO',
  //       'OUTROS',
  //     ]) as any,
  //     nationality: faker.address.country(),
  //     status: faker.datatype.boolean(),
  //     Squares: { connect: { id: squares.id } },
  //     Valts: { connect: { id: valts.id } },
  //     Drawers: { connect: { id: drawers.id } },
  //     saleValue: faker.number.int({ min: 1000, max: 10000 }),
  //     rentValue: faker.number.int({ min: 500, max: 5000 }),
  //     address: {
  //       create: {
  //         address_name: faker.address.streetAddress(),
  //         city: faker.address.city(),
  //         state: faker.address.state(),
  //         zipcode: faker.address.zipCode(),
  //         neighborhood: faker.address.secondaryAddress(),
  //       },
  //     },
  //     relationship: {
  //       create: {
  //         nameRelationship: faker.name.fullName(),
  //         phoneRelationship: faker.phone.number(),
  //         relationship: faker.helpers.arrayElement([
  //           'spouse',
  //           'child',
  //           'parent',
  //           'sibling',
  //         ]),
  //       },
  //     },
  //     business: {
  //       create: {
  //         enterprise: faker.company.name(),
  //         businessPosition: faker.name.jobTitle(),
  //         businessPhone: faker.phone.number(),
  //         businessEmail: faker.internet.email(),
  //         businessAddress: faker.address.streetAddress(),
  //         businessCity: faker.address.city(),
  //         businessState: faker.address.state(),
  //         businessZipcode: faker.address.zipCode(),
  //       },
  //     },
  //     payment: {
  //       create: {
  //         transactionType: faker.helpers.arrayElement(['SALE', 'RENT']),
  //         payType: faker.helpers.arrayElement([
  //           'CREDIT_CARD',
  //           'DEBIT_CARD',
  //           'CASH',
  //         ]),
  //         payInstallments: faker.number.int({ min: 1, max: 12 }),
  //         paymentDate: faker.date.future(),
  //         discount: faker.number.int({ min: 0, max: 100 }),
  //         dueDate: faker.date.future().toISOString(),
  //         dueDay: faker.number.int({ min: 1, max: 31 }).toString(),
  //         maintenanceValue: faker.number.int({ min: 100, max: 1000 }),
  //         maintenancePeriod: faker.helpers.arrayElement(['MONTHLY', 'YEARLY']),
  //         typeContract: faker.helpers.arrayElement(['RENT', 'SALE']),
  //         url: faker.internet.url(),
  //         assinado: faker.datatype.boolean(),
  //       },
  //     },
  //   };

  //   await prisma.assignee.create({
  //     data: assigneeData,
  //   });
  // }

  // console.log('MIGRAÇÃO CONCLUIDA');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
