import type { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description: string;
  actions?: ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-zinc-200 pb-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-950 md:text-3xl">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-600">{description}</p>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
    </div>
  );
}
