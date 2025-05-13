-- CreateEnum
CREATE TYPE "Relationship" AS ENUM ('parent', 'sibling', 'spouse', 'child', 'other');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SOLTEIRO', 'CASADO', 'DIVORCIADO', 'VIUVO', 'OUTROS');

-- CreateEnum
CREATE TYPE "transactionType" AS ENUM ('SALE', 'RENT');

-- CreateEnum
CREATE TYPE "payType" AS ENUM ('CASH', 'INSTALLMENTS');

-- CreateEnum
CREATE TYPE "Religions" AS ENUM ('CRISTIANISMO', 'ISLAMISMO', 'HINDUISMO', 'BUDISMO', 'JUDAISMO', 'AGNOTICISMO', 'ATEISMO');

-- CreateEnum
CREATE TYPE "DeceasedState" AS ENUM ('EM_PREPARACAO', 'EM_VELORIO', 'EXUMADO', 'CREMADO', 'SEPULTADO', 'AGUARDANDO_SEPULTAMENTO', 'AGUARDANDO_CREMACAO', 'AGUARDANDO_EXUMACAO');

-- CreateEnum
CREATE TYPE "GravesType" AS ENUM ('JAZIGO', 'TUMBA', 'GAVETA', 'NICHO');

-- CreateEnum
CREATE TYPE "DeliquencyStatus" AS ENUM ('ATIVO', 'RENEGOCIADO', 'RESOLVIDO');

