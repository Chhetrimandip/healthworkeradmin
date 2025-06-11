import { PrismaClient } from '../app/generated/prisma';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create super admin
  const superAdminPassword = await bcrypt.hash('admin123', 10);
  await prisma.userAuth.upsert({
    where: { email: 'admin@medicare.com' },
    update: {},
    create: {
      email: 'admin@medicare.com',
      passwordHash: superAdminPassword,
      name: 'Super Admin',
      role: 'super_admin'
    }
  });

  // Create organization-specific admins
  const orgs = ['Cardiology', 'Dermatology', 'Emergency Medicine'];
  
  for (const org of orgs) {
    const password = await bcrypt.hash(`${org.toLowerCase()}admin`, 10);
    await prisma.userAuth.upsert({
      where: { email: `${org.toLowerCase()}@medicare.com` },
      update: {},
      create: {
        email: `${org.toLowerCase()}@medicare.com`,
        passwordHash: password,
        name: `${org} Admin`,
        role: 'org_admin',
        organization: org
      }
    });
  }

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });