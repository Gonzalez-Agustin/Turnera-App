export type TenantType = 'barber' | 'medical' | 'generic';

export interface Service {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  mapUrl: string; // We'll use this for the map link/embed
}

export interface TenantConfig {
  type: TenantType;
  name: string;
  description: string;
  logoUrl: string;
  theme: {
    primary: string;
    primaryHover: string;
    background: string; // Used for base backgrounds or gradients
    card: string;       // Used for glassmorphism panels
    text: string;
    textMuted: string;
    border: string;
    gradientStart: string; // New: for vibrant backgrounds
    gradientEnd: string;   // New: for vibrant backgrounds
  };
  services: Service[];
  locations: Location[];
  workingDays: number[]; // 0 = Sunday, 1 = Monday, etc.
  workingHours: {
    start: string; // "09:00"
    end: string; // "18:00"
  };
}

export const tenants: Record<TenantType, TenantConfig> = {
  generic: {
    type: 'generic',
    name: 'TurneraApp Demo',
    description: 'Sistema de reservas profesional 100% configurable para tu negocio.',
    logoUrl: '', // Blank implies we use text fallback
    theme: {
      primary: '#eab308', // Yellow-500
      primaryHover: '#ca8a04',
      background: '#0f172a', // Slate-900
      card: 'rgba(30, 41, 59, 0.65)', // Slate-800 translucent
      text: '#f8fafc', 
      textMuted: '#94a3b8', 
      border: 'rgba(255, 255, 255, 0.1)', 
      gradientStart: '#0f172a',
      gradientEnd: '#020617',
    },
    services: [
      { id: 'g1', name: 'Servicio Principal', price: 15000, durationMinutes: 60 },
      { id: 'g2', name: 'Servicio Secundario', price: 8000, durationMinutes: 30 },
      { id: 'g3', name: 'Consulta Breve', price: 5000, durationMinutes: 15 },
      { id: 'g4', name: 'Sesión Completa', price: 25000, durationMinutes: 120 },
    ],
    locations: [
      { id: 'l1', name: 'Sede Central', address: 'Avenida Principal 123', mapUrl: 'https://maps.google.com' },
    ],
    workingDays: [1, 2, 3, 4, 5], // Mon-Fri
    workingHours: { start: '09:00', end: '18:00' },
  },
  barber: {
    type: 'barber',
    name: 'Vintage Barber Shop',
    description: 'Cortes clásicos, degradados y arreglo de barba premium.',
    logoUrl: '/barber-logo.png',
    theme: {
      primary: '#d4af37', // Gold
      primaryHover: '#b5952f',
      background: '#121212', 
      card: 'rgba(30, 30, 30, 0.65)', // Glassmorphism translucent
      text: '#ffffff', 
      textMuted: '#a1a1aa', // zinc-400
      border: 'rgba(255, 255, 255, 0.1)', // Subtle white border for glass effect
      gradientStart: '#18181b', // zinc-900
      gradientEnd: '#000000',   // deep black
    },
    services: [
      { id: 'b1', name: 'Corte Clásico Hombre', price: 5000, durationMinutes: 30 },
      { id: 'b2', name: 'Degradado (Skin Fade)', price: 6500, durationMinutes: 40 },
      { id: 'b3', name: 'Corte + Perfilado de Barba', price: 8500, durationMinutes: 50 },
      { id: 'b4', name: 'Arreglo de Barba Tradicional', price: 3500, durationMinutes: 20 },
      { id: 'b5', name: 'Corte Niño (Menores de 12)', price: 4000, durationMinutes: 30 },
      { id: 'b6', name: 'Camuflaje de Canas', price: 6000, durationMinutes: 30 },
      { id: 'b7', name: 'Corte + Perfilado de Cejas', price: 6000, durationMinutes: 45 },
    ],
    locations: [
      { id: 'l1', name: 'Casa Central', address: 'San Martín 1234, Santa Fe', mapUrl: 'https://maps.google.com/?q=-31.6333,-60.7000' },
    ],
    workingDays: [2, 3, 4, 5, 6], // Tue-Sat (Closed Sun, Mon)
    workingHours: { start: '10:00', end: '20:00' },
  },
  medical: {
    type: 'medical',
    name: 'Sonrisa Perfecta',
    description: 'Odontología estética e integral de alta gama.',
    logoUrl: '/medical-logo.png',
    theme: {
      primary: '#0ea5e9', // sky-500
      primaryHover: '#0284c7', // sky-600
      background: '#f8fafc', // slate-50
      card: 'rgba(255, 255, 255, 0.75)', // Glassmorphism
      text: '#0f172a', // slate-900
      textMuted: '#64748b', // slate-500
      border: 'rgba(0, 0, 0, 0.05)',
      gradientStart: '#e0f2fe', // sky-100
      gradientEnd: '#ffffff',
    },
    services: [
      { id: 'm1', name: 'Consulta General', price: 8000, durationMinutes: 30 },
      { id: 'm2', name: 'Limpieza Dental Profunda', price: 15000, durationMinutes: 45 },
      { id: 'm3', name: 'Blanqueamiento Láser', price: 35000, durationMinutes: 60 },
      { id: 'm4', name: 'Ortodoncia (Ajuste Mensual)', price: 12000, durationMinutes: 30 },
      { id: 'm5', name: 'Extracción Simple', price: 10000, durationMinutes: 40 },
    ],
    locations: [
      { id: 'l2', name: 'Sucursal Bv', address: 'Bv. Pellegrini 456, Santa Fe', mapUrl: 'https://maps.google.com/?q=-31.6250,-60.7050' },
    ],
    workingDays: [1, 2, 3, 4, 5], // Mon-Fri
    workingHours: { start: '08:00', end: '16:00' },
  }
};

// =======================================================
// CAMBIAR AQUI PARA PROBAR DISTINTOS NEGOCIOS
// =======================================================
export const currentTenant = tenants['generic'];
