import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Demo Peluqueria
  await prisma.tenant.upsert({
    where: { slug: 'demo-peluqueria' },
    update: {
      borderRadius: '1rem'
    },
    create: {
      slug: 'demo-peluqueria',
      name: 'Peluquería VIP Demo',
      logoUrl: '',
      workingDays: [1, 2, 3, 4, 5, 6],
      workingStart: '09:00',
      workingEnd: '20:00',
      primaryColor: '#eab308', // Yellow
      borderRadius: '1rem',
      users: {
        create: {
          email: 'demo-peluqueria@turneraapp.com',
          password: 'demo123',
        }
      },
      services: {
        create: [
          { name: 'Corte Clásico', price: 8000, durationMinutes: 30 },
          { name: 'Corte + Barba', price: 12000, durationMinutes: 45 },
          { name: 'Decoloración y Tinte', price: 25000, durationMinutes: 120 }
        ]
      }
    }
  });

  // Demo Kinesiologia
  await prisma.tenant.upsert({
    where: { slug: 'demo-kinesiologia' },
    update: {
      borderRadius: '1rem'
    },
    create: {
      slug: 'demo-kinesiologia',
      name: 'Centro Kinesiológico Demo',
      logoUrl: '',
      workingDays: [1, 2, 3, 4, 5],
      workingStart: '08:00',
      workingEnd: '18:00',
      primaryColor: '#14b8a6', // Teal
      borderRadius: '1rem',
      users: {
        create: {
          email: 'demo-kine@turneraapp.com',
          password: 'demo123',
        }
      },
      services: {
        create: [
          { name: 'Sesión Kinesiología', price: 15000, durationMinutes: 45 },
          { name: 'Masaje Descontracturante', price: 18000, durationMinutes: 60 },
          { name: 'Evaluación Postural', price: 12000, durationMinutes: 30 }
        ]
      }
    }
  });

  // Demo Odontologia
  await prisma.tenant.upsert({
    where: { slug: 'demo-odontologia' },
    update: {
      borderRadius: '1rem'
    },
    create: {
      slug: 'demo-odontologia',
      name: 'Consultorio Odontológico Demo',
      logoUrl: '',
      workingDays: [1, 2, 3, 4, 5],
      workingStart: '10:00',
      workingEnd: '19:00',
      primaryColor: '#3b82f6', // Blue
      borderRadius: '1rem',
      users: {
        create: {
          email: 'demo-odonto@turneraapp.com',
          password: 'demo123',
        }
      },
      services: {
        create: [
          { name: 'Consulta General', price: 20000, durationMinutes: 30 },
          { name: 'Limpieza con Ultrasonido', price: 35000, durationMinutes: 45 },
          { name: 'Blanqueamiento Dental', price: 80000, durationMinutes: 60 }
        ]
      }
    }
  });

  // Demo Estetica
  await prisma.tenant.upsert({
    where: { slug: 'demo-estetica' },
    update: {
      borderRadius: '1rem'
    },
    create: {
      slug: 'demo-estetica',
      name: 'Centro de Estética Demo',
      logoUrl: '',
      workingDays: [1, 2, 3, 4, 5, 6],
      workingStart: '09:00',
      workingEnd: '20:00',
      primaryColor: '#ec4899', // Pink
      borderRadius: '1rem',
      users: {
        create: {
          email: 'demo-estetica@turneraapp.com',
          password: 'demo123',
        }
      },
      services: {
        create: [
          { name: 'Lifting de Pestañas', price: 25000, durationMinutes: 60 },
          { name: 'Esculpidas Acrílicas', price: 18000, durationMinutes: 90 },
          { name: 'Limpieza Facial Profunda', price: 30000, durationMinutes: 60 }
        ]
      }
    }
  });

  console.log('Demos generadas correctamente en la base de datos.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
