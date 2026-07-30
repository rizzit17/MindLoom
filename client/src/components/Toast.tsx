import React from 'react';
import { AlertCircle, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ToastMessage {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  details?: string[];
}

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  if (!toast) return null;

  const isError = toast.type === 'error';
  const isWarning = toast.type === 'warning';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.15 }}
        className="fixed top-5 right-5 z-50 max-w-md w-full font-mono"
      >
        <div
          className={`p-4 border-2 bg-surface text-ink font-mono flex flex-col gap-2 ${
            isError
              ? 'border-accent shadow-[6px_6px_0px_var(--accent)]'
              : isWarning
              ? 'border-amber-500 shadow-[6px_6px_0px_#f59e0b]'
              : 'border-accent-secondary shadow-[6px_6px_0px_var(--accent-secondary)]'
          }`}
          style={{ borderRadius: '0px' }}
        >
          <div className="flex items-start justify-between gap-3 border-b border-border pb-2">
            <div className="flex items-center gap-2">
              {isError || isWarning ? (
                <AlertCircle className={`w-5 h-5 flex-shrink-0 ${isError ? 'text-accent' : 'text-amber-500'}`} />
              ) : (
                <Info className="w-5 h-5 text-accent-secondary flex-shrink-0" />
              )}
              <h4 className="font-display font-black text-sm uppercase text-ink tracking-tight">
                [{toast.type.toUpperCase()}] {toast.title}
              </h4>
            </div>
            <button
              onClick={onDismiss}
              className="brutal-btn p-1 text-ink"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {toast.message && <p className="text-xs font-mono leading-relaxed font-medium">{toast.message}</p>}

          {toast.details && toast.details.length > 0 && (
            <div className="mt-1 flex flex-col gap-1 border-t border-border pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent font-mono">
                ITEMIZED_VALIDATION_FAILURES:
              </span>
              <ul className="list-square list-inside text-xs space-y-1 font-mono font-bold">
                {toast.details.map((detail, idx) => (
                  <li key={idx}>» {detail}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
