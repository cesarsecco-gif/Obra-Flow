import React from 'react';
import { useApp } from '../context/AppContext';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast) return null;

  const bgStyles = {
    success: 'bg-tertiary text-on-tertiary',
    error: 'bg-error text-on-error',
    warning: 'bg-[#b28600] text-surface',
    info: 'bg-inverse-surface text-inverse-on-surface',
  }[toast.type];

  const iconName = {
    success: 'check_circle',
    error: 'error',
    warning: 'warning',
    info: 'info',
  }[toast.type];

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-none transition-all duration-300">
      <div className={`flex items-center gap-3 px-4 py-3 shadow-lg ${bgStyles} font-body text-xs font-medium`}>
        <span className="material-symbols-outlined text-lg">{iconName}</span>
        <span>{toast.message}</span>
      </div>
    </div>
  );
};
