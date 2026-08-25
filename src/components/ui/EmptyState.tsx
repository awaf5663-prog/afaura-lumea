import type { ReactNode } from 'react';

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[--radius-lg] border border-dashed border-line bg-white/60 px-6 py-14 text-center">
      {icon && <div className="mb-4 text-stone">{icon}</div>}
      <h3 className="text-xl">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-stone">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
