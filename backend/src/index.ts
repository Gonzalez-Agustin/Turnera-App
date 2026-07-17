import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { sendAppointmentEmail, sendAdminNotificationEmail } from './emailService';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

app.use(cors());
app.use(express.json());

// --- Middleware: Verify JWT ---
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) return res.status(400).json({ error: 'User not found' });
  
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).json({ error: 'Invalid password' });
  
  const token = jwt.sign({ userId: user.id, tenantId: user.tenantId }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, tenantId: user.tenantId });
});

// --- TENANT ROUTES (PUBLIC) ---
app.get('/api/tenants/:slug', async (req, res) => {
  const { slug } = req.params;
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    include: { services: true }
  });
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  res.json(tenant);
});

app.get('/api/tenants/:slug/appointments', async (req, res) => {
  const { slug } = req.params;
  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  
  // Return only future appointments that are not cancelled
  const appointments = await prisma.appointment.findMany({
    where: { 
      tenantId: tenant.id,
      datetime: { gte: new Date() },
      status: { not: 'cancelado' }
    },
    select: { datetime: true }
  });
  res.json(appointments);
});

// --- APPOINTMENT ROUTES (PUBLIC) ---
app.post('/api/appointments', async (req, res) => {
  const { tenantId, serviceId, clientName, clientEmail, clientPhone, datetime } = req.body;
  
  try {
    // 1. Create or find Client
    let client = await prisma.client.findUnique({ where: { email: clientEmail } });
    if (!client) {
      client = await prisma.client.create({
        data: { name: clientName, email: clientEmail, phone: clientPhone, tenantId }
      });
    }

    // 2. Create Appointment
    const appointment = await prisma.appointment.create({
      data: {
        datetime: new Date(datetime),
        clientId: client.id,
        serviceId,
        tenantId
      },
      include: {
        service: true,
        tenant: true
      }
    });

    // 3. Send Email Notification
    try {
      const dateObj = new Date(datetime);
      const dateStr = dateObj.toLocaleDateString('es-AR');
      const timeStr = dateObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
      
      // Notify Client
      await sendAppointmentEmail(
        clientEmail,
        clientName,
        appointment.service.name,
        dateStr,
        timeStr,
        appointment.tenant.name
      );

      // Notify Admin
      const adminUser = await prisma.user.findFirst({ where: { tenantId } });
      if (adminUser) {
        await sendAdminNotificationEmail(
          adminUser.email,
          clientName,
          appointment.service.name,
          dateStr,
          timeStr
        );
      }

    } catch (emailError) {
      console.error('Email failed, but appointment was created:', emailError);
    }

    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

// --- PROTECTED ROUTES (DASHBOARD) ---
app.get('/api/admin/data', authenticateToken, async (req: any, res) => {
  const tenantId = req.user.tenantId;
  
  const [turnos, clientes, servicios, tenant] = await Promise.all([
    prisma.appointment.findMany({ where: { tenantId }, include: { client: true, service: true } }),
    prisma.client.findMany({ where: { tenantId } }),
    prisma.service.findMany({ where: { tenantId } }),
    prisma.tenant.findUnique({ where: { id: tenantId } })
  ]);
  
  // Format appointments for frontend
  const formattedTurnos = turnos.map(t => ({
    id: t.id,
    clientName: t.client.name,
    clientEmail: t.client.email,
    serviceId: t.serviceId,
    datetime: t.datetime.toISOString(),
    status: t.status
  }));

  // Format clients for frontend
  const formattedClientes = clientes.map(c => {
    const clientAppointments = turnos.filter(t => t.clientId === c.id);
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      totalTurnos: clientAppointments.length,
      lastTurno: clientAppointments.length > 0 ? clientAppointments.sort((a, b) => b.datetime.getTime() - a.datetime.getTime())[0].datetime.toISOString() : c.createdAt.toISOString()
    };
  });

  res.json({ turnos: formattedTurnos, clientes: formattedClientes, servicios, tenant });
});

app.post('/api/admin/services', authenticateToken, async (req: any, res) => {
  const tenantId = req.user.tenantId;
  const { name, price, durationMinutes } = req.body;
  const service = await prisma.service.create({
    data: { name, price, durationMinutes, tenantId }
  });
  res.json(service);
});

app.put('/api/admin/services/:id', authenticateToken, async (req: any, res) => {
  const tenantId = req.user.tenantId;
  const { id } = req.params;
  const { name, price, durationMinutes } = req.body;
  
  const service = await prisma.service.updateMany({
    where: { id, tenantId },
    data: { name, price, durationMinutes }
  });
  res.json(service);
});

app.delete('/api/admin/services/:id', authenticateToken, async (req: any, res) => {
  const tenantId = req.user.tenantId;
  const { id } = req.params;
  
  // Cancel related appointments instead of deleting them to avoid Prisma relation errors
  await prisma.appointment.updateMany({
    where: { serviceId: id, tenantId },
    data: { status: 'cancelado' }
  });

  await prisma.service.deleteMany({
    where: { id, tenantId }
  });
  res.json({ success: true });
});

app.delete('/api/admin/appointments/:id', authenticateToken, async (req: any, res) => {
  const tenantId = req.user.tenantId;
  const { id } = req.params;
  
  await prisma.appointment.deleteMany({
    where: { id, tenantId }
  });
  res.json({ success: true });
});

app.delete('/api/admin/clients/:id', authenticateToken, async (req: any, res) => {
  const tenantId = req.user.tenantId;
  const { id } = req.params;
  
  // 1. Delete all appointments associated with this client
  await prisma.appointment.deleteMany({
    where: { clientId: id, tenantId }
  });
  
  // 2. Delete the client
  await prisma.client.deleteMany({
    where: { id, tenantId }
  });
  
  res.json({ success: true });
});

app.put('/api/admin/appointments/:id/cancel', authenticateToken, async (req: any, res) => {
  const tenantId = req.user.tenantId;
  const { id } = req.params;
  
  await prisma.appointment.updateMany({
    where: { id, tenantId },
    data: { status: 'cancelado' }
  });
  res.json({ success: true });
});

app.put('/api/admin/tenant', authenticateToken, async (req: any, res) => {
  const tenantId = req.user.tenantId;
  const { workingDays, workingHours, primaryColor, borderRadius } = req.body;
  
  const data: any = {};
  if (workingDays) data.workingDays = workingDays;
  if (workingHours) {
    data.workingStart = workingHours.start;
    data.workingEnd = workingHours.end;
  }
  if (primaryColor) data.primaryColor = primaryColor;
  if (borderRadius) data.borderRadius = borderRadius;

  const tenant = await prisma.tenant.update({
    where: { id: tenantId },
    data
  });
  res.json(tenant);
});

// Seed an initial demo tenant if database is empty
app.post('/api/seed', async (req, res) => {
  const count = await prisma.tenant.count();
  if (count > 0) return res.json({ message: 'Already seeded' });

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
  
  res.json({ message: 'Seeded demo tenant', tenant });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
