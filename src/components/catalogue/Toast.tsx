'use client';

import React, { useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

const toastConfig = {
  success: { icon: 'CheckCircleIcon', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', iconClass: 'text-green-500' },
  error: { icon: 'XCircleIcon', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', iconClass: 'text-red-500' },
  warning: { icon: 'ExclamationTriangleIcon', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800', iconClass: 'text-yellow-500' },
  info: { icon: 'InformationCircleIcon', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', iconClass: 'text-blue-500' },
};

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
  const config = toastConfig[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${config.bg} ${config.border} ${config.text} min-w-[280px] max-w-sm`}>
      <Icon name={config.icon} size={20} className={config.iconClass} />
      <span className="flex-1 text-sm font-medium">{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} className="ml-2 opacity-60 hover:opacity-100 transition-opacity">
        <Icon name="XMarkIcon" size={16} />
      </button>
    </div>
  );
}

export default function Toast({ toasts, onRemove }: ToastProps) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}
