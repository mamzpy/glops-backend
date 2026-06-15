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

  const demoDevices = [
    {
      deviceId: 'opt-terminal-01',
      stationId: 'station-001',
      type: 'OPT_TERMINAL',
    },
    {
      deviceId: 'opt-terminal-03',
      stationId: 'station-001',
      type: 'OPT_TERMINAL',
    },
    {
      deviceId: 'opt-terminal-04',
      stationId: 'station-001',
      type: 'OPT_TERMINAL',
    },
    {
      deviceId: 'opt-terminal-02',
      stationId: 'station-002',
      type: 'OPT_TERMINAL',
    },
  ];

  const devices = await Promise.all(
    demoDevices.map((device) =>
      upsertDevice({
        ...device,
        plainSecret,
      }),
    ),
  );

  console.log(
    'Seeded devices:',
    devices.map((device) => ({
      deviceId: device.deviceId,
      stationId: device.stationId,
      type: device.type,
      status: device.status,
    })),
  );
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });