import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';

export const AppLoader = ({ message = "Preparando tu panel de control..." }: { message?: string }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/90 backdrop-blur-md"
    >
      <div className="w-full max-w-md px-8 flex flex-col items-center justify-center">
        
        {/* Bouncing Generic Icon */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="mb-6 text-primary relative"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Calendar className="w-8 h-8" />
          </div>
        </motion.div>

        {/* Minimalist Loading Bar */}
        <div className="w-48 h-1.5 rounded-full overflow-hidden relative bg-card mb-6 border border-border shadow-inner">
          <motion.div 
            className="absolute top-0 bottom-0 left-0 bg-primary rounded-full"
            animate={{ width: ["0%", "100%", "100%"], x: ["0%", "0%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        <motion.p 
          className="text-sm font-bold text-text-muted tracking-wide"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {message}
        </motion.p>
      </div>
    </motion.div>
  );
};
