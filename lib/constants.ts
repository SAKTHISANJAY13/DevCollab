import type { DashboardProjectPreview, NavItem, StatMetric } from "@/types";

export const appConfig = {
  name: "DevCollab",
  description: "Collaborative SaaS dashboard for development teams",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;

export const dashboardNav: NavItem[] = [
  { title: "Overview", href: "/dashboard", icon: "layout-dashboard" },
  { title: "Board", href: "/dashboard/board", icon: "columns" },
  { title: "Projects", href: "/dashboard/projects", icon: "folder-kanban" },
  { title: "Team", href: "/dashboard/team", icon: "users" },
  { title: "Settings", href: "/dashboard/settings", icon: "settings" },
];

export const dashboardStats: StatMetric[] = [
  { label: "Active projects", value: "12", change: "+2 this week" },
  { label: "Open tasks", value: "48", change: "8 due today" },
  { label: "Team members", value: "24", change: "3 pending invites" },
  { label: "Deployments", value: "156", change: "+12% vs last month" },
];

export const workspaceSummary = {
  name: "Acme Engineering",
  plan: "Pro",
  memberCount: 24,
  description:
    "Your team’s home for specs, issues, and releases. Invite collaborators and keep delivery aligned in one place.",
} as const;

export const dashboardProjectsPreview: DashboardProjectPreview[] = [
  {
    id: "1",
    name: "Design system",
    slug: "design-system",
    description: "Tokens, components, and documentation for product UI.",
    icon: "◆",
    accent: "from-violet-500/20 to-fuchsia-500/10",
    updatedLabel: "Updated 2h ago",
    memberCount: 6,
    status: "active",
  },
  {
    id: "2",
    name: "API platform",
    slug: "api-platform",
    description: "Public REST + webhooks, rate limits, and developer portal.",
    icon: "◇",
    accent: "from-sky-500/20 to-cyan-500/10",
    updatedLabel: "Updated yesterday",
    memberCount: 11,
    status: "active",
  },
  {
    id: "3",
    name: "Mobile app",
    slug: "mobile",
    description: "React Native client with offline sync and push.",
    icon: "○",
    accent: "from-amber-500/15 to-orange-500/10",
    updatedLabel: "Updated 3d ago",
    memberCount: 8,
    status: "paused",
  },
  {
    id: "4",
    name: "Growth experiments",
    slug: "growth",
    description: "A/B tests, landing pages, and lifecycle email.",
    icon: "△",
    accent: "from-emerald-500/15 to-teal-500/10",
    updatedLabel: "Updated last week",
    memberCount: 4,
    status: "active",
  },
];
