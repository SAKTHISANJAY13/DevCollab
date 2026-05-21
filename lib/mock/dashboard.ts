export interface DashboardStat {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "stable";
  iconName: "folder-kanban" | "check-circle" | "clock" | "users";
  colorClass: string;
}

export interface ProjectMember {
  id: string;
  name: string;
  initials: string;
  avatarUrl?: string;
}

export interface DashboardProject {
  id: string;
  title: string;
  description: string;
  progress: number; // percentage 0 - 100
  status: "active" | "paused" | "completed";
  deadline: string; // date string or descriptive string
  members: ProjectMember[];
  accentColor: string; // gradient CSS class
}

export interface ActivityItem {
  id: string;
  user: {
    name: string;
    initials: string;
    avatarUrl?: string;
  };
  action: string;
  target: string;
  projectName?: string;
  timestamp: string;
  type: "task" | "project" | "team" | "system";
}

export interface ProductivityDataPoint {
  name: string; // e.g., day of week or date
  completed: number;
  created: number;
}

export const mockDashboardStats: DashboardStat[] = [
  {
    label: "Active Projects",
    value: "6",
    change: "+1 this week",
    trend: "up",
    iconName: "folder-kanban",
    colorClass: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
  },
  {
    label: "Tasks Completed",
    value: "142",
    change: "+18% vs last week",
    trend: "up",
    iconName: "check-circle",
    colorClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    label: "Pending Tasks",
    value: "28",
    change: "5 high priority",
    trend: "down", // down meaning fewer tasks is good, but let's say "stable" or "down" for trend direction
    iconName: "clock",
    colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  {
    label: "Online Members",
    value: "8",
    change: "Out of 12 total",
    trend: "stable",
    iconName: "users",
    colorClass: "text-sky-400 bg-sky-500/10 border-sky-500/20",
  },
];

export const mockDashboardProjects: DashboardProject[] = [
  {
    id: "p1",
    title: "Design System 2.0",
    description: "Modernizing core UI kit, tokens, documentation, and accessible components.",
    progress: 72,
    status: "active",
    deadline: "June 15, 2026",
    accentColor: "from-violet-500/20 to-fuchsia-500/5",
    members: [
      { id: "m1", name: "Alex Rivera", initials: "AR" },
      { id: "m2", name: "Sam Lee", initials: "SL" },
      { id: "m3", name: "Casey Morgan", initials: "CM" },
    ],
  },
  {
    id: "p2",
    title: "API Gateway Platform",
    description: "Re-architecting public REST endpoints, rate limiting, and webhooks middleware.",
    progress: 45,
    status: "active",
    deadline: "June 30, 2026",
    accentColor: "from-sky-500/20 to-cyan-500/5",
    members: [
      { id: "m1", name: "Alex Rivera", initials: "AR" },
      { id: "m4", name: "Jordan Kim", initials: "JK" },
    ],
  },
  {
    id: "p3",
    title: "Mobile App Offline Sync",
    description: "Adding conflict resolution and background sync via SQLite adapter for iOS/Android.",
    progress: 90,
    status: "active",
    deadline: "May 28, 2026",
    accentColor: "from-emerald-500/20 to-teal-500/5",
    members: [
      { id: "m4", name: "Jordan Kim", initials: "JK" },
      { id: "m2", name: "Sam Lee", initials: "SL" },
      { id: "m5", name: "Taylor Vance", initials: "TV" },
    ],
  },
  {
    id: "p4",
    title: "Growth Funnel Testing",
    description: "Iterating on user checkout flow, onboarding steps, and referral incentives.",
    progress: 20,
    status: "paused",
    deadline: "July 10, 2026",
    accentColor: "from-amber-500/15 to-orange-500/5",
    members: [
      { id: "m3", name: "Casey Morgan", initials: "CM" },
      { id: "m5", name: "Taylor Vance", initials: "TV" },
    ],
  },
];

export const mockRecentActivities: ActivityItem[] = [
  {
    id: "a1",
    user: { name: "Alex Rivera", initials: "AR" },
    action: "completed task",
    target: "Design onboarding flows",
    projectName: "Design System 2.0",
    timestamp: "4m ago",
    type: "task",
  },
  {
    id: "a2",
    user: { name: "Jordan Kim", initials: "JK" },
    action: "moved task to in-progress",
    target: "Implement OAuth refresh tokens",
    projectName: "API Gateway Platform",
    timestamp: "12m ago",
    type: "task",
  },
  {
    id: "a3",
    user: { name: "Sam Lee", initials: "SL" },
    action: "published version",
    target: "v2.4.0-beta.2",
    projectName: "Design System 2.0",
    timestamp: "1h ago",
    type: "project",
  },
  {
    id: "a4",
    user: { name: "Taylor Vance", initials: "TV" },
    action: "joined the workspace team",
    target: "Engineering Role",
    timestamp: "3h ago",
    type: "team",
  },
  {
    id: "a5",
    user: { name: "Casey Morgan", initials: "CM" },
    action: "created task",
    target: "QA billing stripe integration",
    projectName: "Growth Funnel Testing",
    timestamp: "5h ago",
    type: "task",
  },
];

export const mockProductivityData: ProductivityDataPoint[] = [
  { name: "Mon", completed: 8, created: 12 },
  { name: "Tue", completed: 15, created: 10 },
  { name: "Wed", completed: 12, created: 14 },
  { name: "Thu", completed: 18, created: 11 },
  { name: "Fri", completed: 24, created: 15 },
  { name: "Sat", completed: 5, created: 2 },
  { name: "Sun", completed: 9, created: 4 },
];
