import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/src/lib/cn';

const BASE =
  'w-full rounded-[--radius-sm] border bg-white px-4 py-3 text-[15px] text-ink placeholder:text-stone/60 ' +
  'transition-colors focus:border-ink focus:outline-none';

export function Label({ children, htmlFor, hint }: { children: ReactNode; htmlFor?: string; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-graphite">
      {children}
      {hint && <span className="ml-2 font-normal text-stone">{hint}</span>}
    </label>
  );
}

export function ErrorText({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return <p className="mt-1.5 text-[12.5px] text-[#8a2f2f]">{children}</p>;
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function Input({ error, className, ...rest }: InputProps) {
  return (
    <input
      className={cn(BASE, error ? 'border-[#8a2f2f]' : 'border-line', className)}
      aria-invalid={Boolean(error)}
      {...rest}
    />
  );
}

export function Textarea({
  error,
  className,
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
  return (
    <textarea
      className={cn(BASE, 'min-h-24 resize-y', error ? 'border-[#8a2f2f]' : 'border-line', className)}
      {...rest}
    />
  );
}

export function Select({
  error,
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { error?: string }) {
  return (
    <select
      className={cn(BASE, 'appearance-none pr-10', error ? 'border-[#8a2f2f]' : 'border-line', className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%237d726b' stroke-width='2'><polyline points='6 9 12 15 18 9'/></svg>\")",
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 14px center',
      }}
      {...rest}
    >
      {children}
    </select>
  );
}

export function FormRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('mb-4', className)}>{children}</div>;
}
