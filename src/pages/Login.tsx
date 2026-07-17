import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTurnosContext } from '../context/TurnosContext';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLoader } from '../components/AppLoader';

export const Login = () => {
  const { login } = useTurnosContext();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setErrorMsg('Su usuario o contraseña es incorrecto.');
        setIsLoading(false);
        return;
      }
      
      setErrorMsg('');
      
      localStorage.setItem('turneraapp_token', data.token);

      setIsTransitioning(true);
      setTimeout(() => {
        login();
        navigate('/dashboard', { replace: true });
      }, 1200);

    } catch (error) {
      alert('Error conectando al servidor.');
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isTransitioning && (
          <AppLoader message="Preparando tu panel de control..." />
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden"
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]"></div>
          <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px]"></div>
        </div>

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
        >
          <div className="flex justify-center mb-4">
            <span className="text-4xl font-bold tracking-tight italic pr-2 text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-200">
              TurneraApp
            </span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-text">
            Bienvenido de nuevo
          </h2>
          <p className="mt-2 text-center text-sm text-text-muted">
            Ingresá a tu panel de administración
          </p>
        </motion.div>

        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
        >
          <div className="bg-card py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-border/50">
            <form className="space-y-6" onSubmit={handleSubmit}>
              
              <div>
                <label className="block text-sm font-medium text-text">
                  Correo Electrónico
                </label>
                <div className="mt-2 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-text-muted" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl bg-background/50 text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                    placeholder="admin@ejemplo.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text">
                  Contraseña
                </label>
                <div className="mt-2 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-text-muted" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl bg-background/50 text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-primary focus:ring-primary border-border rounded bg-background"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-text-muted">
                    Recordarme
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-primary hover:text-primary-hover transition-colors">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </div>

              <AnimatePresence>
                {errorMsg && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl text-sm text-center font-medium"
                  >
                    {errorMsg}
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-primary-foreground bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <span className="relative z-10 flex items-center gap-2">
                        Iniciar Sesión <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                      <div className="absolute inset-0 h-full w-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                    </>
                  )}
                </button>
              </div>
            </form>
            
            <div className="mt-6 text-center text-sm">
              <span className="text-text-muted">¿No tenés cuenta? </span>
              <a 
                href="https://wa.me/5491112345678?text=Hola,%20quiero%20crear%20una%20cuenta%20en%20TurneraApp." 
                target="_blank"
                rel="noreferrer"
                className="font-medium text-primary hover:text-primary-hover transition-colors"
              >
                Contactanos para registrarte
              </a>
            </div>

            <div className="mt-8 pt-6 border-t border-border/50 text-center">
              <p className="text-xs text-text-muted flex items-center justify-center gap-2">
                Powered by <strong className="text-text italic">TurneraApp</strong>
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};
