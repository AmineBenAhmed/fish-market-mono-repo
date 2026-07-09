import { PrismaClient } from '@prisma/client';
import { governorates, areas, zones } from '../src/modules/locations/locations.data';

const prisma = new PrismaClient();

async function main() {
  const govMap = new Map<string, string>();

  console.log('Seeding governorates...');
  for (const g of governorates) {
    const record = await prisma.governorate.upsert({
      where: { slug: g.slug },
      update: { name: g.name, lat: g.lat, lng: g.lng },
      create: { slug: g.slug, name: g.name, lat: g.lat, lng: g.lng },
    });
    govMap.set(g.slug, record.id);
  }
  console.log(`  Seeded ${governorates.length} governorates`);

  const areaMap = new Map<string, string>();

  console.log('Seeding areas...');
  for (const a of areas) {
    const govId = govMap.get(a.governorateSlug);
    if (!govId)
      throw new Error(`Governorate slug "${a.governorateSlug}" not found for area "${a.slug}"`);
    const record = await prisma.area.upsert({
      where: { slug: a.slug },
      update: { governorateId: govId, name: a.name, lat: a.lat, lng: a.lng },
      create: { slug: a.slug, governorateId: govId, name: a.name, lat: a.lat, lng: a.lng },
    });
    areaMap.set(a.slug, record.id);
  }
  console.log(`  Seeded ${areas.length} areas`);

  console.log('Seeding zones...');
  for (const z of zones) {
    const govId = govMap.get(z.governorateSlug);
    const areaId = areaMap.get(z.areaSlug);
    if (!govId)
      throw new Error(`Governorate slug "${z.governorateSlug}" not found for zone "${z.slug}"`);
    if (!areaId) throw new Error(`Area slug "${z.areaSlug}" not found for zone "${z.slug}"`);
    await prisma.zone.upsert({
      where: { slug: z.slug },
      update: { governorateId: govId, areaId, name: z.name, lat: z.lat, lng: z.lng },
      create: { slug: z.slug, governorateId: govId, areaId, name: z.name, lat: z.lat, lng: z.lng },
    });
  }
  console.log(`  Seeded ${zones.length} zones`);

  console.log('Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
