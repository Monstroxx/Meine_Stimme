import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

const variantClasses: Record<Variant, string> = {
  primary: 'bg-blue-600 text-white active:bg-blue-700',
  secondary: 'bg-green-600 text-white active:bg-green-700',
  ghost: 'bg-white text-gray-700 border-2 border-gray-300 active:bg-gray-100',
};

interface BigButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: ReactNode;
}

/**
 * Mebis-Vorbild: große, eindeutige Schaltflächen statt kleiner Text-Links.
 * min-h-16 + text-xl sorgen für gut antippbare Touch-Targets (>= 48px) auf Kiosk-Tablets.
 */
export function BigButton({ variant = 'primary', icon, children, className = '', ...rest }: BigButtonProps) {
  return (
    <button
      className={`flex min-h-16 w-full items-center justify-center gap-3 rounded-2xl px-6 text-xl font-semibold shadow-md transition disabled:cursor-not-allowed disabled:opacity-40 ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
