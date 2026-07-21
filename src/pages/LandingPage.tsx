import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Smartphone, Zap, Link as LinkIcon, CheckCircle2, ChevronRight, Star, MessageCircle, Mail, X, ChevronDown, Scissors, Stethoscope, Heart, Activity, Dumbbell, Briefcase, Sun, Moon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTurnosContext } from '../context/TurnosContext';

const faqs = [
  { q: '¿Tengo límite de clientes o turnos por mes?', a: 'Para nada. El sistema es completamente ilimitado. Podés tener 10 o 10.000 turnos mensuales y el sistema va a funcionar igual de rápido, sin cobrarte ningún extra ni comisión por turno.' },
  { q: '¿Qué pasa si mis precios cambian la semana que viene?', a: '¡Lo modificás vos mismo! Desde tu panel de control en el celular podés editar los precios, agregar nuevos servicios o borrar los viejos en cuestión de segundos.' },
  { q: '¿Tengo que instalar alguna aplicación pesada?', a: 'No, TurneraApp funciona 100% en la nube (desde el navegador web). Ni vos ni tus clientes tienen que descargar absolutamente nada en sus teléfonos.' },
  { q: '¿Mis clientes ven la información de otros peluqueros?', a: 'No. Tu enlace es exclusivo y privado para tu negocio. Tus clientes solo van a ver tu logo, tus horarios y tus servicios.' },
  { q: '¿Qué pasa si decido cancelar el mantenimiento mensual?', a: 'Podés cancelar cuando quieras. En ese caso, el sistema público de turnos se inhabilita temporalmente y tus clientes ya no podrán reservar hasta que retomes el servicio. Sin vueltas ni contratos forzosos.' }
];

