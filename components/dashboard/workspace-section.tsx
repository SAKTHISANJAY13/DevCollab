import Link from "next/link";
import { ArrowUpRight, Users } from "lucide-react";

import { buttonClassName } from "@/components/ui/button";
import { workspaceSummary } from "@/lib/constants";

export function WorkspaceSection() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-card via-card to-secondary/40 p-6 shadow-sm sm:p-8">
      <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" aria-hidden />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Workspace</p>
          <div className="flex flex-wrap items-center gap-3 gap-y-1">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {workspaceSummary.name}
            </h2>
            <span className="rounded-full border border-border/80 bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {workspaceSummary.plan}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
            {workspaceSummary.description}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Users className="h-4 w-4" aria-hidden />
              {workspaceSummary.memberCount} members
            </span>
            <span className="hidden text-border sm:inline" aria-hidden>
              ·
            </span>
            <span className="text-xs sm:text-sm">Default branch protections enabled</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
          <Link
            href="/dashboard/team"
            className={buttonClassName({
              className:
                "w-full shadow-lg shadow-primary/20 sm:w-auto sm:min-w-[10rem] justify-center sm:justify-center",
            })}
          >
            Invite people
            <ArrowUpRight className="h-4 w-4 opacity-80" aria-hidden />
          </Link>
          <Link
            href="/dashboard/settings"
            className={buttonClassName({
              variant: "outline",
              className: "w-full border-border/80 bg-background/40 hover:bg-accent sm:w-auto",
            })}
          >
            Workspace settings
          </Link>
        </div>
      </div>
    </section>
  );
}
