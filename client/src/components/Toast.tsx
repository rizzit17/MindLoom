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
        className="fixed top-5 right-5 z-50 max-w-md w-full"
      >
        <div
          className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex flex-col gap-2 ${
            isError
              ? 'bg-rose-950/90 border-rose-800/80 text-rose-100'
              : isWarning
              ? 'bg-amber-950/90 border-amber-800/80 text-amber-100'
              : 'bg-slate-900/90 border-slate-700 text-slate-100'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {isError || isWarning ? (
                <AlertCircle className={`w-5 h-5 flex-shrink-0 ${isError ? 'text-rose-400' : 'text-amber-400'}`} />
              ) : (
                <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
              )}
              <h4 className="font-semibold text-sm">{toast.title}</h4>
            </div>
            <button
              onClick={onDismiss}
              className="p-1 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {toast.message && <p className="text-xs opacity-90 leading-relaxed pl-7">{toast.message}</p>}

          {toast.details && toast.details.length > 0 && (
            <div className="pl-7 mt-1 flex flex-col gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider opacity-75">
                Itemized Validation Failures:
              </span>
              <ul className="list-disc list-inside text-xs space-y-0.5 opacity-90 font-mono">
                {toast.details.map((detail, idx) => (
                  <li key={idx}>{detail}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