function FAQItem({ faq }: { faq: {q: string, a: string} }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-border bg-card shadow-sm rounded-2xl overflow-hidden transition-all duration-300 hover:border-primary/30">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
      >
        <h4 className="text-lg font-bold pr-4">{faq.q}</h4>
        <div className={`text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown size={24} />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-6 pt-0 text-text-muted leading-relaxed">
              <div className="w-full h-px bg-card shadow-md mb-6"></div>
              {faq.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export const LandingPage = () => {
  const navigate = useNavigate();
  const { appTheme, toggleTheme } = useTurnosContext();
  const [activeModal, setActiveModal] = useState<'terms' | 'privacy' | null>(null);

  const hasSession = !!localStorage.getItem('turneraapp_token');
  const [showDemoModal, setShowDemoModal] = useState(false);

  // Guarantee that Landing Page always uses default styles from index.css
  // If the user navigates back from AdminDashboard or ClientBooking, it cleans up injected variables.
  useEffect(() => {
    document.documentElement.style.removeProperty('--color-primary');
    document.documentElement.style.removeProperty('--radius-global');
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden selection:bg-primary/30 relative">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight italic pr-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-hover">
              TurneraApp
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(hasSession ? '/dashboard' : '/login')}
              className="text-sm font-medium text-text-muted hover:text-text transition-colors hidden sm:block"
            >
              {hasSession ? 'Entrar al Panel' : 'Iniciar Sesión'}
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-card shadow-md border border-border text-text-muted hover:text-text transition-all backdrop-blur-sm"
              title="Cambiar tema"
            >
              {appTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <a 
              href="https://wa.me/5493426109215" 
              target="_blank"
              rel="noreferrer"
              className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              Adquirir Sistema
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card shadow-md border border-border text-sm font-medium text-primary mb-8 backdrop-blur-sm">
              <Star size={16} />
              <span>El software #1 para profesionales</span>
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1]">
              Gestioná tus turnos como un <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-500">profesional</span>
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-lg md:text-xl text-text-muted mb-10 max-w-2xl mx-auto leading-relaxed">
              Olvidate de los mensajes a deshora. Dale a tus clientes un enlace exclusivo para reservar las 24hs, y controlá tu negocio desde tu celular.
            </motion.p>
            
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a 
                href="https://wa.me/5493426109215" 
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-full text-lg font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                Comenzar Ahora
                <ChevronRight size={20} />
              </a>
              <button 
                onClick={() => setShowDemoModal(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-card shadow-md hover:bg-border border border-border px-8 py-4 rounded-full text-lg font-medium transition-all backdrop-blur-sm"
              >
                Ver Demo Cliente
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="py-24 border-y border-border relative bg-primary/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Empezá a usarlo en 3 simples pasos</h2>
            <p className="text-text-muted text-lg">Configurar tu propio sistema de turnos nunca fue tan fácil y rápido.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 md:gap-8 relative z-0">
            {/* Connecting Lines for desktop */}
            <div className="hidden md:block absolute top-12 left-[calc(16.66%+3rem)] w-[calc(33.33%-6rem)] h-[2px] bg-gradient-to-r from-transparent to-primary/50 -z-10"></div>
            <div className="hidden md:block absolute top-12 left-[calc(50%+3rem)] w-[calc(33.33%-6rem)] h-[2px] bg-gradient-to-r from-primary/50 to-transparent -z-10"></div>
            
            {[
              { step: '1', title: 'Adquirís tu Licencia', desc: 'Te contactás por WhatsApp, confirmamos tus datos y te damos acceso inmediato a tu panel privado de administración.' },
              { step: '2', title: 'Configurás tus Horarios', desc: 'Cargás tus servicios, tus precios y los días y horarios que trabajás directamente desde tu celular en 5 minutos.' },
              { step: '3', title: 'Compartís tu Enlace', desc: 'Pegás tu link único en tu perfil de Instagram o WhatsApp. ¡Listo! Tus clientes entran y reservan solos.' }
            ].map((item, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="flex flex-col items-center text-center relative"
              >
                <div className="w-24 h-24 rounded-full bg-card border border-primary/30 flex items-center justify-center text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-primary to-primary-hover mb-8 shadow-md relative overflow-hidden z-10">
                  <span className="relative z-10">{item.step}</span>
                  <div className="absolute inset-0 bg-primary/5 rounded-full"></div>
                </div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-text-muted leading-relaxed max-w-[280px]">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 border-b border-border relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Todo lo que necesitás para crecer</h2>
            <p className="text-text-muted text-lg">Diseñado específicamente para que ahorres tiempo y ganes más clientes.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-card shadow-md border border-border rounded-3xl p-8 hover:border-primary/30 transition-colors group relative overflow-hidden backdrop-blur-md"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <LinkIcon className="text-primary" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Tu Enlace Propio</h3>
              <p className="text-text-muted leading-relaxed">
                Compartí tu link único en Instagram o WhatsApp. Tus clientes reservan solos, sin preguntarte "qué horarios tenés libres".
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-card shadow-md border border-border rounded-3xl p-8 hover:border-primary/30 transition-colors group relative overflow-hidden backdrop-blur-md"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -z-10 group-hover:bg-primary/10 transition-colors"></div>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Smartphone className="text-primary" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">100% Móvil</h3>
              <p className="text-text-muted leading-relaxed">
                Controlá tus citas, modificá precios y bloqueá horarios directamente desde tu teléfono. Tu negocio en tu bolsillo.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="bg-card shadow-md border border-border rounded-3xl p-8 hover:border-primary/30 transition-colors group relative overflow-hidden backdrop-blur-md"
            >
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="text-primary" size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">Actualización al Instante</h3>
              <p className="text-text-muted leading-relaxed">
                Si un cliente saca un turno, desaparece instantáneamente para el resto. Cero choques de horarios, cero estrés.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Showcase Section */}
      <div className="py-24 relative bg-primary/5 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Mirá cómo funciona por dentro</h2>
            <p className="text-xl text-text-muted max-w-3xl mx-auto">
              Una plataforma diseñada tanto para encantar a tus clientes como para facilitarte la vida a vos.
            </p>
          </div>

          <div className="space-y-32">
            {/* Image 1 */}
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 lg:pr-8">
                <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-6">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">1</div>
                </div>
                <h3 className="text-2xl font-bold mb-4">Tu propia web de reservas</h3>
                <p className="text-lg text-text-muted leading-relaxed">
                  Tus clientes accederán a una página profesional, adaptada a celulares, donde podrán elegir el servicio y el horario que mejor les quede en cuestión de segundos.
                </p>
              </div>
              <div className="flex-[1.5] relative">
                <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full"></div>
                <img src="/showcase/imagen-1.png" alt="Vista del cliente" className="relative rounded-2xl shadow-2xl border border-border w-full object-cover" />
              </div>
            </div>

            {/* Image 2 */}
            <div className="flex flex-col-reverse lg:flex-row items-center gap-12">
              <div className="flex-[1.5] relative">
                <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full"></div>
                <img src="/showcase/imagen-2.png" alt="Panel de control de turnos" className="relative rounded-2xl shadow-2xl border border-border w-full object-cover" />
              </div>
              <div className="flex-1 lg:pl-8">
                <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-6">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">2</div>
                </div>
                <h3 className="text-2xl font-bold mb-4">Gestión inteligente de Turnos</h3>
                <p className="text-lg text-text-muted leading-relaxed">
                  Recibí todos los turnos directamente en tu panel de control. Podrás ver los próximos compromisos, confirmarlos, cancelarlos y organizarte sin usar papel.
                </p>
              </div>
            </div>

            {/* Image 3 */}
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="flex-1 lg:pr-8">
                <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-6">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">3</div>
                </div>
                <h3 className="text-2xl font-bold mb-4">Gestión de Servicios y Precios</h3>
                <p className="text-lg text-text-muted leading-relaxed">
                  Agregá, modificá o eliminá los servicios que ofreces de manera súper sencilla. Podés definir el nombre, el precio y la duración de cada uno para que tus clientes sepan exactamente qué elegir.
                </p>
              </div>
              <div className="flex-[1.5] relative">
                <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full"></div>
                <img src="/showcase/imagen-3.png" alt="Base de datos de clientes" className="relative rounded-2xl shadow-2xl border border-border w-full object-cover" />
              </div>
            </div>

            {/* Image 4 */}
            <div className="flex flex-col-reverse lg:flex-row items-center gap-12">
              <div className="flex-[1.5] relative">
                <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full"></div>
                <img src="/showcase/imagen-4.png" alt="Ajustes y personalización" className="relative rounded-2xl shadow-2xl border border-border w-full object-cover" />
              </div>
              <div className="flex-1 lg:pl-8">
                <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-6">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">4</div>
                </div>
                <h3 className="text-2xl font-bold mb-4">Ajustes y Personalización</h3>
                <p className="text-lg text-text-muted leading-relaxed">
                  Adaptá la plataforma a tu marca. Cambiá el color principal, ajustá los estilos de los bordes y definí con exactitud tus días y horarios de atención al público.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Target Audience Section (New) */}
      <div className="py-24 border-b border-border relative bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm mb-6"
            >
              100% ADAPTABLE
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
              No importa tu rubro. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-500">
                Si das turnos, esto es para vos.
              </span>
            </h2>
            <p className="text-text-muted text-xl leading-relaxed">
              Desde salones de belleza hasta consultorios médicos. Olvidate del caos de los mensajes a cualquier hora y automatizá tu agenda hoy mismo.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {[
              { icon: Scissors, name: 'Barberías y Salones' },
              { icon: Stethoscope, name: 'Odontólogos y Médicos' },
              { icon: Heart, name: 'Psicólogos y Terapeutas' },
              { icon: Activity, name: 'Kinesiólogos y Masajes' },
              { icon: Dumbbell, name: 'Entrenadores y Gimnasios' },
              { icon: Briefcase, name: 'Asesores y Consultores' }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card shadow-sm border border-border rounded-3xl p-6 md:p-8 flex flex-col items-center text-center hover:bg-card hover:border-primary/30 transition-all group hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  {/* Minimalist Icon Container */}
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                    <Icon className="text-primary" size={32} strokeWidth={2} />
                  </div>
                  
                  <h3 className="font-bold text-base md:text-lg text-text relative z-10">{item.name}</h3>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-24 relative bg-primary/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Inversión simple y transparente</h2>
            <p className="text-text-muted text-lg">Un único sistema completo con todo lo que necesitás, sin comisiones por turno.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Pricing Card - Left */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-card shadow-md backdrop-blur-md border border-primary/30 rounded-[2rem] p-8 md:p-12 shadow-[0_0_50px_rgba(234,179,8,0.1)] relative"
            >
              <h3 className="text-2xl font-bold mb-2">Servicio "Llave en Mano"</h3>
              <p className="text-text-muted mb-6">Nos encargamos de todo para que no pierdas tiempo.</p>
              
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-500">$125.000</span>
                <span className="text-text-muted">ARS</span>
              </div>
              <p className="text-sm font-medium text-primary mb-6 border-b border-border pb-6">Implementación inicial única</p>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-text">$25.000</span>
                <span className="text-text-muted">ARS / mes</span>
              </div>
              <p className="text-sm text-text-muted mb-8">Mantenimiento, servidores y soporte técnico continuo.</p>

              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-primary" size={20} />
                  <span>Configuración de tus horarios y servicios</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-primary" size={20} />
                  <span>Diseño adaptado a tu logo y marca</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-primary" size={20} />
                  <span>Te lo entregamos 100% listo para usar</span>
                </li>
              </ul>
            </motion.div>

            {/* Explanatory Text - Right */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6 bg-background/50 p-6 rounded-3xl backdrop-blur-sm border border-border"
            >
              <h3 className="text-3xl font-bold">Sin dolores de cabeza técnicos</h3>
              <p className="text-lg text-text-muted leading-relaxed">
                Sabemos que no tenés tiempo para aprender a usar sistemas complejos. Por eso nosotros hacemos todo el trabajo duro por vos.
              </p>
              <p className="text-lg text-text-muted leading-relaxed">
                Nuestra propuesta es directa: Pagás una <strong>implementación inicial única</strong> ($125.000) donde configuramos tu logo, colores, ambiente y servicios a medida, y luego un <strong>mantenimiento mensual fijo</strong> ($25.000) por el servidor y soporte técnico.
              </p>
              <p className="text-lg text-text-muted leading-relaxed">
                Te entregamos el acceso para que empieces a trabajar al instante, pero con la libertad de poder cambiar tus colores o configuraciones en el futuro si así lo deseás.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-24 border-t border-border relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Preguntas Frecuentes</h2>
            <p className="text-text-muted text-lg">Resolvemos tus dudas antes de que tomes la decisión.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <FAQItem faq={faq} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-24 border-y border-border relative bg-primary/5 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl font-bold mb-6">¿Tenés dudas o querés adquirir el sistema?</h2>
          <p className="text-lg text-text-muted mb-10 max-w-2xl mx-auto bg-background/50 p-6 rounded-2xl backdrop-blur-sm border border-border">
            Todas las compras se realizan de forma directa y personalizada. Vas a chatear por WhatsApp directamente conmigo, el creador del sistema. Yo me voy a encargar personalmente de guiarte en el alta de tu cuenta, la configuración inicial y explicarte los métodos de pago. ¡Escribime sin compromiso!
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="https://wa.me/5493426109215?text=Hola,%20me%20interesa%20adquirir%20la%20licencia%20de%20TurneraApp."
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20bd5a] text-text px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <MessageCircle size={24} />
              Contactarme por WhatsApp
            </a>
            <a 
              href="mailto:gonzalez.agustin.it@gmail.com"
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-card shadow-md hover:bg-border border border-border px-8 py-4 rounded-xl text-lg font-medium transition-all backdrop-blur-sm"
            >
              <Mail size={24} />
              Enviar Email
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card py-12 relative z-10 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xl font-bold tracking-tight italic pr-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-500">
              TurneraApp
            </span>

          </div>
          <p className="text-sm text-text-muted text-center">
            © {new Date().getFullYear()} TurneraApp. Todos los derechos reservados.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button onClick={() => setActiveModal('terms')} className="text-text-muted hover:text-text transition-colors text-sm">Términos de servicio</button>
            <button onClick={() => setActiveModal('privacy')} className="text-text-muted hover:text-text transition-colors text-sm">Política de privacidad</button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-xl font-bold">
                  {activeModal === 'terms' ? 'Términos de Servicio' : 'Política de Privacidad'}
                </h3>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="text-text-muted hover:text-text transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto text-text-muted space-y-4 text-left text-sm md:text-base">
                {activeModal === 'terms' ? (
                  <>
                    <p><strong>1. Aceptación de los términos:</strong> Al acceder y utilizar TurneraApp, usted acepta estar sujeto a estos Términos de Servicio. Si no está de acuerdo, le rogamos que no utilice nuestro software.</p>
                    <p><strong>2. Uso del Sistema:</strong> La licencia otorga el derecho de uso del software "as is" (tal cual). Usted es el único responsable de la exactitud de los precios, horarios y servicios cargados en su panel.</p>
                    <p><strong>3. Pagos y Suscripciones:</strong> El pago inicial corresponde a la adquisición de la licencia del sistema. El abono mensual es obligatorio para mantener la cuenta activa, cubrir costos de servidores y acceder al soporte técnico continuo. El incumplimiento del pago mensual puede derivar en la suspensión temporal de la cuenta.</p>
                    <p><strong>4. Cancelación:</strong> Puede cancelar el servicio de mantenimiento mensual en cualquier momento, lo cual inhabilitará el acceso de sus clientes al sistema de reservas en línea. No se realizan reembolsos parciales ni devoluciones de la cuota inicial.</p>
                  </>
                ) : (
                  <>
                    <p><strong>1. Recopilación de datos:</strong> Recopilamos información estrictamente necesaria para el funcionamiento del sistema de reservas, incluyendo correos electrónicos, nombres y teléfonos de sus clientes.</p>
                    <p><strong>2. Uso de la información:</strong> Los datos se utilizan exclusivamente para gestionar sus turnos y enviar recordatorios. No vendemos, alquilamos ni compartimos sus datos con terceros bajo ninguna circunstancia ajena al servicio.</p>
                    <p><strong>3. Seguridad:</strong> Utilizamos estándares de encriptación actuales para proteger las credenciales y bases de datos alojadas en nuestros servidores, garantizando la privacidad de su negocio y sus clientes.</p>
                    <p><strong>4. Derechos del usuario:</strong> Usted tiene derecho a solicitar la exportación o eliminación completa de su base de datos en caso de dar de baja el servicio, comunicándose a través de nuestros canales oficiales.</p>
                  </>
                )}
              </div>
              
              <div className="p-6 border-t border-border bg-background/50 flex justify-end">
                <button 
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-bold transition-colors"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Demo Modal */}
      <AnimatePresence>
        {showDemoModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setShowDemoModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card border border-border w-full max-w-lg rounded-3xl p-6 sm:p-8 relative z-10 shadow-2xl"
            >
              <button 
                onClick={() => setShowDemoModal(false)}
                className="absolute top-4 right-4 p-2 bg-card shadow-md hover:bg-border rounded-full transition-colors text-text-muted hover:text-text"
              >
                <X size={20} />
              </button>
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">Elige el rubro para ver la demo</h3>
                <p className="text-text-muted">Seleccioná una opción para ver cómo luciría tu página de reservas.</p>
              </div>

              <div className="grid gap-4">
                <button 
                  onClick={() => navigate('/demo-peluqueria')}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card shadow-md hover:bg-primary/20 hover:border-primary/50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors">
                    <Scissors size={24} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-lg">Peluquería / Barbería</h4>
                    <p className="text-sm text-text-muted">Turnos para cortes, color y más.</p>
                  </div>
                </button>

                <button 
                  onClick={() => navigate('/demo-kinesiologia')}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card shadow-md hover:bg-teal-500/20 hover:border-teal-500/50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-black transition-colors">
                    <Activity size={24} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-lg">Kinesiología</h4>
                    <p className="text-sm text-text-muted">Sesiones y rehabilitación.</p>
                  </div>
                </button>

                <button 
                  onClick={() => navigate('/demo-odontologia')}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card shadow-md hover:bg-blue-500/20 hover:border-blue-500/50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-black transition-colors">
                    <Stethoscope size={24} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-lg">Odontología</h4>
                    <p className="text-sm text-text-muted">Consultas y tratamientos.</p>
                  </div>
                </button>

                <button 
                  onClick={() => navigate('/demo-estetica')}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card shadow-md hover:bg-pink-500/20 hover:border-pink-500/50 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-pink-500/20 text-pink-500 flex items-center justify-center group-hover:bg-pink-500 group-hover:text-white transition-colors">
                    <Sparkles size={24} />
                  </div>
                  <div className="text-left">
                    <h4 className="font-bold text-lg">Estética</h4>
                    <p className="text-sm text-text-muted">Lifting, uñas y tratamientos.</p>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
