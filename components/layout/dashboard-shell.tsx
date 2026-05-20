import { DashboardFrame } from "@/components/layout/dashboard-frame";

type DashboardShellProps = {
  children: React.ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="dashboard-shell min-h-screen bg-background text-foreground antialiased selection:bg-primary/30 selection:text-foreground">
      <DashboardFrame>{children}</DashboardFrame>
    </div>
  );
}
