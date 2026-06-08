import * as bcrypt from 'bcrypt';

import { DeviceStatus, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function upsertDevice(params: {
  deviceId: string;
  stationId: string;
  plainSecret: string;
  type: string;
}) {
  const secretHash = await bcrypt.hash(params.plainSecret, 10);

  return prisma.device.upsert({
    where: {
      deviceId: params.deviceId,
    },
    update: {
      secretHash,
      stationId: params.stationId,
      type: params.type,
      status: DeviceStatus.ACTIVE,
    },
    create: {
      deviceId: params.deviceId,
      secretHash,
      stationId: params.stationId,
      type: params.type,
      status: DeviceStatus.ACTIVE,
    },
  });
}

async function main(): Promise<void> {
  const plainSecret = process.env.SEED_DEVICE_SECRET ?? 'test-secret';

  const device1 = await upsertDevice({
    deviceId: 'opt-terminal-01',
    stationId: 'station-001',
    plainSecret,
    type: 'OPT_TERMINAL',
  });

  const device2 = await upsertDevice({
    deviceId: 'opt-terminal-02',
    stationId: 'station-002',
    plainSecret,
    type: 'OPT_TERMINAL',
  });

  console.log('Seeded devices:', [
    {
      deviceId: device1.deviceId,
      stationId: device1.stationId,
      type: device1.type,
      status: device1.status,
    },
    {
      deviceId: device2.deviceId,
      stationId: device2.stationId,
      type: device2.type,
      status: device2.status,
    },
  ]);
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });