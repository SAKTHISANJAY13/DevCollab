import Link from "next/link";
import { ChevronRight, Users } from "lucide-react";

import { dashboardProjectsPreview } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function ProjectsSection() {
  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Projects</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground">Recent</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Jump back into what your team is shipping.</p>
        </div>
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View all
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
        {dashboardProjectsPreview.map((project) => (
          <li key={project.id}>
            <Link
              href={`/dashboard/projects?focus=${project.slug}`}
              className="group block h-full rounded-xl border border-border/60 bg-card/40 p-4 transition-all hover:border-border hover:bg-accent/30 hover:shadow-md hover:shadow-black/20"
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-lg text-foreground/90 ring-1 ring-border/50",
                    project.accent,
                  )}
                  aria-hidden
                >
                  {project.icon}
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate font-medium text-foreground group-hover:text-primary">
                      {project.name}
                    </p>
                    <span
                      className={cn(
                        "shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                        project.status === "active"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {project.status}
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{project.description}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-xs text-muted-foreground">
                    <span>{project.updatedLabel}</span>
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" aria-hidden />
                      {project.memberCount}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
