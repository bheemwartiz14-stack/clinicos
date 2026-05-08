type DashboardShellProps = {
  activeHref?: string;
  breadcrumb?: string[];
  children: React.ReactNode;
  title: string;
};

export function DashboardShell({ breadcrumb, children, title }: DashboardShellProps) {
  return (
    <div className="space-y-5">
      <div>
        {breadcrumb?.length ? (
          <p className="mb-1 text-xs text-muted-foreground">{breadcrumb.join(" / ")}</p>
        ) : null}

        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
      </div>

      {children}
    </div>
  );
}
