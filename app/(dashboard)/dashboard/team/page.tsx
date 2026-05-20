import type { Metadata } from "next";

import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = {
  title: "Team",
};

export default function TeamPage() {
  return (
    <PageHeader
      title="Team"
      description="Invite members, assign roles, and manage permissions."
    />
  );
}
