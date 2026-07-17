import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.tenant.count();
  if (count > 0) {
    console.log('Already seeded');
    return;
  }

  const hashedPassword = await bcrypt.hash('Piloto31', 10);
  
  const tenant = await prisma.tenant.create({
    data: {
      slug: 'demo',
      name: 'TurneraApp Demo',
      primaryColor: '#3b82f6',
      workingDays: [1,2,3,4,5],
      users: {
        create: {
          email: 'gonzalez.agustinnicolas.010@gmail.com',
          password: hashedPassword
        }
      },
      services: {
        create: [
          { name: 'Consulta General', price: 15000, durationMinutes: 30 },
          { name: 'Tratamiento Premium', price: 25000, durationMinutes: 60 }
        ]
      }
    }
  });
  console.log('Seeded successfully', tenant);
}

main().catch(console.error).finally(() => prisma.$disconnect());
