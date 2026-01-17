import prisma from '../lib/db';

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.payment.deleteMany();
  await prisma.contractSignature.deleteMany();
  await prisma.contractStateTransition.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.room.deleteMany();
  await prisma.building.deleteMany();
  await prisma.inflationIndex.deleteMany();
  await prisma.rentHistory.deleteMany();

  // Create buildings
  const buildingA = await prisma.building.create({
    data: {
      name: 'ตึก A',
      address: '123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
    },
  });

  const buildingB = await prisma.building.create({
    data: {
      name: 'ตึก B',
      address: '456 ถนนพระราม 4 แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',
    },
  });

  console.log('✅ Created buildings:', buildingA.name, buildingB.name);

  // Create rooms for Building A
  const roomsA = await Promise.all([
    prisma.room.create({
      data: {
        buildingId: buildingA.id,
        roomNumber: '101',
        floor: 1,
        sizeSqm: 28,
        baseRentTHB: 8000,
        status: 'OCCUPIED',
      },
    }),
    prisma.room.create({
      data: {
        buildingId: buildingA.id,
        roomNumber: '102',
        floor: 1,
        sizeSqm: 32,
        baseRentTHB: 9000,
        status: 'OCCUPIED',
      },
    }),
    prisma.room.create({
      data: {
        buildingId: buildingA.id,
        roomNumber: '201',
        floor: 2,
        sizeSqm: 28,
        baseRentTHB: 8500,
        status: 'OCCUPIED',
      },
    }),
    prisma.room.create({
      data: {
        buildingId: buildingA.id,
        roomNumber: '202',
        floor: 2,
        sizeSqm: 35,
        baseRentTHB: 10000,
        status: 'VACANT',
      },
    }),
  ]);

  // Create rooms for Building B
  const roomsB = await Promise.all([
    prisma.room.create({
      data: {
        buildingId: buildingB.id,
        roomNumber: '101',
        floor: 1,
        sizeSqm: 25,
        baseRentTHB: 7500,
        status: 'OCCUPIED',
      },
    }),
    prisma.room.create({
      data: {
        buildingId: buildingB.id,
        roomNumber: '102',
        floor: 1,
        sizeSqm: 25,
        baseRentTHB: 7500,
        status: 'OCCUPIED',
      },
    }),
    prisma.room.create({
      data: {
        buildingId: buildingB.id,
        roomNumber: '201',
        floor: 2,
        sizeSqm: 30,
        baseRentTHB: 8500,
        status: 'OCCUPIED',
      },
    }),
    prisma.room.create({
      data: {
        buildingId: buildingB.id,
        roomNumber: '202',
        floor: 2,
        sizeSqm: 30,
        baseRentTHB: 8500,
        status: 'MAINTENANCE',
      },
    }),
    prisma.room.create({
      data: {
        buildingId: buildingB.id,
        roomNumber: '301',
        floor: 3,
        sizeSqm: 40,
        baseRentTHB: 12000,
        status: 'OCCUPIED',
      },
    }),
  ]);

  console.log('✅ Created', roomsA.length + roomsB.length, 'rooms');

  // Create tenants
  const tenants = await Promise.all([
    prisma.tenant.create({
      data: {
        name: 'คุณสมชาย ใจดี',
        phone: '081-234-5678',
        email: 'somchai@example.com',
      },
    }),
    prisma.tenant.create({
      data: {
        name: 'คุณสมหญิง รักสวย',
        phone: '082-345-6789',
        email: 'somying@example.com',
      },
    }),
    prisma.tenant.create({
      data: {
        name: 'คุณมานะ ขยันดี',
        phone: '083-456-7890',
      },
    }),
    prisma.tenant.create({
      data: {
        name: 'คุณวิไล สุขสันต์',
        phone: '084-567-8901',
      },
    }),
    prisma.tenant.create({
      data: {
        name: 'คุณประเสริฐ มั่งมี',
        phone: '085-678-9012',
        email: 'prasert@example.com',
      },
    }),
    prisma.tenant.create({
      data: {
        name: 'คุณนิภา รุ่งเรือง',
        phone: '086-789-0123',
      },
    }),
    prisma.tenant.create({
      data: {
        name: 'คุณอำนวย พอใจ',
        phone: '087-890-1234',
      },
    }),
  ]);

  console.log('✅ Created', tenants.length, 'tenants');

  // Create contracts (active)
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
  const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), 1);
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const contracts = await Promise.all([
    // Building A contracts
    prisma.contract.create({
      data: {
        roomId: roomsA[0].id,
        tenantId: tenants[0].id,
        startDate: oneYearAgo,
        endDate: oneYearFromNow,
        rentAmountTHB: 8000,
        depositTHB: 16000,
        status: 'ACTIVE',
      },
    }),
    prisma.contract.create({
      data: {
        roomId: roomsA[1].id,
        tenantId: tenants[1].id,
        startDate: oneYearAgo,
        endDate: thirtyDaysFromNow, // Expiring soon!
        rentAmountTHB: 9000,
        depositTHB: 18000,
        status: 'EXPIRING',
      },
    }),
    prisma.contract.create({
      data: {
        roomId: roomsA[2].id,
        tenantId: tenants[2].id,
        startDate: oneYearAgo,
        endDate: oneYearFromNow,
        rentAmountTHB: 8500,
        depositTHB: 17000,
        status: 'ACTIVE',
      },
    }),
    // Building B contracts
    prisma.contract.create({
      data: {
        roomId: roomsB[0].id,
        tenantId: tenants[3].id,
        startDate: oneYearAgo,
        endDate: oneYearFromNow,
        rentAmountTHB: 7500,
        depositTHB: 15000,
        status: 'ACTIVE',
      },
    }),
    prisma.contract.create({
      data: {
        roomId: roomsB[1].id,
        tenantId: tenants[4].id,
        startDate: oneYearAgo,
        endDate: oneYearFromNow,
        rentAmountTHB: 7500,
        depositTHB: 15000,
        status: 'ACTIVE',
      },
    }),
    prisma.contract.create({
      data: {
        roomId: roomsB[2].id,
        tenantId: tenants[5].id,
        startDate: oneYearAgo,
        endDate: oneYearFromNow,
        rentAmountTHB: 8500,
        depositTHB: 17000,
        status: 'ACTIVE',
      },
    }),
    prisma.contract.create({
      data: {
        roomId: roomsB[4].id,
        tenantId: tenants[6].id,
        startDate: oneYearAgo,
        endDate: oneYearFromNow,
        rentAmountTHB: 12000,
        depositTHB: 24000,
        status: 'ACTIVE',
      },
    }),
  ]);

  console.log('✅ Created', contracts.length, 'contracts');

  // Create sample payments for current month
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const payments = await Promise.all(
    contracts.map((contract, index) =>
      prisma.payment.create({
        data: {
          contractId: contract.id,
          periodYear: currentYear,
          periodMonth: currentMonth,
          amountTHB: contract.rentAmountTHB,
          paidTHB: index === 2 ? 0 : contract.rentAmountTHB, // One unpaid
          dueDate: new Date(currentYear, currentMonth - 1, 5),
          paidDate: index === 2 ? null : new Date(currentYear, currentMonth - 1, 3),
          status: index === 2 ? 'OVERDUE' : 'PAID',
        },
      })
    )
  );

  console.log('✅ Created', payments.length, 'payments');

  // Create inflation data (Thai CPI)
  const inflationData = [
    { year: 2023, month: 1, ratePct: 0.21 },
    { year: 2023, month: 2, ratePct: 0.18 },
    { year: 2023, month: 3, ratePct: 0.25 },
    { year: 2023, month: 4, ratePct: 0.22 },
    { year: 2023, month: 5, ratePct: 0.19 },
    { year: 2023, month: 6, ratePct: 0.23 },
    { year: 2023, month: 7, ratePct: 0.20 },
    { year: 2023, month: 8, ratePct: 0.18 },
    { year: 2023, month: 9, ratePct: 0.24 },
    { year: 2023, month: 10, ratePct: 0.21 },
    { year: 2023, month: 11, ratePct: 0.17 },
    { year: 2023, month: 12, ratePct: 0.22 },
    { year: 2024, month: 1, ratePct: 0.15 },
    { year: 2024, month: 2, ratePct: 0.16 },
    { year: 2024, month: 3, ratePct: 0.18 },
    { year: 2024, month: 4, ratePct: 0.14 },
    { year: 2024, month: 5, ratePct: 0.17 },
    { year: 2024, month: 6, ratePct: 0.19 },
    { year: 2024, month: 7, ratePct: 0.16 },
    { year: 2024, month: 8, ratePct: 0.15 },
    { year: 2024, month: 9, ratePct: 0.18 },
    { year: 2024, month: 10, ratePct: 0.20 },
    { year: 2024, month: 11, ratePct: 0.17 },
    { year: 2024, month: 12, ratePct: 0.19 },
  ];

  await prisma.inflationIndex.createMany({
    data: inflationData.map((d) => ({
      ...d,
      source: 'seed',
    })),
  });

  console.log('✅ Created', inflationData.length, 'inflation records');

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });