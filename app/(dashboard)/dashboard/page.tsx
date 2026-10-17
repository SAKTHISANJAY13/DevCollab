import type { Metadata } from "next";
import { getCurrentMongoUser } from "@/lib/server/auth/getCurrentMongoUser";
import { getActiveWorkspace } from "@/lib/server/auth/getActiveWorkspace";
import { workspaceService } from "@/lib/server/services/workspace.service";
import { projectService } from "@/lib/server/services/project.service";
import { activityService } from "@/lib/server/services/activity.service";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";

export const metadata: Metadata = {
  title: "Dashboard Overview",
};

export default async function DashboardPage() {
  // Fetch current user from cached Mongo context (no external Clerk HTTP call)
  const dbUser = await getCurrentMongoUser();
  const name = dbUser?.name || "Developer";
  const avatarUrl = dbUser?.avatarUrl;

  const workspace = dbUser ? await getActiveWorkspace(dbUser) : null;

  let initialMetrics = null;
  let initialProjects: any[] = [];
  let initialActivities: any[] = [];

  if (workspace) {
    const [metrics, projects, activities] = await Promise.all([
      workspaceService.getMetrics(workspace._id.toString()),
      projectService.list(workspace._id.toString()),
      activityService.list(workspace._id.toString()),
    ]);
    initialMetrics = metrics;
    initialProjects = JSON.parse(JSON.stringify(projects));
    initialActivities = JSON.parse(JSON.stringify(activities));
  }

  return (
    <DashboardOverview
      userDisplayName={name}
      userAvatarUrl={avatarUrl}
      initialMetrics={initialMetrics}
      initialProjects={initialProjects}
      initialActivities={initialActivities}
    />
  );
}
