import { useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, Info, X, XCircle } from 'lucide-react';
import { IconButton } from './IconButton';
import { ToastContext, ToastType } from './toastContext';

interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

const TOAST_STYLES = {
  success: { Icon: CheckCircle, className: 'text-success' },
  error: { Icon: XCircle, className: 'text-danger' },
  info: { Icon: Info, className: 'text-accent' },
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div aria-live="polite" className="fixed top-20 right-4 z-70 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 md:right-6">
        <AnimatePresence>
          {toasts.map((toast) => {
            const { Icon, className } = TOAST_STYLES[toast.type];
            return (
              <motion.div
                key={toast.id}
                role="status"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-3 rounded-sm border border-line border-l-4 border-l-marquee bg-card py-1 pr-1 pl-3 shadow-[4px_4px_0_rgba(0,0,0,0.4)]"
              >
                <Icon className={`size-5 shrink-0 ${className}`} />
                <p className="flex-1 text-sm text-ink">{toast.message}</p>
                <IconButton label="Dismiss" onClick={() => removeToast(toast.id)}>
                  <X className="size-4" />
                </IconButton>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
