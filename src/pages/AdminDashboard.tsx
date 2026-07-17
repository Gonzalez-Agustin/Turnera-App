import { useState, useEffect } from 'react';
import { currentTenant } from '../config/tenant';
import type { Service } from '../config/tenant';
import { useTurnosContext } from '../context/TurnosContext';
import type { Turno } from '../context/TurnosContext';
import { format, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Users, Settings, LogOut, CheckCircle2, Clock, XCircle, Trash2, MessageCircle, Info, BookOpen, FileSpreadsheet, Plus, Edit2, Check, X, AlertCircle, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLoader } from '../components/AppLoader';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

export const AdminDashboard = () => {
  const { turnos, clientes, servicios, eliminarTurno, eliminarCliente, agregarServicio, editarServicio, eliminarServicio, workingDays, workingHours, primaryColor, borderRadius, updateTheme, logout, isLoading, appTheme, toggleTheme } = useTurnosContext();
  const [activeTab, setActiveTab] = useState<'turnos' | 'clientes' | 'servicios' | 'ajustes'>('turnos');
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [turnoToDelete, setTurnoToDelete] = useState<string | null>(null);
  const [clienteToDelete, setClienteToDelete] = useState<string | null>(null);

  // Horarios & Theme form
  const [localWorkingDays, setLocalWorkingDays] = useState<number[]>(workingDays);
  const [localWorkingHours, setLocalWorkingHours] = useState(workingHours);
  const [localPrimaryColor, setLocalPrimaryColor] = useState(primaryColor);
  const [localBorderRadius, setLocalBorderRadius] = useState(borderRadius);
  const [isSettingsSaved, setIsSettingsSaved] = useState(false);

  // Form states for services
  const [isAddingService, setIsAddingService] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceForm, setServiceForm] = useState({ name: '', price: 0, durationMinutes: 30 });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Hijack the browser back button so they can't go back without logging out
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSaveNewService = () => {
    if (serviceForm.name.trim() === '') return;
    agregarServicio({ name: serviceForm.name, price: serviceForm.price, durationMinutes: serviceForm.durationMinutes });
    setIsAddingService(false);
    setServiceForm({ name: '', price: 0, durationMinutes: 30 });
  };

  const handleSaveEdit = () => {
    if (editingServiceId && serviceForm.name.trim() !== '') {
      editarServicio(editingServiceId, { name: serviceForm.name, price: serviceForm.price, durationMinutes: serviceForm.durationMinutes });
      setEditingServiceId(null);
    }
  };

  const startEditService = (s: Service) => {
    setEditingServiceId(s.id);
    setServiceForm({ name: s.name, price: s.price, durationMinutes: s.durationMinutes });
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      logout();
      navigate('/', { replace: true });
    }, 1200);
  };

  const handleSaveSettings = () => {
    updateTheme({ 
      workingDays: localWorkingDays, 
      workingHours: localWorkingHours,
      primaryColor: localPrimaryColor,
      borderRadius: localBorderRadius
    });
    setIsSettingsSaved(true);
    setTimeout(() => setIsSettingsSaved(false), 3000);
  };

  // Effect to sync local state when context loads initially
  useEffect(() => {
    if (workingDays.length > 0) setLocalWorkingDays(workingDays);
    if (workingHours.start) setLocalWorkingHours(workingHours);
    if (primaryColor) setLocalPrimaryColor(primaryColor);
    if (borderRadius) setLocalBorderRadius(borderRadius);
  }, [workingDays, workingHours, primaryColor, borderRadius]);

  if (isLoading) {
    return <AppLoader message="Cargando panel..." />;
  }

  const toggleDay = (dayIndex: number) => {
    setLocalWorkingDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex].sort()
    );
  };

  const handleExportExcel = () => {
    if (clientes.length === 0) return;
    const headers = ['Nombre', 'Email', 'Total Turnos', 'Ultimo Turno'];
    const csvContent = [
      headers.join(','),
      ...clientes.map(c => `"${c.name}","${c.email}",${c.totalTurnos},"${format(c.lastTurno, 'yyyy-MM-dd')}"`)
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'clientes_turneraapp.csv';
    link.click();
  };

  // --- STATS ---
  const stats = [
    { label: 'Turnos Hoy', value: turnos.filter(t => t.status === 'confirmado' && format(t.datetime, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')).length.toString(), icon: Calendar },
    { label: 'Total Clientes', value: clientes.length.toString(), icon: Users },
  ];

  // --- CHART DATA ---
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d;
  }).reverse();

  const chartData = last7Days.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const count = turnos.filter(t => t.status !== 'cancelado' && format(t.datetime, 'yyyy-MM-dd') === dateStr).length;
    return {
      name: format(date, 'EEE d', { locale: es }).replace(/^\w/, c => c.toUpperCase()),
      Turnos: count
    };
  });

  const renderStatus = (status: Turno['status']) => {
    switch(status) {
      case 'confirmado':
        return <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-semibold flex items-center gap-1 w-max shadow-sm"><CheckCircle2 size={12}/> Confirmado</span>;
      case 'pendiente':
        return <span className="px-3 py-1 bg-yellow-500/10 text-yellow-600 rounded-full text-xs font-semibold flex items-center gap-1 w-max shadow-sm"><Clock size={12}/> Pendiente</span>;
      case 'cancelado':
        return <span className="px-3 py-1 bg-red-500/10 text-red-600 rounded-full text-xs font-semibold flex items-center gap-1 w-max shadow-sm"><XCircle size={12}/> Cancelado</span>;
    }
  };

  const renderTabContent = () => {
    if (activeTab === 'clientes') {
      return (
        <motion.div 
          key="clientes"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Mis Clientes</h2>
              <p className="text-sm text-text-muted">Directorio permanente. No se borran al eliminar turnos.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-primary/10 text-primary rounded-xl font-semibold text-sm">
                {clientes.length} Registrados
              </div>
              <button onClick={handleExportExcel} className="group flex items-center gap-2 px-4 py-2 bg-background border border-border text-text hover:border-green-500/50 hover:shadow-md hover:-translate-y-0.5 rounded-xl text-sm font-semibold transition-all duration-300">
                <FileSpreadsheet size={16} className="text-green-600 group-hover:scale-110 transition-transform" />
                Exportar Excel
              </button>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-background/50 border-b border-border text-sm text-text-muted uppercase tracking-wider">
                    <th className="p-4 font-semibold">Cliente</th>
                    <th className="p-4 font-semibold text-center">Total Turnos</th>
                    <th className="p-4 font-semibold">Último Turno</th>
                    <th className="p-4 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <motion.tbody layout className="divide-y divide-border">
                  <AnimatePresence>
                    {clientes.length === 0 && (
                      <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <td colSpan={3} className="p-8 text-center text-text-muted">
                          Todavía no hay clientes registrados.
                        </td>
                      </motion.tr>
                    )}
                    {clientes.sort((a, b) => {
                        const aTime = isValid(a.lastTurno) ? new Date(a.lastTurno).getTime() : 0;
                        const bTime = isValid(b.lastTurno) ? new Date(b.lastTurno).getTime() : 0;
                        return bTime - aTime;
                    }).map(client => (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                        key={client.id} 
                        className="hover:bg-primary/5 transition-colors duration-200"
                      >
                        <td className="p-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                            {client.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold">{client.name}</p>
                            <p className="text-xs text-text-muted">{client.email}</p>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-block px-3 py-1 bg-background rounded-full font-bold text-sm border border-border">
                            {client.totalTurnos}
                          </span>
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-sm">
                            {isValid(client.lastTurno) ? format(client.lastTurno, "d MMM, yyyy", { locale: es }) : 'Sin turnos'}
                          </p>
                        </td>
                        <td className="p-4 text-right">
                          <motion.button 
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setClienteToDelete(client.id)}
                            className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Eliminar cliente"
                          >
                            <Trash2 size={18} />
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </motion.tbody>
              </table>
            </div>
          </div>
        </motion.div>
      );
    }
    
    if (activeTab === 'servicios') {
      return (
        <motion.div 
          key="servicios"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div>
            <h2 className="text-xl font-bold">Mis Servicios</h2>
            <p className="text-sm text-text-muted">Gestioná los servicios que ofreces y sus precios.</p>
          </div>
          
          {/* Services Editor Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-lg text-text">Tus Servicios y Precios</h3>
                <p className="text-xs text-text-muted">Editá esto y se actualizará en tu página pública al instante.</p>
              </div>
              <motion.button 
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => { setIsAddingService(true); setServiceForm({ name: '', price: 0, durationMinutes: 30 }); setEditingServiceId(null); }}
                className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md shrink-0"
                title="Agregar servicio"
              >
                <Plus size={20} />
              </motion.button>
            </div>

            <div className="space-y-4">
                <AnimatePresence>
                  {isAddingService && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      className="p-4 bg-background border border-primary/30 shadow-inner rounded-xl space-y-3 overflow-hidden"
                    >
                      <input 
                        type="text" 
                        placeholder="Nombre del servicio" 
                        className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                        value={serviceForm.name}
                        onChange={e => setServiceForm({...serviceForm, name: e.target.value})}
                      />
                      <div className="flex gap-3">
                        <div className="flex-1 relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
                          <input 
                            type="number" 
                            className="w-full bg-card border border-border rounded-lg pl-6 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                            value={serviceForm.price || ''}
                            onChange={e => setServiceForm({...serviceForm, price: parseInt(e.target.value) || 0})}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button onClick={handleSaveNewService} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 hover:shadow-md transition-all"><Check size={16}/></button>
                          <button onClick={() => setIsAddingService(false)} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 hover:shadow-md transition-all"><X size={16}/></button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {servicios.map(s => {
                    const isEditing = editingServiceId === s.id;
                    return (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, height: 0, marginTop: 0, padding: 0 }}
                        key={s.id} 
                        className={`rounded-xl transition-all duration-300 overflow-hidden ${isEditing ? 'p-4 bg-background border border-primary/50 shadow-inner space-y-3' : 'group flex justify-between items-center p-4 hover:bg-primary/5 border border-border/50 hover:border-primary/30'}`}
                      >
                        {isEditing ? (
                          <>
                            <input 
                              type="text" 
                              className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                              value={serviceForm.name}
                              onChange={e => setServiceForm({...serviceForm, name: e.target.value})}
                            />
                            <div className="flex gap-3">
                              <div className="flex-1 relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">$</span>
                                <input 
                                  type="number" 
                                  className="w-full bg-card border border-border rounded-lg pl-6 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                                  value={serviceForm.price || ''}
                                  onChange={e => setServiceForm({...serviceForm, price: parseInt(e.target.value) || 0})}
                                />
                              </div>
                              <div className="flex gap-2">
                                <button onClick={handleSaveEdit} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 hover:shadow-md transition-all"><Check size={16}/></button>
                                <button onClick={() => setEditingServiceId(null)} className="p-2 bg-text-muted text-white rounded-lg hover:bg-text hover:shadow-md transition-all"><X size={16}/></button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <span className="font-medium text-text block group-hover:text-primary transition-colors">{s.name}</span>
                              <span className="text-xs text-text-muted">{s.durationMinutes} min</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-bold text-text">${s.price}</span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => startEditService(s)} className="p-2 bg-background border border-border text-text hover:text-primary hover:border-primary/50 rounded-lg transition-colors shadow-sm"><Edit2 size={14}/></button>
                                <button onClick={() => eliminarServicio(s.id)} className="p-2 bg-background border border-border text-text hover:text-red-500 hover:border-red-500/50 rounded-lg transition-colors shadow-sm"><Trash2 size={14}/></button>
                              </div>
                            </div>
                          </>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        );
      }
      
    if (activeTab === 'ajustes') {
      return (
        <motion.div 
          key="ajustes"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6 w-full"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-bold">Configuración y Soporte</h2>
              <p className="text-sm text-text-muted">Administra tus horarios, diseño y obtén ayuda del sistema.</p>
            </div>
            
            <button 
              onClick={handleSaveSettings}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${isSettingsSaved ? 'bg-green-500 text-white' : 'bg-primary text-primary-foreground hover:bg-primary-hover hover:-translate-y-1'}`}
            >
              {isSettingsSaved ? (
                <><CheckCircle2 size={20} /> Guardado con éxito</>
              ) : (
                <>Guardar Ajustes</>
              )}
            </button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-start">
            {/* LEFT COLUMN: Settings Panels */}
            <div className="space-y-6 flex flex-col w-full">
              
              {/* Horarios Card */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="mb-6">
                  <h3 className="font-bold text-lg text-text">Días y Horarios de Trabajo</h3>
                  <p className="text-sm text-text-muted mt-1">Configurá cuándo estás disponible para recibir clientes.</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-text mb-3">Días que abris el local</label>
                    <div className="flex flex-wrap gap-2">
                      {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day, idx) => {
                        const isSelected = localWorkingDays.includes(idx);
                        return (
                          <button
                            key={idx}
                            onClick={() => toggleDay(idx)}
                            className={`w-12 h-12 rounded-xl font-bold text-sm transition-all duration-200 shadow-sm ${isSelected ? 'bg-primary text-primary-foreground scale-105' : 'bg-background border border-border text-text-muted hover:border-primary/50 hover:text-text'}`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="w-full flex-1">
                      <label className="block text-sm font-semibold text-text mb-2">Horario de Apertura</label>
                      <input 
                        type="time" 
                        value={localWorkingHours.start}
                        onChange={e => setLocalWorkingHours({...localWorkingHours, start: e.target.value})}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                      />
                    </div>
                    <div className="w-full flex-1">
                      <label className="block text-sm font-semibold text-text mb-2">Horario de Cierre</label>
                      <input 
                        type="time" 
                        value={localWorkingHours.end}
                        onChange={e => setLocalWorkingHours({...localWorkingHours, end: e.target.value})}
                        className="w-full bg-background border border-border rounded-xl px-4 py-3 text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel Config */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-lg text-text mb-4">Diseño del Panel</h3>
                <p className="text-sm text-text-muted mb-6">Personalizá los colores y la forma de tu panel de control para que coincida con tu marca.</p>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">Color Principal</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="color" 
                        value={localPrimaryColor}
                        onChange={(e) => setLocalPrimaryColor(e.target.value)}
                        className="h-12 w-24 rounded cursor-pointer border border-border"
                      />
                      <span className="text-sm font-mono bg-background px-3 py-1 rounded-md border border-border">{localPrimaryColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-text mb-2">Estilo de Bordes</label>
                    <div className="flex gap-4">
                      <button 
                        onClick={() => setLocalBorderRadius('0')}
                        className={`flex-1 py-3 border ${localBorderRadius === '0' ? 'border-primary ring-1 ring-primary/50' : 'border-border hover:border-primary/30'} bg-background text-text text-sm transition-all`}
                        style={{ borderRadius: '0' }}
                      >Rectos</button>
                      <button 
                        onClick={() => setLocalBorderRadius('0.5rem')}
                        className={`flex-1 py-3 border ${localBorderRadius === '0.5rem' ? 'border-primary ring-1 ring-primary/50' : 'border-border hover:border-primary/30'} bg-background text-text text-sm transition-all`}
                        style={{ borderRadius: '0.5rem' }}
                      >Normales</button>
                      <button 
                        onClick={() => setLocalBorderRadius('1rem')}
                        className={`flex-1 py-3 border ${localBorderRadius === '1rem' ? 'border-primary ring-1 ring-primary/50' : 'border-border hover:border-primary/30'} bg-background text-text text-sm transition-all`}
                        style={{ borderRadius: '1rem' }}
                      >Redondos</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Tutorial & Support */}
            <div className="space-y-6 flex flex-col w-full">
              {/* Tutorial Card */}
              <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6 text-primary">
                  <BookOpen size={24} />
                  <h3 className="font-bold text-lg text-text">Guía de Uso Básica</h3>
                </div>
                <ul className="space-y-5 text-sm text-text-muted">
                  <li className="flex gap-4">
                    <span className="w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center font-bold shrink-0 text-text shadow-sm">1</span>
                    <p className="leading-relaxed"><strong>Nuevos Turnos:</strong> Aparecerán al instante en la pestaña Turnos.</p>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center font-bold shrink-0 text-text shadow-sm">2</span>
                    <p className="leading-relaxed"><strong>Editor de Precios:</strong> Cambiá los precios en la pestaña Servicios y se reflejará en tu web.</p>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center font-bold shrink-0 text-text shadow-sm">3</span>
                    <p className="leading-relaxed"><strong>Días y Horarios:</strong> Los días que desmarques aquí aparecerán "apagados" y bloqueados automáticamente para los clientes en tu web.</p>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center font-bold shrink-0 text-text shadow-sm">4</span>
                    <p className="leading-relaxed"><strong>Compartir Link:</strong> Copiá el enlace de tu web en tu perfil de Instagram para que reserven solos las 24hs.</p>
                  </li>
                  <li className="flex gap-4">
                    <span className="w-7 h-7 rounded-full bg-background border border-border flex items-center justify-center font-bold shrink-0 text-text shadow-sm">5</span>
                    <p className="leading-relaxed"><strong>Diseño de Marca:</strong> Personalizá los colores y bordes para adaptarlo a la estética de tu negocio.</p>
                  </li>
                </ul>
              </div>
              {/* Support Card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3 mb-3 text-green-500">
                <Info size={24} />
                <h3 className="font-bold text-lg text-text">Soporte Técnico</h3>
              </div>
              <p className="text-sm text-text-muted mb-5 leading-relaxed">
                ¿Tuviste un problema con el sistema o querés sugerir algo? Comunicate con nuestro equipo por WhatsApp.
              </p>
              <a 
                href="https://wa.me/5493426109215" 
                target="_blank" 
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-300 shadow-[0_4px_14px_0_rgba(37,211,102,0.3)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.4)] hover:-translate-y-1"
              >
                <MessageCircle size={20} />
                WhatsApp Soporte
              </a>
            </div>
          </div>
          </div>
        </motion.div>
      );
    }

    return (
      <motion.div 
        key="turnos"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <motion.div 
              whileHover={{ y: -4, scale: 1.01 }}
              key={idx} 
              className="group bg-card border border-border p-6 rounded-2xl flex items-center gap-5 shadow-sm hover:shadow-lg transition-all duration-300 cursor-default"
            >
              <div className="p-4 bg-primary/10 rounded-2xl text-primary group-hover:scale-110 transition-transform duration-300">
                <stat.icon size={26} />
              </div>
              <div>
                <p className="text-sm text-text-muted font-medium mb-1">{stat.label}</p>
                <p className="text-3xl font-bold transition-colors">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Activity Chart */}
        <div className="bg-card border border-border p-6 rounded-2xl mb-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold">Actividad de Turnos (Últimos 7 días)</h2>
            <p className="text-sm text-text-muted">Cantidad de turnos generados por día</p>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  allowDecimals={false}
                />
                <RechartsTooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                />
                <Bar 
                  dataKey="Turnos" 
                  fill="var(--color-primary)" 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={40}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-bold">Gestión de Turnos</h2>
            <div className="text-xs font-semibold text-text-muted uppercase tracking-widest px-3 py-1 bg-background rounded-full border border-border">
              {turnos.length} Totales
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-background/50 border-b border-border text-sm text-text-muted uppercase tracking-wider">
                  <th className="p-4 font-semibold">Cliente</th>
                  <th className="p-4 font-semibold">Servicio</th>
                  <th className="p-4 font-semibold">Fecha y Hora</th>
                  <th className="p-4 font-semibold">Estado</th>
                  <th className="p-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <motion.tbody layout className="divide-y divide-border">
                <AnimatePresence>
                  {turnos.length === 0 && (
                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <td colSpan={5} className="p-12 text-center text-text-muted">
                        No hay turnos registrados en el sistema.
                      </td>
                    </motion.tr>
                  )}
                  {turnos.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()).map(turno => {
                    const service = servicios.find(s => s.id === turno.serviceId);
                    return (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                        key={turno.id} 
                        className={`hover:bg-primary/5 transition-colors duration-200 ${turno.status === 'cancelado' ? 'opacity-60 grayscale' : ''}`}
                      >
                        <td className="p-4">
                          <p className="font-semibold">{turno.clientName}</p>
                          <p className="text-xs text-text-muted">{turno.clientEmail}</p>
                        </td>
                        <td className="p-4">
                          <span className="font-medium text-sm">{service?.name || 'Servicio Eliminado'}</span>
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-sm">{format(turno.datetime, "d MMM, yyyy", { locale: es })}</p>
                          <p className="text-xs text-text-muted">{format(turno.datetime, "HH:mm")} hs</p>
                        </td>
                        <td className="p-4">
                          {renderStatus(turno.status)}
                        </td>
                        <td className="p-4 text-right">
                          <motion.button 
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setTurnoToDelete(turno.id)}
                            className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                            title="Eliminar registro"
                          >
                            <Trash2 size={18} />
                          </motion.button>
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </motion.tbody>
            </table>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      <AnimatePresence>
        {isLoggingOut && (
          <AppLoader message="Cerrando sesión..." />
        )}
      </AnimatePresence>

      <div className="h-screen overflow-hidden bg-background flex flex-col md:flex-row text-text relative">
        {/* Ambient Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]"></div>
        </div>

        {/* Sidebar - Fixed Height */}
        <aside className="w-full md:w-64 bg-card border-b md:border-b-0 md:border-r border-border flex flex-col shrink-0 z-20 relative shadow-sm md:shadow-none">
          <div className="p-6 flex items-center gap-3 border-b border-border/50 md:border-none">
            {currentTenant.logoUrl ? (
              <img src={currentTenant.logoUrl} alt="Logo" className="w-10 h-10 rounded-full border border-border object-cover shadow-sm" />
            ) : (
              <div className="w-10 h-10 rounded-full border border-border bg-primary/10 flex items-center justify-center text-sm font-bold text-primary shadow-sm">
                {currentTenant.name.charAt(0)}
              </div>
            )}
            <span className="font-bold text-lg hidden md:block tracking-tight">Panel Admin</span>
          </div>
          
          <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto hidden md:block">
            <button 
              onClick={() => setActiveTab('turnos')}
              className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm
                ${activeTab === 'turnos' ? 'bg-primary text-primary-foreground shadow-md' : 'text-text hover:bg-primary/10 hover:text-primary hover:translate-x-1'}`}
            >
              <Calendar size={18} className={activeTab === 'turnos' ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} /> Turnos
            </button>
            <button 
              onClick={() => setActiveTab('clientes')}
              className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm
                ${activeTab === 'clientes' ? 'bg-primary text-primary-foreground shadow-md' : 'text-text hover:bg-primary/10 hover:text-primary hover:translate-x-1'}`}
            >
              <Users size={18} className={activeTab === 'clientes' ? '' : 'group-hover:scale-110 transition-transform'} /> Clientes
            </button>
            <button 
              onClick={() => setActiveTab('servicios')}
              className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm
                ${activeTab === 'servicios' ? 'bg-primary text-primary-foreground shadow-md' : 'text-text hover:bg-primary/10 hover:text-primary hover:translate-x-1'}`}
            >
              <AlertCircle size={18} className={activeTab === 'servicios' ? '' : 'group-hover:scale-110 transition-transform'} /> Servicios
            </button>
            <button 
              onClick={() => setActiveTab('ajustes')}
              className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm
                ${activeTab === 'ajustes' ? 'bg-primary text-primary-foreground shadow-md' : 'text-text hover:bg-primary/10 hover:text-primary hover:translate-x-1'}`}
            >
              <Settings size={18} className={activeTab === 'ajustes' ? 'animate-[spin_4s_linear_infinite]' : 'group-hover:rotate-90 transition-transform'} /> Ajustes
            </button>
          </nav>
          
          {/* Mobile Navigation */}
          <nav className="flex md:hidden p-2 gap-2 overflow-x-auto hide-scrollbar border-b border-border/50">
            <button onClick={() => setActiveTab('turnos')} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === 'turnos' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-text'}`}>Turnos</button>
            <button onClick={() => setActiveTab('clientes')} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === 'clientes' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-text'}`}>Clientes</button>
            <button onClick={() => setActiveTab('servicios')} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === 'servicios' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-text'}`}>Servicios</button>
            <button onClick={() => setActiveTab('ajustes')} className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${activeTab === 'ajustes' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-text'}`}>Ajustes</button>
          </nav>

          <div className="p-4 hidden md:block border-t border-border/50">
            <button 
              onClick={handleLogout}
              className="group w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-500 hover:text-white hover:shadow-md rounded-xl transition-all duration-300 font-medium text-sm"
            >
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> Cerrar Sesión
            </button>
          </div>
        </aside>

        {/* Main Content - Independent Scroll */}
        <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-background">
          
          {/* Header - Fixed */}
          <header className="h-20 shrink-0 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between px-6 md:px-8 z-10">
            <div>
              <h1 className="font-bold text-lg md:text-xl capitalize tracking-tight">
                {format(currentTime, "EEEE, d 'de' MMMM", { locale: es })}
              </h1>
              <p className="text-xs md:text-sm font-medium text-primary flex items-center gap-1.5 mt-0.5">
                <Clock size={14} className="animate-pulse" /> {format(currentTime, "HH:mm:ss")}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="w-10 h-10 bg-card border border-border hover:bg-border transition-colors rounded-full flex items-center justify-center text-text-muted hover:text-text cursor-pointer"
                title="Cambiar tema"
              >
                {appTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-10 h-10 bg-primary/20 hover:bg-primary/30 transition-colors rounded-full flex items-center justify-center text-primary font-bold cursor-pointer"
              >
                AD
              </motion.div>
            </div>
          </header>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
              <AnimatePresence mode="wait">
                {renderTabContent()}
              </AnimatePresence>
            </div>
          </div>

        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {turnoToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-2xl p-6 shadow-xl max-w-sm w-full"
            >
              <h3 className="text-xl font-bold mb-2">¿Desea eliminar este turno?</h3>
              <p className="text-text-muted text-sm mb-6">Esta acción no se puede deshacer y el turno desaparecerá de tu agenda.</p>
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setTurnoToDelete(null)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-border hover:bg-background transition-colors"
                >
                  No, cancelar
                </button>
                <button 
                  onClick={() => {
                    eliminarTurno(turnoToDelete);
                    setTurnoToDelete(null);
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  Sí, eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Client Confirmation Modal */}
      <AnimatePresence>
        {clienteToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-2xl p-6 shadow-xl max-w-sm w-full"
            >
              <h3 className="text-xl font-bold mb-2 text-red-500">¿Eliminar Cliente?</h3>
              <p className="text-text-muted text-sm mb-6">Esta acción borrará al cliente de tu base de datos y también <strong>eliminará todos sus turnos asociados</strong>. Esta acción no se puede deshacer.</p>
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setClienteToDelete(null)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-border hover:bg-background transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    eliminarCliente(clienteToDelete);
                    setClienteToDelete(null);
                  }}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors"
                >
                  Sí, eliminar cliente
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
