import type { ReactNode } from "react";

export const PageHeader = ({ title, description, children }: { title: string; description: string; children?: ReactNode }) => (
  <div data-slot="page-header" className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
      <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
    {children && <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>}
  </div>
);
