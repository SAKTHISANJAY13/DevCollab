import { DashboardShell } from "@/components/layout/dashboard-shell";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { SocketProvider } from "@/providers/socket-provider";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  return (
    <SocketProvider>
      <DashboardShell>{children}</DashboardShell>
    </SocketProvider>
  );
}
