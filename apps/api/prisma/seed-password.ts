import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const drivers = await prisma.user.findMany({
    where: { role: 'DRIVER' },
    select: { id: true, name: true },
  });

  console.log(`Found ${drivers.length} drivers`);

  const passwordHash = await bcrypt.hash('Driver123', 12);

  for (const driver of drivers) {
    await prisma.user.update({
      where: { id: driver.id },
      data: { passwordHash },
    });
    console.log(`  Updated: ${driver.name || driver.id}`);
  }

  console.log('Done! All drivers now have password: Driver123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
