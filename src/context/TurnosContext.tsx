import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type EstadoTurno = 'confirmado' | 'cancelado' | 'pendiente';

export interface Turno {
  id: string;
  clientName: string;
  clientEmail: string;
  serviceId: string;
  datetime: string | Date; // API returns string, we convert
  status: EstadoTurno;
}

export interface Cliente {
  id: string;
  name: string;
  email: string;
  totalTurnos: number;
  lastTurno: string | Date;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
}

interface TurnosContextType {
  turnos: Turno[];
  clientes: Cliente[];
  servicios: Service[];
  isAuthenticated: boolean;
  workingDays: number[];
  workingHours: { start: string; end: string };
  primaryColor: string;
  borderRadius: string;
  agregarTurno: (turno: Omit<Turno, 'id' | 'status'>) => Promise<string>;
  cancelarTurno: (id: string) => Promise<void>;
  eliminarTurno: (id: string) => Promise<void>;
  eliminarCliente: (id: string) => Promise<void>;
  agregarServicio: (servicio: Omit<Service, 'id'>) => Promise<void>;
  editarServicio: (id: string, servicio: Omit<Service, 'id'>) => Promise<void>;
  eliminarServicio: (id: string) => Promise<void>;
  updateTheme: (settings: { workingDays?: number[], workingHours?: {start: string, end: string}, primaryColor?: string, borderRadius?: string }) => Promise<void>;
  login: () => void;
  logout: () => void;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  appTheme: 'light' | 'dark';
  toggleTheme: () => void;
}

const TurnosContext = createContext<TurnosContextType | undefined>(undefined);

export const TurnosProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('turneraapp_token');
  });
  
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicios, setServicios] = useState<Service[]>([]);
  const [workingDays, setWorkingDays] = useState<number[]>([1,2,3,4,5]);
  const [workingHours, setWorkingHours] = useState({ start: '09:00', end: '18:00' });
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [borderRadius, setBorderRadius] = useState('1rem');
  const [isLoading, setIsLoading] = useState(true);

  const [appTheme, setAppTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('turneraapp_theme') as 'light' | 'dark') || 'dark';
  });

  useEffect(() => {
    if (appTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('turneraapp_theme', appTheme);
  }, [appTheme]);

  const toggleTheme = () => setAppTheme(prev => prev === 'light' ? 'dark' : 'light');

  const fetchHeaders = () => {
    const token = localStorage.getItem('turneraapp_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  const refreshData = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/admin/data`, { headers: fetchHeaders() });
      if (res.status === 401 || res.status === 403) {
        logout();
        return;
      }
      const data = await res.json();
      setTurnos(data.turnos.map((t: any) => ({ ...t, datetime: new Date(t.datetime) })));
      setClientes(data.clientes.map((c: any) => ({ ...c, lastTurno: new Date(c.lastTurno) })));
      setServicios(data.servicios);
      if (data.tenant) {
        setWorkingDays(data.tenant.workingDays);
        setWorkingHours({ start: data.tenant.workingStart, end: data.tenant.workingEnd });
        setPrimaryColor(data.tenant.primaryColor);
        setBorderRadius(data.tenant.borderRadius);
        
        // Inject CSS Variables to document body
        document.documentElement.style.setProperty('--color-primary', data.tenant.primaryColor);
        document.documentElement.style.setProperty('--radius-global', data.tenant.borderRadius);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const agregarTurno = async (turno: Omit<Turno, 'id' | 'status'>) => {
    // Handled mostly by public endpoint via Landing Page
    return "implemented-in-client-booking"; 
  };

  const cancelarTurno = async (id: string) => {
    await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/admin/appointments/${id}/cancel`, {
      method: 'PUT',
      headers: fetchHeaders()
    });
    setTurnos(prev => prev.map(t => t.id === id ? { ...t, status: 'cancelado' } : t));
  };

  const eliminarTurno = async (id: string) => {
    await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/admin/appointments/${id}`, {
      method: 'DELETE',
      headers: fetchHeaders()
    });
    setTurnos(prev => prev.filter(t => t.id !== id));
  };

  const eliminarCliente = async (id: string) => {
    await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/admin/clients/${id}`, {
      method: 'DELETE',
      headers: fetchHeaders()
    });
    setClientes(prev => prev.filter(c => c.id !== id));
    setTurnos(prev => prev.filter(t => t.clientId !== id)); // Also remove their appointments from local state
  };

  const agregarServicio = async (servicio: Omit<Service, 'id'>) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/admin/services`, {
      method: 'POST',
      headers: fetchHeaders(),
      body: JSON.stringify(servicio)
    });
    const newService = await res.json();
    setServicios(prev => [...prev, newService]);
  };

  const editarServicio = async (id: string, servicio: Omit<Service, 'id'>) => {
    await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/admin/services/${id}`, {
      method: 'PUT',
      headers: fetchHeaders(),
      body: JSON.stringify(servicio)
    });
    setServicios(prev => prev.map(s => s.id === id ? { ...servicio, id } : s));
  };

  const eliminarServicio = async (id: string) => {
    await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/admin/services/${id}`, {
      method: 'DELETE',
      headers: fetchHeaders()
    });
    setServicios(prev => prev.filter(s => s.id !== id));
    // refresh data because appointments might be cancelled
    refreshData();
  };

  const updateTheme = async (settings: { workingDays?: number[], workingHours?: {start: string, end: string}, primaryColor?: string, borderRadius?: string }) => {
    await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/admin/tenant`, {
      method: 'PUT',
      headers: fetchHeaders(),
      body: JSON.stringify(settings)
    });
    
    if (settings.workingDays) setWorkingDays(settings.workingDays);
    if (settings.workingHours) setWorkingHours(settings.workingHours);
    if (settings.primaryColor) {
      setPrimaryColor(settings.primaryColor);
      document.documentElement.style.setProperty('--color-primary', settings.primaryColor);
    }
    if (settings.borderRadius) {
      setBorderRadius(settings.borderRadius);
      document.documentElement.style.setProperty('--radius-global', settings.borderRadius);
    }
  };

  const login = () => {
    setIsAuthenticated(true);
  };
  
  const logout = () => {
    localStorage.removeItem('turneraapp_token');
    setIsAuthenticated(false);
  };

  return (
    <TurnosContext.Provider value={{ 
      turnos, clientes, servicios, isAuthenticated,
      workingDays, workingHours, primaryColor, borderRadius,
      agregarTurno, cancelarTurno, eliminarTurno, eliminarCliente,
      agregarServicio, editarServicio, eliminarServicio,
      updateTheme, login, logout, isLoading, refreshData,
      appTheme, toggleTheme
    }}>
      {children}
    </TurnosContext.Provider>
  );
};

export const useTurnosContext = () => {
  const context = useContext(TurnosContext);
  if (!context) throw new Error('useTurnosContext must be used within a TurnosProvider');
  return context;
};
