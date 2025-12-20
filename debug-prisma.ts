
import { prisma } from '@/lib/prisma';

async function main() {
  console.log('Prisma keys:', Object.keys(prisma));
  console.log('prisma.usuario present:', !!(prisma as any).usuario);
  console.log('prisma.usuarios present:', !!(prisma as any).usuarios);
  
  if ((prisma as any).usuario) {
    console.log('prisma.usuario keys:', Object.keys((prisma as any).usuario));
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
