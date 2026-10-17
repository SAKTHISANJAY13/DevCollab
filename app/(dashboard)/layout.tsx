import { DashboardShell } from "@/components/layout/dashboard-shell";
import { redirect } from "next/navigation";

import { SocketProvider } from "@/providers/socket-provider";
import { ProjectModalProvider } from "@/providers/project-modal-provider";
import { getCurrentMongoUser } from "@/lib/server/auth/getCurrentMongoUser";
import { getActiveWorkspace } from "@/lib/server/auth/getActiveWorkspace";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const dbUser = await getCurrentMongoUser();
  if (!dbUser) {
    redirect("/sign-in");
  }

  const userWorkspace = await getActiveWorkspace(dbUser);
  if (!userWorkspace) {
    redirect("/onboarding");
  }

  const workspaceId = userWorkspace._id.toString();

  return (
    <SocketProvider workspaceId={workspaceId}>
      <ProjectModalProvider workspaceId={workspaceId}>
        <DashboardShell>{children}</DashboardShell>
      </ProjectModalProvider>
    </SocketProvider>
  );
}
