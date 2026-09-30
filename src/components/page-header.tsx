import type { ReactNode } from "react";

export function PageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="mb-2 text-[11px] font-medium uppercase tracking-[.12em] text-forest">Portfólio de projetos</div><h1 className="text-[24px] font-semibold tracking-[-.03em] text-ink sm:text-[28px]">{title}</h1><p className="mt-1.5 max-w-2xl text-[13px] leading-5 text-muted">{description}</p></div>{action}</div>;
}
