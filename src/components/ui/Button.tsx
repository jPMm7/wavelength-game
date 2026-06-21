import React, { ButtonHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const baseClasses = "relative transition-all rounded-2xl font-extrabold flex items-center justify-center gap-2 active:border-b-0 active:translate-y-[8px]";
  
  const variants = {
    primary: "bg-bright_ocean border-b-8 border-bright_ocean-300 hover:border-b-4 hover:translate-y-[4px] text-white",
    secondary: "bg-imperial_blue-700 border-b-8 border-imperial_blue-300 hover:border-b-4 hover:translate-y-[4px] text-white",
    accent: "bg-cream-500 border-b-8 border-cream-700 hover:border-b-4 hover:translate-y-[4px] text-imperial_blue-500",
    danger: "bg-red-500 border-b-8 border-red-700 hover:border-b-4 hover:translate-y-[4px] text-white"
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-4 text-xl",
    lg: "px-8 py-5 text-2xl",
    xl: "px-10 py-6 text-3xl w-full"
  };

  return (
    <button 
      className={twMerge(baseClasses, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
