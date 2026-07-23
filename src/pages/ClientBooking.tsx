import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, CheckCircle2, User, Mail, ChevronDown, ChevronLeft, ChevronRight, AlertCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { format, isSameDay, startOfToday, addMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isBefore, set } from 'date-fns';
import { es } from 'date-fns/locale';

interface Service {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
}

export const ClientBooking = () => {
  const { tenantId: slug } = useParams();

  // --- STATE ---
  const [isLoading, setIsLoading] = useState(true);
  const [tenantInfo, setTenantInfo] = useState<any>(null);
  const [servicios, setServicios] = useState<Service[]>([]);
  const [occupiedTimes, setOccupiedTimes] = useState<string[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [formData, setFormData] = useState({ name: '', lastName: '', email: '' });
  
  const [isServiceDropdownOpen, setServiceDropdownOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(startOfToday()));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const [bookedTurnoId, setBookedTurnoId] = useState<string | null>(null);
  const [isCancelled, setIsCancelled] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/tenants/${slug}`);
        if (!res.ok) {
          setAlertMessage('Negocio no encontrado');
          setIsLoading(false);
          return;
        }
        const data = await res.json();
        setTenantInfo(data);
        setServicios(data.services);
        
        // Inject Theme
        const root = document.documentElement;
        root.style.setProperty('--color-primary', data.primaryColor);
        root.style.setProperty('--radius-global', data.borderRadius);

        const resSlots = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/tenants/${slug}/appointments`);
        if (resSlots.ok) {
          const slotsData = await resSlots.json();
          // Store all occupied times for easy lookup later
          setOccupiedTimes(slotsData.map((s: any) => new Date(s.datetime).toISOString()));
          
          // Check for existing active session & appointment in localStorage
          const savedClient = localStorage.getItem(`turnera_client_${data.id}`);
          if (savedClient) {
            const parsedClient = JSON.parse(savedClient);
            setFormData(parsedClient);
            setIsLoggedIn(true);
          }

          const savedAppt = localStorage.getItem(`turnera_appt_${data.id}`);
          if (savedAppt) {
            const appt = JSON.parse(savedAppt);
            if (new Date(appt.datetime) > new Date()) {
              setBookedTurnoId(appt.id);
            } else {
              localStorage.removeItem(`turnera_appt_${data.id}`);
            }
          }
        }
      } catch (err) {
        console.error(err);
        setAlertMessage('Error conectando al servidor');
      } finally {
        setIsLoading(false);
      }
    };
    if (slug) fetchData();

    return () => {
      const root = document.documentElement;
      root.style.removeProperty('--color-primary');
      root.style.removeProperty('--radius-global');
    };
  }, [slug]);

  // --- DYNAMIC OCCUPIED TIMES ---
  const getOccupiedTimesForDate = (date: Date) => {
    return occupiedTimes
      .map(iso => new Date(iso))
      .filter(d => isSameDay(d, date))
      .map(d => format(d, 'HH:mm'));
  };
  const currentOccupiedTimes = selectedDate ? getOccupiedTimesForDate(selectedDate) : [];

  // --- CALENDAR LOGIC ---
  const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const prevMonth = () => setCurrentMonth(addMonths(currentMonth, -1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const generateTimeSlots = () => {
    if (!selectedDate || !tenantInfo) return [];
    const slots = [];
    let [hour, minute] = tenantInfo.workingStart.split(':').map(Number);
    const [endHour, endMinute] = tenantInfo.workingEnd.split(':').map(Number);
    
    while (hour < endHour || (hour === endHour && minute < endMinute)) {
      slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      minute += 30;
      if (minute >= 60) {
        hour += 1;
        minute -= 60;
      }
    }
    
    // Filter past times if selected date is today
    if (isSameDay(selectedDate, new Date())) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      return slots.filter(time => {
        const [slotHour, slotMinute] = time.split(':').map(Number);
        if (slotHour > currentHour) return true;
        if (slotHour === currentHour && slotMinute > currentMinute) return true;
        return false;
      });
    }

    return slots;
  };
  const timeSlots = generateTimeSlots();

  // --- HANDLERS ---
  const isValidEmail = (email: string) => {
    // Strict Regex for standard email formats
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.lastName && formData.email) {
      if (!isValidEmail(formData.email)) {
        setAlertMessage('Por favor, ingresá un correo electrónico válido (ej. nombre@gmail.com)');
        setTimeout(() => setAlertMessage(null), 4000);
        return;
      }
      setIsLoggedIn(true);
    }
  };

  const handleDateSelect = (day: Date) => {
    if (isBefore(day, startOfToday())) return;
    if (!tenantInfo?.workingDays.includes(day.getDay())) return;

    setSelectedDate(day);
    setSelectedTime(null);
    setAlertMessage(null);
  };

  const handleTimeSelect = (time: string) => {
    if (currentOccupiedTimes.includes(time)) {
      setAlertMessage('Turno ocupado. Por favor, selecciona otro.');
      setTimeout(() => setAlertMessage(null), 3000);
      return;
    }
    setSelectedTime(time);
    setAlertMessage(null);
  };

  const handleBooking = async () => {
    if (selectedService && selectedDate && selectedTime && tenantInfo) {
      setIsBooking(true);
      const [hour, minute] = selectedTime.split(':').map(Number);
      const exactDatetime = set(selectedDate, { hours: hour, minutes: minute });
      
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/appointments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenantId: tenantInfo.id,
            serviceId: selectedService.id,
            clientName: `${formData.name} ${formData.lastName}`,
            clientEmail: formData.email,
            datetime: exactDatetime.toISOString()
          })
        });

        if (!res.ok) {
          const err = await res.json();
          setAlertMessage(err.error || 'Error al reservar. Puede que el turno ya esté ocupado.');
          setTimeout(() => setAlertMessage(null), 3000);
          return;
        }

        const newTurno = await res.json();
        setBookedTurnoId(newTurno.id);
        
        // Save to localStorage
        localStorage.setItem(`turnera_client_${tenantInfo.id}`, JSON.stringify(formData));
        localStorage.setItem(`turnera_appt_${tenantInfo.id}`, JSON.stringify({
          id: newTurno.id,
          datetime: exactDatetime.toISOString()
        }));

        setOccupiedTimes(prev => [...prev, newTurno.datetime]);
      } catch (e) {
        setAlertMessage('Error conectando al servidor.');
      } finally {
        setIsBooking(false);
      }
    }
  };

  const handleCancelTurno = async () => {
    if (!bookedTurnoId || !tenantInfo) return;
    setIsCancelling(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/appointments/client-cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: bookedTurnoId,
          clientEmail: formData.email
        })
      });
      if (res.ok) {
        localStorage.removeItem(`turnera_appt_${tenantInfo.id}`);
        setBookedTurnoId(null);
        setSelectedService(null);
        setSelectedDate(null);
        setSelectedTime(null);
        setAlertMessage('Turno cancelado correctamente.');
        setTimeout(() => setAlertMessage(null), 4000);
      } else {
        setAlertMessage('Error al cancelar el turno.');
      }
    } catch (e) {
      setAlertMessage('Error de conexión.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCancelBooking = () => {
    if (bookedTurnoId) {
      // In a real app we'd call an API. Here we just show success UI
      setIsCancelled(true);
    }
  };

  const getDayNames = () => {
    if (!tenantInfo || tenantInfo.workingDays.length === 0) return 'Cerrado temporalmente';
    if (tenantInfo.workingDays.length === 7) return 'Lunes a Domingo';

    // Better approximation:
    return `Días hábiles`;
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>;
  }

  if (!tenantInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 text-center flex-col gap-4">
        <XCircle className="text-red-500 w-16 h-16" />
        <h1 className="text-2xl font-bold text-text">Página no encontrada</h1>
        <p className="text-text-muted">{alertMessage}</p>
      </div>
    );
  }

  // --- RENDER SCREEN 1: LOGIN ---
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center text-center mb-8">
            {tenantInfo.logoUrl ? (
              <img src={tenantInfo.logoUrl} alt="Logo" className="w-24 h-24 rounded-full border border-border shadow-sm mb-5 bg-card object-cover" />
            ) : (
              <div className="w-24 h-24 rounded-full border border-border shadow-sm mb-5 bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary">
                {tenantInfo.name.charAt(0)}
              </div>
            )}
            <h1 className="text-3xl font-semibold tracking-tight text-text mb-2">{tenantInfo.name}</h1>
            <p className="text-text-muted text-sm mb-4">{tenantInfo.description}</p>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-semibold">
              <Clock size={14} /> 
              Abierto de {getDayNames()}, {tenantInfo.workingStart} a {tenantInfo.workingEnd}
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input 
                  required
                  type="email" 
                  placeholder="Tu correo electrónico"
                  className="w-full bg-card border border-border rounded-xl pl-12 pr-4 py-3.5 text-sm text-text focus:outline-none focus:border-primary transition-all"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                <input 
                  required
                  type="text" 
                  placeholder="Nombre"
                  className="w-full bg-card border border-border rounded-xl pl-12 pr-4 py-3.5 text-sm text-text focus:outline-none focus:border-primary transition-all"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <input 
                required
                type="text" 
                placeholder="Apellido"
                className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-sm text-text focus:outline-none focus:border-primary transition-all"
                value={formData.lastName}
                onChange={e => setFormData({...formData, lastName: e.target.value})}
              />
            </div>
            <button 
              type="submit"
              className="w-full mt-4 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold py-3.5 px-6 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(var(--color-primary),0.2)] hover:shadow-[0_6px_20px_rgba(var(--color-primary),0.23)] hover:-translate-y-0.5"
              style={{ color: '#fff' }}
            >
              Comenzar a reservar
            </button>
            {alertMessage && (
              <div className="mt-4 p-3 bg-red-500/10 text-red-500 text-xs font-medium rounded-lg flex items-center justify-center gap-2">
                <AlertCircle size={14} /> {alertMessage}
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }

  // --- RENDER SCREEN 3: SUCCESS OR CANCELLED ---
  if (bookedTurnoId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
         <div className="text-center p-8 bg-card border border-border rounded-3xl shadow-sm max-w-sm w-full">
            {isCancelled ? (
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle size={32} className="text-red-500" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
            )}
            
            <h2 className="text-2xl font-semibold mb-3">
              {isCancelled ? 'Turno Cancelado' : 'Turno Confirmado'}
            </h2>
            
            {!isCancelled && (
              <p className="text-text-muted mb-8 text-lg">
                Te enviamos un correo con los detalles. ¡Te esperamos!
              </p>
            )}
            
            <div className={`p-5 rounded-2xl border text-left mb-8 ${isCancelled ? 'bg-background/50 border-border/50 opacity-60' : 'bg-background border-border'}`}>
              <p className="font-semibold text-lg mb-1">{selectedService?.name}</p>
              <p className="text-text text-sm">
                {selectedDate && format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
              </p>
              <p className="text-text text-sm mb-3">
                {selectedTime} hs
              </p>
              <div className="flex items-start gap-2 pt-3 border-t border-border text-text-muted text-sm">
                <MapPin size={16} className="shrink-0 mt-0.5" />
                <span>{tenantInfo.name}</span>
              </div>
            </div>
            
            {!isCancelled && (
              <button 
                onClick={handleCancelTurno}
                disabled={isCancelling}
                className="w-full bg-red-50 text-red-600 hover:bg-red-100 font-semibold py-3 px-6 rounded-xl transition-all shadow-sm flex justify-center items-center gap-2"
              >
                {isCancelling ? <Loader2 size={18} className="animate-spin" /> : 'Cancelar Turno'}
              </button>
            )}

            {isCancelled && (
              <button 
                onClick={() => { setBookedTurnoId(null); setIsCancelled(false); setSelectedTime(null); }}
                className="w-full py-3 bg-primary/10 text-primary font-semibold rounded-xl hover:bg-primary/20 transition-colors"
              >
                Volver a reservar
              </button>
            )}
          </div>
      </div>
    );
  }

  // --- RENDER SCREEN 2: ALL-IN-ONE TWO-COLUMN LAYOUT ---
  return (
    <div className="min-h-screen bg-background text-text p-4 md:p-8 flex justify-center items-start">
      <div className="w-full max-w-5xl bg-card border border-border rounded-[2rem] shadow-sm overflow-hidden flex flex-col md:flex-row">
        
        {/* LEFT COLUMN: User Info & Services */}
        <div className="w-full md:w-[40%] p-6 md:p-10 border-b md:border-b-0 md:border-r border-border flex flex-col bg-background/30">
          <div className="flex items-center gap-4 mb-6">
            {tenantInfo.logoUrl ? (
              <img src={tenantInfo.logoUrl} alt="Logo" className="w-12 h-12 rounded-full border border-border object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-full border border-border bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                {tenantInfo.name.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-xs text-text-muted font-medium uppercase tracking-widest">Reserva para</p>
              <h2 className="font-semibold text-lg">{formData.name} {formData.lastName}</h2>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-xl text-xs font-semibold mb-8 w-max">
            <Clock size={14} /> 
            {getDayNames()}, {tenantInfo.workingStart} a {tenantInfo.workingEnd}
          </div>

          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3">Selecciona el servicio</h3>
          
          <div className="relative mb-6">
            <button 
              onClick={() => setServiceDropdownOpen(!isServiceDropdownOpen)}
              className="w-full bg-card border border-border rounded-xl p-4 flex items-center justify-between text-left hover:border-primary/50 transition-colors"
            >
              {selectedService ? (
                <div>
                  <p className="font-semibold">{selectedService.name}</p>
                  <p className="text-xs text-text-muted font-medium mt-0.5">${selectedService.price}</p>
                </div>
              ) : (
                <span className="text-text-muted font-medium">Elige tu servicio...</span>
              )}
              <ChevronDown size={20} className={`text-text-muted transition-transform ${isServiceDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isServiceDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-lg z-20 max-h-80 overflow-y-auto hide-scrollbar">
                <div className="p-2 space-y-1">
                  {servicios.map(service => (
                    <button
                      key={service.id}
                      onClick={() => { setSelectedService(service); setServiceDropdownOpen(false); }}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors text-sm
                        ${selectedService?.id === service.id ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-background/80 text-text'}`}
                    >
                      <span>{service.name}</span>
                      <span className="font-medium">${service.price}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {selectedService && (
            <div className="mt-auto p-5 bg-card border border-border rounded-xl">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-2 font-semibold">Resumen</p>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-sm">Servicio</span>
                <span className="font-semibold text-sm">{selectedService.name}</span>
              </div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-sm">Duración</span>
                <span className="text-sm text-text-muted">{selectedService.durationMinutes} min</span>
              </div>
              <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
                <span className="font-semibold">Total a pagar</span>
                <span className="font-bold text-lg text-primary">${selectedService.price}</span>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Calendar & Time */}
        <div className={`w-full md:w-[60%] p-6 md:p-10 flex flex-col transition-opacity duration-500 ${!selectedService ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
          <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">Fecha y Hora</h3>
          
          <div className="flex flex-col xl:flex-row gap-8">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold capitalize">{format(currentMonth, 'MMMM yyyy', { locale: es })}</h4>
                <div className="flex gap-2">
                  <button onClick={prevMonth} className="p-1.5 rounded-md hover:bg-background/80 text-text-muted hover:text-text transition-colors">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={nextMonth} className="p-1.5 rounded-md hover:bg-background/80 text-text-muted hover:text-text transition-colors">
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {daysOfWeek.map(day => (
                  <div key={day} className="text-[10px] font-bold text-text-muted uppercase tracking-wider py-1">{day}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day) => {
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isPast = isBefore(day, startOfToday());
                  const isWorkingDay = tenantInfo.workingDays.includes(day.getDay());
                  const isSelectable = isCurrentMonth && !isPast && isWorkingDay;
                  const isSelected = selectedDate && isSameDay(day, selectedDate);

                  return (
                    <button
                      key={day.toString()}
                      disabled={!isSelectable}
                      onClick={() => handleDateSelect(day)}
                      className={`
                        aspect-square rounded-full flex items-center justify-center text-sm transition-all
                        ${!isCurrentMonth ? 'opacity-0 pointer-events-none' : ''}
                        ${!isSelectable && isCurrentMonth ? 'text-text-muted/30 cursor-not-allowed' : ''}
                        ${isSelectable && !isSelected ? 'hover:bg-primary/10 hover:text-primary font-medium' : ''}
                        ${isSelected ? 'bg-primary text-white font-bold shadow-md' : ''}
                      `}
                      style={isSelected ? { color: '#fff' } : {}}
                    >
                      {format(day, 'd')}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={`flex-1 flex flex-col transition-all duration-300 ${!selectedDate ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              <h4 className="font-semibold mb-4 text-center xl:text-left">
                {selectedDate ? format(selectedDate, "d 'de' MMMM", { locale: es }) : 'Horarios'}
              </h4>
              
              <div className="flex flex-wrap gap-2 justify-center xl:justify-start overflow-y-auto max-h-64 hide-scrollbar">
                {timeSlots.map(time => {
                  const isOccupied = occupiedTimes.includes(time);
                  const isSelected = selectedTime === time;
                  
                  return (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      className={`
                        px-4 py-2 rounded-full text-sm font-medium transition-all border
                        ${isSelected ? 'bg-primary border-primary text-white shadow-sm' : ''}
                        ${isOccupied ? 'border-transparent text-text-muted/40 line-through bg-background/50 cursor-not-allowed' : ''}
                        ${!isSelected && !isOccupied ? 'border-border bg-card hover:border-primary/50 text-text' : ''}
                      `}
                      style={isSelected ? { color: '#fff' } : {}}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>

              {alertMessage && (
                <div className="mt-4 p-3 bg-red-500/10 text-red-500 text-xs font-medium rounded-lg flex items-center gap-2">
                  <AlertCircle size={14} /> {alertMessage}
                </div>
              )}
            </div>
          </div>

          <div className="mt-10 flex justify-end">
            <button 
              disabled={!selectedService || !selectedDate || !selectedTime || isBooking}
              onClick={handleBooking}
              className={`
                py-3 px-8 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2
                ${(selectedService && selectedDate && selectedTime && !isBooking)
                  ? 'bg-primary text-white hover:bg-primary-hover hover:shadow-md hover:-translate-y-0.5' 
                  : 'bg-background text-text-muted cursor-not-allowed'}
              `}
              style={(selectedService && selectedDate && selectedTime && !isBooking) ? { color: '#fff' } : {}}
            >
              {isBooking ? (
                <><Loader2 size={18} className="animate-spin" /> Procesando...</>
              ) : (
                'Confirmar Turno'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
