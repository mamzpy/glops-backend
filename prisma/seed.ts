import * as bcrypt from 'bcrypt';

import { PrismaClient, DeviceStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const plainSecret = 'test-secret';

  const secretHash = await bcrypt.hash(plainSecret, 10);

  const device = await prisma.device.upsert({
    where: {
      deviceId: 'otp-terminal-01',
    },
    update: {
      secretHash,
      status: DeviceStatus.ACTIVE,
    },
    create: {
      deviceId: 'otp-terminal-01',
      secretHash,
      stationId: 'station-001',
      type: 'OTP_TERMINAL',
      status: DeviceStatus.ACTIVE,
    },
  });

  console.log('Seeded device:', {
    deviceId: device.deviceId,
    stationId: device.stationId,
    secret: plainSecret,
  });
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });