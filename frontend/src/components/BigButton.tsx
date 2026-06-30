import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'success' | 'ghost' | 'amber';

const variantClasses: Record<Variant, string> = {
  primary: 'bg-brand-blue text-white shadow-md active:bg-brand-blue-dark',
  success: 'bg-brand-green text-white shadow-md active:bg-brand-green-dark',
  ghost: 'bg-white text-gray-600 border-2 border-gray-200 active:bg-gray-50',
  amber: 'bg-[#fbe7c6] text-[#9a5a00] active:bg-[#f7dcb0]',
};

interface BigButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: ReactNode;
}

/**
 * Grosse, eindeutige Schaltflaeche nach docs/ui_konzept: hohe Touch-Targets,
 * fette Schrift, viel Rundung, Icon links neben dem Text.
 */
export function BigButton({ variant = 'primary', icon, children, className = '', ...rest }: BigButtonProps) {
  return (
    <button
      className={`flex min-h-[72px] w-full items-center justify-center gap-4 rounded-3xl px-6 text-2xl font-extrabold transition disabled:cursor-not-allowed disabled:opacity-40 ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}
