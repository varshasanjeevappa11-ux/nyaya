import React from 'react';
import { motion } from 'motion/react';

export const GoldLine = () => (
  <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-gold to-transparent my-4" />
);

export const Pill = ({ children, bg, fg, className = "" }: { children: React.ReactNode; bg?: string; fg?: string; className?: string }) => (
  <span 
    className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${className}`}
    style={{ 
      backgroundColor: bg || 'var(--border)', 
      color: fg || 'var(--text)' 
    }}
  >
    {children}
  </span>
);

export const Card = ({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={`bg-card border border-border rounded-[14px] p-[1.4rem] ${className} ${onClick ? 'cursor-pointer' : ''}`}
  >
    {children}
  </div>
);

export const Btn = ({ 
  children, 
  variant = 'gold', 
  onClick, 
  className = "",
  disabled = false,
  type = "button"
}: { 
  children: React.ReactNode; 
  variant?: 'gold' | 'ghost'; 
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}) => {
  const baseClasses = "px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    gold: "bg-gradient-to-br from-gold to-gold-light text-bg hover:opacity-90 shadow-[0_0_15px_rgba(196,148,40,0.3)]",
    ghost: "bg-transparent border border-border text-text-muted hover:border-gold hover:text-gold"
  };

  return (
    <button 
      type={type}
      onClick={onClick} 
      className={`${baseClasses} ${variants[variant]} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export const Spin = () => (
  <div className="w-[18px] h-[18px] border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
);

export const StatWidget = ({ label, value, subtitle, color = 'gold' }: { label: string; value: string | number; subtitle: string; color?: string }) => (
  <Card className="flex flex-col gap-1">
    <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">{label}</span>
    <span className={`text-3xl font-serif font-bold text-${color}`}>{value}</span>
    <span className="text-xs text-text-dim">{subtitle}</span>
  </Card>
);