-- CreateEnum
CREATE TYPE "DrawerStatus" AS ENUM ('FULL', 'AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "ExhumationReason" AS ENUM ('FAMILY_REQUEST', 'RELOCATION', 'CRIMINAL_INVESTIGATION', 'IDENTIFICATION', 'LEGAL_COMPLIANCE', 'TEMPORARY_BURIAL', 'CONSERVATION', 'CEMETERY_EXPANSION', 'ADMINISTRATIVE_ERROR', 'RELIGIOUS_OR_RITUAL', 'CELEBRATION_OF_LIFE');

-- CreateEnum
CREATE TYPE "FuneralRoomStatus" AS ENUM ('EM_VELORIO', 'EM_PREPARACAO', 'EM_MANUTENCAO', 'LIVRE');

-- CreateEnum
CREATE TYPE "PartnerPermissions" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('AGUARDANDO_PAGAMENTO', 'PAGO_TOTAL', 'CANCELADO', 'PAGAMENTO_ATRASADO', 'PAGAMENTOS_EM_DIA', 'ALTERANDO_PAGAMENTO', 'NEGOCIANDO_PAGAMENTO');

-- CreateEnum
CREATE TYPE "MaintenanceChoice" AS ENUM ('MENSAL', 'SEMESTRAL', 'ANUAL');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('ALUGUEL', 'VENDA', 'SERVICO', 'MANUTENCAO');

-- CreateEnum
CREATE TYPE "MethodType" AS ENUM ('PIX', 'CARNE', 'CREDITO', 'BOLETO', 'DEBITO', 'DINHEIRO', 'TRANSFERENCIA_BANCARIA', 'RECORRENCIA');

-- CreateEnum
CREATE TYPE "TransactionsType" AS ENUM ('SUBSCRIPTION', 'CHARGE', 'CARNET');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('MENSAL', 'TRIMESTRAL', 'SEMESTRAL');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BOLIX', 'CREDIT');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'CANCELED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "SubscriptionType" AS ENUM ('RENT', 'MAINTENANCE', 'SALE');

-- CreateEnum
CREATE TYPE "SquareStatus" AS ENUM ('FULL', 'AVAILABLE', 'UNAVAILABLE', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "Roles" AS ENUM ('DEV', 'ADMIN', 'PARTNER', 'USER');

-- CreateTable
CREATE TABLE "address" (
    "id" SERIAL NOT NULL,
    "address_name" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zipcode" TEXT,
    "neighborhood" TEXT,

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relationship" (
    "id" SERIAL NOT NULL,
    "nameRelationship" TEXT,
    "phoneRelationship" TEXT,
    "relationship" "Relationship",

    CONSTRAINT "relationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business" (
    "id" SERIAL NOT NULL,
    "enterprise" TEXT,
    "businessPosition" TEXT,
    "businessPhone" TEXT,
    "businessEmail" TEXT,
    "businessAddress" TEXT,
    "businessCity" TEXT,
    "businessState" TEXT,
    "businessZipcode" TEXT,

    CONSTRAINT "business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" SERIAL NOT NULL,
    "transactionType" TEXT,
    "payType" TEXT,
    "payInstallments" INTEGER,
    "paymentDate" TIMESTAMP(3),
    "discount" DOUBLE PRECISION,
    "dueDate" TEXT,
    "dueDay" TEXT,
    "status" BOOLEAN,
    "maintenanceValue" DOUBLE PRECISION,
    "maintenancePeriod" TEXT,
    "url" TEXT,
    "typeContract" TEXT,
    "assinado" BOOLEAN,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignee" (
    "id" SERIAL NOT NULL,
    "birthdate" TIMESTAMP(3),
    "name" TEXT,
    "cpf" TEXT,
    "rg" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "maritalStatus" "MaritalStatus",
    "nationality" TEXT,
    "saleValue" DOUBLE PRECISION,
    "rentValue" DOUBLE PRECISION,
    "squaresId" TEXT,
    "valtsId" INTEGER,
    "drawersId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "addressId" INTEGER,
    "businessId" INTEGER,
    "paymentId" INTEGER,
    "relationshipId" INTEGER,
    "status" BOOLEAN,
    "registration" INTEGER,
    "maintenancePeriod" TEXT,
    "maintenanceValue" DOUBLE PRECISION,

    CONSTRAINT "Assignee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documents" (
    "id" SERIAL NOT NULL,
    "documentUuid" TEXT,
    "documentStatus" TEXT,
    "assigneeId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeceasedDocuments" (
    "id" TEXT NOT NULL,
    "documentLink" TEXT,
    "deceasedId" TEXT,

    CONSTRAINT "DeceasedDocuments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deceased" (
    "id" TEXT NOT NULL,
    "registration" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "identificationDoc" TEXT NOT NULL,
    "birthDay" TIMESTAMP(3),
    "gender" TEXT,
    "race" TEXT,
    "maritalStatus" TEXT,
    "nationality" TEXT,
    "birthPlace" TEXT,
    "nameMother" TEXT,
    "nameFather" TEXT,
    "profession" TEXT,
    "religion" TEXT,
    "status" TEXT,
    "buriedIn" TIMESTAMP(3),
    "deceasedIn" TIMESTAMP(3),
    "deathDate" TIMESTAMP(3),
    "dateOfExhumation" TIMESTAMP(3),
    "deathCause" TEXT,
    "crm" TEXT,
    "doctorName" TEXT,
    "cerimonialDescription" TEXT,
    "burialDescription" TEXT,
    "registryOffice" TEXT,
    "book" TEXT,
    "page" TEXT,
    "number" TEXT,
    "declaredBy" TEXT,
    "declaredByAdress" TEXT,
    "declaredByPhone" TEXT,
    "concessionPeriod" INTEGER,
    "typeOfGrave" TEXT,
    "tombstone" BOOLEAN NOT NULL DEFAULT false,
    "flowerbed" BOOLEAN NOT NULL DEFAULT false,
    "identification" TEXT,
    "sealNumber" TEXT,
    "steelSeal" TEXT,
    "outerSeal" TEXT,
    "innerSeal" TEXT,
    "grave" TEXT,
    "sector" TEXT,
    "block" TEXT,
    "graveRegistration" TEXT,
    "addObservation" BOOLEAN NOT NULL DEFAULT false,
    "observations" TEXT,
    "image" TEXT,
    "drawersId" TEXT,
    "drawer" TEXT,
    "assigneeId" INTEGER,
    "cessionary" TEXT,
    "transferDate" TIMESTAMP(3),
    "funeralHome" TEXT,
    "vehiclePlate" TEXT,
    "driverName" TEXT,
    "relationship" TEXT,

    CONSTRAINT "Deceased_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DelinquencyRecords" (
    "id" SERIAL NOT NULL,
    "assigneeId" INTEGER,
    "financialManagementId" INTEGER,
    "overdue_days" INTEGER,
    "due_date" TIMESTAMP(3),
    "last_payment_date" TIMESTAMP(3),
    "outstanding_amount" INTEGER,
    "status" "DeliquencyStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DelinquencyRecords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Drawers" (
    "id" TEXT NOT NULL,
    "valtsId" INTEGER NOT NULL,
    "status" "DrawerStatus" NOT NULL DEFAULT 'AVAILABLE',
    "coordenates" JSONB,
    "dimensions" JSONB,
    "identificator" TEXT NOT NULL,
    "image" TEXT,
    "deceasedSupported" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "saleValue" DOUBLE PRECISION,
    "rentValue" DOUBLE PRECISION,

    CONSTRAINT "Drawers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrawersHistory" (
    "id" SERIAL NOT NULL,
    "buriedDeceasedName" TEXT NOT NULL,
    "buriedIn" TIMESTAMP(3) NOT NULL,
    "buriedId" TEXT NOT NULL,
    "drawerId" TEXT NOT NULL,
    "exhumedIn" TIMESTAMP(3),
    "identificator" TEXT NOT NULL,
    "drawersId" TEXT,

    CONSTRAINT "DrawersHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employees" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "permissions" "PartnerPermissions"[],
    "graveyardManagementId" INTEGER,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exhumation" (
    "id" SERIAL NOT NULL,
    "exhumationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "reason" "ExhumationReason" NOT NULL,
    "deceasedId" TEXT NOT NULL,
    "drawersId" TEXT NOT NULL,
    "performedAt" TIMESTAMP(3),
    "destination" TEXT,

    CONSTRAINT "Exhumation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FuneralRooms" (
    "id" SERIAL NOT NULL,
    "roomIdentificator" TEXT NOT NULL,
    "occupancylimit" INTEGER,
    "status" "FuneralRoomStatus" NOT NULL,

    CONSTRAINT "FuneralRooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Funeral" (
    "id" SERIAL NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "deceasedId" TEXT NOT NULL,
    "funeralRoomsId" INTEGER,

    CONSTRAINT "Funeral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GraveyardManagement" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "GraveyardManagement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GraveyardServices" (
    "id" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "serviceValue" INTEGER,
    "isActive" BOOLEAN DEFAULT true,
    "serviceDuration" TEXT,
    "needMaintenance" BOOLEAN DEFAULT false,
    "graveyardsId" TEXT,
    "promotionId" TEXT,

    CONSTRAINT "GraveyardServices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Graveyards" (
    "id" TEXT NOT NULL,
    "nameGraveyards" TEXT NOT NULL,
    "nameEnterprise" TEXT NOT NULL,
    "cnpj" TEXT,
    "cep" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "streetNumber" TEXT NOT NULL,
    "image" TEXT,
    "neighborhood" TEXT,
    "isActive" BOOLEAN DEFAULT true,
    "partnerId" TEXT NOT NULL,
    "graveyardManagementId" INTEGER,
    "promotionId" TEXT,

    CONSTRAINT "Graveyards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentOld" (
    "id" SERIAL NOT NULL,
    "valuePayment" INTEGER,
    "paymentDate" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "amountPaid" INTEGER,
    "nDoc" TEXT,
    "nInstallment" INTEGER,
    "status" TEXT,
    "assigneeId" INTEGER,

    CONSTRAINT "PaymentOld_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialManagement" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "interest_rate" DECIMAL(65,30),
    "penalty_rate" DECIMAL(65,30),
    "discount_rate" DECIMAL(65,30),
    "min_installments" INTEGER,
    "max_installments" INTEGER,
    "payment_deadline_days" INTEGER,
    "status" BOOLEAN NOT NULL,
    "minRentValue" DOUBLE PRECISION,
    "requireApprovalMinRentValue" BOOLEAN,
    "discountAutonomySellers" BOOLEAN,
    "activePlanId" INTEGER,
    "activePlanDiscount" DECIMAL(65,30),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "allowed_payment_methods" "MethodType"[],

    CONSTRAINT "FinancialManagement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Homage" (
    "id" SERIAL NOT NULL,
    "tributeFrom" TEXT,
    "tributeMessage" TEXT,
    "imageUrl" TEXT,
    "kinship" TEXT,
    "memorialId" INTEGER,

    CONSTRAINT "Homage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Memorial" (
    "id" SERIAL NOT NULL,
    "bornOn" TIMESTAMP(3) NOT NULL,
    "deceasedIin" TIMESTAMP(3) NOT NULL,
    "deceaseImageUrl" TEXT NOT NULL,
    "permissionToken" TEXT,
    "createHomageQuantity" INTEGER,
    "deceasedId" TEXT,

    CONSTRAINT "Memorial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnerUser" (
    "id" SERIAL NOT NULL,
    "partnerId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnerUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "permissions" "PartnerPermissions"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentMethods" (
    "id" SERIAL NOT NULL,
    "methodType" TEXT NOT NULL,
    "allowed" BOOLEAN NOT NULL,
    "financialManagementId" INTEGER,

    CONSTRAINT "PaymentMethods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentsGenerated" (
    "id" SERIAL NOT NULL,
    "type" "MethodType" NOT NULL,
    "assigneeId" INTEGER NOT NULL,
    "chargeId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "pdfLink" TEXT,
    "paymentLink" TEXT,
    "expireDate" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valtOwnersId" INTEGER,

    CONSTRAINT "PaymentsGenerated_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentHistory" (
    "id" SERIAL NOT NULL,
    "method" "MethodType",
    "values" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assigneeId" INTEGER NOT NULL,
    "chargeId" TEXT,
    "serviceType" "ServiceType",
    "financialManagementId" INTEGER,

    CONSTRAINT "PaymentHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentsAttachment" (
    "id" SERIAL NOT NULL,
    "attachUrl" TEXT NOT NULL,
    "localPaymentId" INTEGER,

    CONSTRAINT "PaymentsAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocalPayment" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "assigneeId" INTEGER NOT NULL,
    "method" "MethodType" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "status" "PaymentStatus" NOT NULL,

    CONSTRAINT "LocalPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurrencePlan" (
    "id" TEXT NOT NULL,
    "plan_id" INTEGER NOT NULL,
    "plan_name" TEXT,
    "type" "PlanType" NOT NULL,
    "isActive" BOOLEAN NOT NULL,

    CONSTRAINT "RecurrencePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionCharges" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "chargeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3),
    "value" INTEGER,
    "receveidAt" TEXT,
    "recurrenceSubscriptionsId" TEXT,
    "assigneeId" INTEGER,

    CONSTRAINT "SubscriptionCharges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionUsedIn" (
    "id" SERIAL NOT NULL,
    "valtsId" INTEGER,
    "graveyardServicesId" TEXT,
    "drawersId" TEXT,

    CONSTRAINT "SubscriptionUsedIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecurrenceSubscriptions" (
    "id" TEXT NOT NULL,
    "assigneeId" INTEGER NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "amountCharged" INTEGER NOT NULL,
    "tokenUsed" TEXT,
    "subscriptionGatewayId" TEXT NOT NULL,
    "subscriptionType" "SubscriptionType" NOT NULL,
    "subscriptionUsedInId" INTEGER,
    "status" "SubscriptionStatus" NOT NULL,
    "recurrencePlanId" TEXT,

    CONSTRAINT "RecurrenceSubscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sectors" (
    "id" TEXT NOT NULL,
    "identificator" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Sectors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Squares" (
    "id" TEXT NOT NULL,
    "identificator" TEXT NOT NULL,
    "image" TEXT,
    "coordenates" JSONB,
    "dimensions" JSONB,
    "status" "SquareStatus",
    "employeesId" INTEGER,
    "graveyardsId" TEXT NOT NULL,

    CONSTRAINT "Squares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Roles" DEFAULT 'USER',
    "avatar" TEXT,
    "isActive" BOOLEAN DEFAULT true
);

-- CreateTable
CREATE TABLE "ValtType" (
    "id" SERIAL NOT NULL,
    "valtType" TEXT NOT NULL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "rentValue" INTEGER,
    "saleValue" INTEGER,
    "promotionId" TEXT,

    CONSTRAINT "ValtType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Valts" (
    "id" SERIAL NOT NULL,
    "squaresId" TEXT,
    "drawersQuantity" INTEGER NOT NULL,
    "identificator" TEXT NOT NULL,
    "coordenates" JSONB,
    "dimensions" JSONB,
    "drawersCoordenates" JSONB,
    "imageUrl" TEXT,
    "imageUri" TEXT,
    "image" TEXT,
    "status" "SquareStatus",
    "saleValue" INTEGER,
    "rentValue" INTEGER,
    "valtTypeId" INTEGER,
    "sectorsId" TEXT,

    CONSTRAINT "Valts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ValtOwners" (
    "id" SERIAL NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "chargeId" TEXT NOT NULL,
    "valtsId" INTEGER NOT NULL,
    "transactionType" "TransactionsType" NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "amountInstallments" INTEGER,
    "amountValue" INTEGER NOT NULL,
    "paymentHistoryId" INTEGER NOT NULL,
    "assigneeId" INTEGER NOT NULL,

    CONSTRAINT "ValtOwners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ValtMaintenance" (
    "id" SERIAL NOT NULL,
    "chargeId" TEXT,
    "choiceMaintenance" "MaintenanceChoice" NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "assigneeId" INTEGER NOT NULL,
    "valtsId" INTEGER,

    CONSTRAINT "ValtMaintenance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Assignee_drawersId_key" ON "Assignee"("drawersId");

-- CreateIndex
CREATE UNIQUE INDEX "Assignee_addressId_key" ON "Assignee"("addressId");

-- CreateIndex
CREATE UNIQUE INDEX "Assignee_businessId_key" ON "Assignee"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "Assignee_paymentId_key" ON "Assignee"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "Assignee_relationshipId_key" ON "Assignee"("relationshipId");

-- CreateIndex
CREATE UNIQUE INDEX "Assignee_registration_key" ON "Assignee"("registration");

-- CreateIndex
CREATE UNIQUE INDEX "Documents_documentUuid_key" ON "Documents"("documentUuid");

-- CreateIndex
CREATE INDEX "DeceasedDocuments_documentLink_idx" ON "DeceasedDocuments"("documentLink");

-- CreateIndex
CREATE UNIQUE INDEX "Deceased_registration_key" ON "Deceased"("registration");

-- CreateIndex
CREATE UNIQUE INDEX "Deceased_identificationDoc_key" ON "Deceased"("identificationDoc");

-- CreateIndex
CREATE UNIQUE INDEX "DelinquencyRecords_financialManagementId_key" ON "DelinquencyRecords"("financialManagementId");

-- CreateIndex
CREATE UNIQUE INDEX "Drawers_identificator_key" ON "Drawers"("identificator");

-- CreateIndex
CREATE UNIQUE INDEX "DrawersHistory_identificator_key" ON "DrawersHistory"("identificator");

-- CreateIndex
CREATE UNIQUE INDEX "Funeral_deceasedId_key" ON "Funeral"("deceasedId");

-- CreateIndex
CREATE UNIQUE INDEX "Graveyards_cnpj_key" ON "Graveyards"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "Memorial_deceasedId_key" ON "Memorial"("deceasedId");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerUser_userId_key" ON "PartnerUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethods_methodType_key" ON "PaymentMethods"("methodType");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentsGenerated_chargeId_key" ON "PaymentsGenerated"("chargeId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentHistory_chargeId_key" ON "PaymentHistory"("chargeId");

-- CreateIndex
CREATE UNIQUE INDEX "RecurrencePlan_plan_id_key" ON "RecurrencePlan"("plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionUsedIn_valtsId_key" ON "SubscriptionUsedIn"("valtsId");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionUsedIn_graveyardServicesId_key" ON "SubscriptionUsedIn"("graveyardServicesId");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionUsedIn_drawersId_key" ON "SubscriptionUsedIn"("drawersId");

-- CreateIndex
CREATE UNIQUE INDEX "RecurrenceSubscriptions_subscriptionUsedInId_key" ON "RecurrenceSubscriptions"("subscriptionUsedInId");

-- CreateIndex
CREATE UNIQUE INDEX "Sectors_identificator_key" ON "Sectors"("identificator");

-- CreateIndex
CREATE UNIQUE INDEX "Squares_identificator_key" ON "Squares"("identificator");

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Valts_identificator_key" ON "Valts"("identificator");

-- CreateIndex
CREATE UNIQUE INDEX "ValtOwners_chargeId_key" ON "ValtOwners"("chargeId");

-- CreateIndex
CREATE UNIQUE INDEX "ValtMaintenance_chargeId_key" ON "ValtMaintenance"("chargeId");

-- CreateIndex
CREATE UNIQUE INDEX "ValtMaintenance_valtsId_key" ON "ValtMaintenance"("valtsId");

-- AddForeignKey
ALTER TABLE "Assignee" ADD CONSTRAINT "Assignee_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignee" ADD CONSTRAINT "Assignee_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "business"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignee" ADD CONSTRAINT "Assignee_drawersId_fkey" FOREIGN KEY ("drawersId") REFERENCES "Drawers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignee" ADD CONSTRAINT "Assignee_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignee" ADD CONSTRAINT "Assignee_relationshipId_fkey" FOREIGN KEY ("relationshipId") REFERENCES "relationship"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignee" ADD CONSTRAINT "Assignee_squaresId_fkey" FOREIGN KEY ("squaresId") REFERENCES "Squares"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignee" ADD CONSTRAINT "Assignee_valtsId_fkey" FOREIGN KEY ("valtsId") REFERENCES "Valts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Documents" ADD CONSTRAINT "Documents_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "Assignee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeceasedDocuments" ADD CONSTRAINT "DeceasedDocuments_deceasedId_fkey" FOREIGN KEY ("deceasedId") REFERENCES "Deceased"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deceased" ADD CONSTRAINT "Deceased_drawersId_fkey" FOREIGN KEY ("drawersId") REFERENCES "Drawers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deceased" ADD CONSTRAINT "Deceased_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "Assignee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DelinquencyRecords" ADD CONSTRAINT "DelinquencyRecords_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "Assignee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DelinquencyRecords" ADD CONSTRAINT "DelinquencyRecords_financialManagementId_fkey" FOREIGN KEY ("financialManagementId") REFERENCES "FinancialManagement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Drawers" ADD CONSTRAINT "Drawers_valtsId_fkey" FOREIGN KEY ("valtsId") REFERENCES "Valts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DrawersHistory" ADD CONSTRAINT "DrawersHistory_drawersId_fkey" FOREIGN KEY ("drawersId") REFERENCES "Drawers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employees" ADD CONSTRAINT "Employees_graveyardManagementId_fkey" FOREIGN KEY ("graveyardManagementId") REFERENCES "GraveyardManagement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employees" ADD CONSTRAINT "Employees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exhumation" ADD CONSTRAINT "Exhumation_deceasedId_fkey" FOREIGN KEY ("deceasedId") REFERENCES "Deceased"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exhumation" ADD CONSTRAINT "Exhumation_drawersId_fkey" FOREIGN KEY ("drawersId") REFERENCES "Drawers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Funeral" ADD CONSTRAINT "Funeral_deceasedId_fkey" FOREIGN KEY ("deceasedId") REFERENCES "Deceased"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Funeral" ADD CONSTRAINT "Funeral_funeralRoomsId_fkey" FOREIGN KEY ("funeralRoomsId") REFERENCES "FuneralRooms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraveyardServices" ADD CONSTRAINT "GraveyardServices_graveyardsId_fkey" FOREIGN KEY ("graveyardsId") REFERENCES "Graveyards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GraveyardServices" ADD CONSTRAINT "GraveyardServices_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "promotions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Graveyards" ADD CONSTRAINT "Graveyards_graveyardManagementId_fkey" FOREIGN KEY ("graveyardManagementId") REFERENCES "GraveyardManagement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Graveyards" ADD CONSTRAINT "Graveyards_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Graveyards" ADD CONSTRAINT "Graveyards_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "promotions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentOld" ADD CONSTRAINT "PaymentOld_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "Assignee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Homage" ADD CONSTRAINT "Homage_memorialId_fkey" FOREIGN KEY ("memorialId") REFERENCES "Memorial"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memorial" ADD CONSTRAINT "Memorial_deceasedId_fkey" FOREIGN KEY ("deceasedId") REFERENCES "Deceased"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerUser" ADD CONSTRAINT "PartnerUser_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnerUser" ADD CONSTRAINT "PartnerUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentMethods" ADD CONSTRAINT "PaymentMethods_financialManagementId_fkey" FOREIGN KEY ("financialManagementId") REFERENCES "FinancialManagement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentsGenerated" ADD CONSTRAINT "PaymentsGenerated_valtOwnersId_fkey" FOREIGN KEY ("valtOwnersId") REFERENCES "ValtOwners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentHistory" ADD CONSTRAINT "PaymentHistory_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "Assignee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentHistory" ADD CONSTRAINT "PaymentHistory_financialManagementId_fkey" FOREIGN KEY ("financialManagementId") REFERENCES "FinancialManagement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentsAttachment" ADD CONSTRAINT "PaymentsAttachment_localPaymentId_fkey" FOREIGN KEY ("localPaymentId") REFERENCES "LocalPayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocalPayment" ADD CONSTRAINT "LocalPayment_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "Assignee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionCharges" ADD CONSTRAINT "SubscriptionCharges_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "Assignee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionCharges" ADD CONSTRAINT "SubscriptionCharges_recurrenceSubscriptionsId_fkey" FOREIGN KEY ("recurrenceSubscriptionsId") REFERENCES "RecurrenceSubscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionUsedIn" ADD CONSTRAINT "SubscriptionUsedIn_valtsId_fkey" FOREIGN KEY ("valtsId") REFERENCES "Valts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionUsedIn" ADD CONSTRAINT "SubscriptionUsedIn_graveyardServicesId_fkey" FOREIGN KEY ("graveyardServicesId") REFERENCES "GraveyardServices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionUsedIn" ADD CONSTRAINT "SubscriptionUsedIn_drawersId_fkey" FOREIGN KEY ("drawersId") REFERENCES "Drawers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurrenceSubscriptions" ADD CONSTRAINT "RecurrenceSubscriptions_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "Assignee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurrenceSubscriptions" ADD CONSTRAINT "RecurrenceSubscriptions_subscriptionUsedInId_fkey" FOREIGN KEY ("subscriptionUsedInId") REFERENCES "SubscriptionUsedIn"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurrenceSubscriptions" ADD CONSTRAINT "RecurrenceSubscriptions_recurrencePlanId_fkey" FOREIGN KEY ("recurrencePlanId") REFERENCES "RecurrencePlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Squares" ADD CONSTRAINT "Squares_employeesId_fkey" FOREIGN KEY ("employeesId") REFERENCES "Employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Squares" ADD CONSTRAINT "Squares_graveyardsId_fkey" FOREIGN KEY ("graveyardsId") REFERENCES "Graveyards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValtType" ADD CONSTRAINT "ValtType_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "promotions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Valts" ADD CONSTRAINT "Valts_squaresId_fkey" FOREIGN KEY ("squaresId") REFERENCES "Squares"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Valts" ADD CONSTRAINT "Valts_valtTypeId_fkey" FOREIGN KEY ("valtTypeId") REFERENCES "ValtType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Valts" ADD CONSTRAINT "Valts_sectorsId_fkey" FOREIGN KEY ("sectorsId") REFERENCES "Sectors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValtOwners" ADD CONSTRAINT "ValtOwners_valtsId_fkey" FOREIGN KEY ("valtsId") REFERENCES "Valts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValtOwners" ADD CONSTRAINT "ValtOwners_paymentHistoryId_fkey" FOREIGN KEY ("paymentHistoryId") REFERENCES "PaymentHistory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValtOwners" ADD CONSTRAINT "ValtOwners_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "Assignee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValtMaintenance" ADD CONSTRAINT "ValtMaintenance_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "Assignee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValtMaintenance" ADD CONSTRAINT "ValtMaintenance_valtsId_fkey" FOREIGN KEY ("valtsId") REFERENCES "Valts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
