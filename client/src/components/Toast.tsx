import React, { useEffect } from 'react';
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
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 3500); // Auto-dismiss after 3.5 seconds

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const isError = toast.type === 'error';
  const isWarning = toast.type === 'warning';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.12 }}
        className="fixed top-5 right-5 z-50 max-w-md w-full font-mono"
      >
        <div
          className={`p-4 border-[1.5px] bg-surface text-ink font-mono flex flex-col gap-2 rounded-[4px] ${
            isError
              ? 'border-accent shadow-[3px_3px_0px_var(--accent)]'
              : isWarning
              ? 'border-amber-500 shadow-[3px_3px_0px_#f59e0b]'
              : 'border-accent-secondary shadow-[3px_3px_0px_var(--accent-secondary)]'
          }`}
        >
          <div className="flex items-start justify-between gap-3 border-b border-border pb-2">
            <div className="flex items-center gap-2">
              {isError || isWarning ? (
                <AlertCircle className={`w-4 h-4 flex-shrink-0 ${isError ? 'text-accent' : 'text-amber-500'}`} />
              ) : (
                <Info className="w-4 h-4 text-accent-secondary flex-shrink-0" />
              )}
              <h4 className="font-display font-bold text-xs text-ink">
                {toast.title}
              </h4>
            </div>
            <button
              onClick={onDismiss}
              className="studio-btn p-1 text-ink"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {toast.message && <p className="text-xs font-mono leading-relaxed font-medium text-ink/90">{toast.message}</p>}

          {toast.details && toast.details.length > 0 && (
            <div className="mt-1 flex flex-col gap-1 border-t border-border pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent font-mono">
                Itemized Validation Failures:
              </span>
              <ul className="list-inside text-xs space-y-1 font-mono">
                {toast.details.map((detail, idx) => (
                  <li key={idx}>• {detail}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
