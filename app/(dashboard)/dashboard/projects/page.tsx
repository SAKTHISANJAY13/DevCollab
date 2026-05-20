import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/shared/page-header";
import { buttonClassName } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Projects",
};

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage repositories, boards, and delivery milestones."
        action={
          <Link
            href="/dashboard/board"
            className={buttonClassName({ size: "sm", className: "shadow-primary/20" })}
          >
            Open Kanban
          </Link>
        }
      />
    </div>
  );
}
