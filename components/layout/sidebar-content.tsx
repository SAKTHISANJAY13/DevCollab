"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ChevronDown,
  Columns3,
  FolderKanban,
  LayoutDashboard,
  Plus,
  Settings,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { appConfig, dashboardNav } from "@/lib/constants";

const iconMap: Record<string, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  columns: Columns3,
  "folder-kanban": FolderKanban,
  users: Users,
  settings: Settings,
};

function navLinkActive(href: string, pathname: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

type SidebarContentProps = {
  onNavigate?: () => void;
  className?: string;
};

export function SidebarContent({ onNavigate, className }: SidebarContentProps) {
  const pathname = usePathname();

  return (
    <div className={cn("flex h-full min-h-0 flex-1 flex-col", className)}>
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border/60 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Sparkles className="h-4 w-4" aria-hidden />
        </div>
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="truncate text-[15px] font-semibold tracking-tight text-foreground"
        >
          {appConfig.name}
        </Link>
      </div>

      <div className="border-b border-border/60 p-3">
        <button
          type="button"
          className="flex w-full items-center gap-3 rounded-lg border border-border/60 bg-card/50 px-3 py-2.5 text-left transition-colors hover:bg-accent/80"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Building2 className="h-4 w-4" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">Acme Engineering</p>
            <p className="truncate text-xs text-muted-foreground">Pro plan · 24 members</p>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3" aria-label="Main">
        <p className="mb-1 px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          Workspace
        </p>
        {dashboardNav.map((item) => {
          const Icon = iconMap[item.icon] ?? LayoutDashboard;
          const active = navLinkActive(item.href, pathname ?? "");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-colors",
                active
                  ? "bg-accent text-foreground shadow-sm ring-1 ring-border/80"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                )}
                aria-hidden
              />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-border/60 p-3">
        <Button
          variant="secondary"
          size="sm"
          className="w-full justify-center gap-2 border border-border/60 bg-card/40 text-foreground hover:bg-accent"
        >
          <Plus className="h-4 w-4" aria-hidden />
          New project
        </Button>
      </div>
    </div>
  );
}
