import type { Metadata } from "next";

import { ProjectsSection } from "@/components/dashboard/projects-section";
import { WorkspaceSection } from "@/components/dashboard/workspace-section";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { dashboardStats } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      <PageHeader
        title="Overview"
        description="Track activity across your workspace at a glance."
      />

      <WorkspaceSection />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      <ProjectsSection />
    </div>
  );
}
