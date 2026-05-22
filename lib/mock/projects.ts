export interface MockMember {
  id: string;
  name: string;
  initials: string;
  role: string;
  avatarColor: string;
}

export interface MockProjectTask {
  id: string;
  title: string;
  status: "todo" | "in-progress" | "in-review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  assignee: MockMember;
  dueDate: string;
}

export interface MockActivity {
  id: string;
  user: {
    name: string;
    initials: string;
  };
  action: string;
  target: string;
  timestamp: string;
}

export interface MockProject {
  id: string;
  title: string;
  description: string;
  progress: number;
  priority: "low" | "medium" | "high" | "urgent";
  status: "planning" | "active" | "paused" | "completed";
  dueDate: string;
  members: MockMember[];
  tasks: MockProjectTask[];
  activities: MockActivity[];
}

export const mockMembers: MockMember[] = [
  { id: "u1", name: "Alex Rivera", initials: "AR", role: "AI Engineer", avatarColor: "bg-indigo-500 text-indigo-100" },
  { id: "u2", name: "Sam Lee", initials: "SL", role: "Full Stack Developer", avatarColor: "bg-emerald-500 text-emerald-100" },
  { id: "u3", name: "Jordan Kim", initials: "JK", role: "UI Designer", avatarColor: "bg-amber-500 text-amber-100" },
  { id: "u4", name: "Casey Morgan", initials: "CM", role: "Security Specialist", avatarColor: "bg-rose-500 text-rose-100" },
];

export const mockProjects: MockProject[] = [
  {
    id: "p1",
    title: "DevCollab Realtime Platform",
    description: "Design and implement live syncing features, WebSocket room-isolation, and developer presence updates for board views.",
    progress: 68,
    priority: "high",
    status: "active",
    dueDate: "2026-06-15",
    members: [mockMembers[0], mockMembers[1], mockMembers[2]],
    tasks: [
      { id: "t1-1", title: "Setup Socket.io rooms per project", status: "done", priority: "high", assignee: mockMembers[1], dueDate: "2026-05-20" },
      { id: "t1-2", title: "Implement client-side connection status notifications", status: "in-progress", priority: "medium", assignee: mockMembers[0], dueDate: "2026-05-24" },
      { id: "t1-3", title: "Design visual presence indicator dots for top bar", status: "todo", priority: "low", assignee: mockMembers[2], dueDate: "2026-05-29" },
      { id: "t1-4", title: "Configure MongoDB offline fallback adapter", status: "in-review", priority: "urgent", assignee: mockMembers[0], dueDate: "2026-05-23" },
    ],
    activities: [
      { id: "a1-1", user: { name: "Sam Lee", initials: "SL" }, action: "completed task", target: "Setup Socket.io rooms per project", timestamp: "3 hours ago" },
      { id: "a1-2", user: { name: "Alex Rivera", initials: "AR" }, action: "started task", target: "Configure MongoDB offline fallback adapter", timestamp: "5 hours ago" },
      { id: "a1-3", user: { name: "Jordan Kim", initials: "JK" }, action: "updated status of", target: "Design visual presence indicator dots for top bar", timestamp: "Yesterday" }
    ]
  },
  {
    id: "p2",
    title: "Clerk Authentication Integration",
    description: "Implement enterprise Single Sign-On (SSO), multi-tenant role structures, and session timeout behaviors.",
    progress: 100,
    priority: "medium",
    status: "completed",
    dueDate: "2026-05-10",
    members: [mockMembers[1], mockMembers[3]],
    tasks: [
      { id: "t2-1", title: "Initialize Clerk application keys", status: "done", priority: "medium", assignee: mockMembers[1], dueDate: "2026-05-01" },
      { id: "t2-2", title: "Setup middleware path exclusions", status: "done", priority: "low", assignee: mockMembers[3], dueDate: "2026-05-04" },
      { id: "t2-3", title: "Build custom login & signup templates", status: "done", priority: "medium", assignee: mockMembers[1], dueDate: "2026-05-08" }
    ],
    activities: [
      { id: "a2-1", user: { name: "Sam Lee", initials: "SL" }, action: "completed project", target: "Clerk Authentication Integration", timestamp: "12 days ago" },
      { id: "a2-2", user: { name: "Casey Morgan", initials: "CM" }, action: "approved security audit on", target: "middleware routes", timestamp: "14 days ago" }
    ]
  },
  {
    id: "p3",
    title: "Database Migration & Schema Overhaul",
    description: "Transition legacy relational database structures to MongoDB document models with automated indexing configurations.",
    progress: 42,
    priority: "urgent",
    status: "active",
    dueDate: "2026-06-01",
    members: [mockMembers[0], mockMembers[2], mockMembers[3]],
    tasks: [
      { id: "t3-1", title: "Configure mongoose fallback handlers", status: "done", priority: "urgent", assignee: mockMembers[0], dueDate: "2026-05-15" },
      { id: "t3-2", title: "Verify task CRUD controller validations", status: "in-progress", priority: "high", assignee: mockMembers[3], dueDate: "2026-05-25" },
      { id: "t3-3", title: "Define schema relationships for workspace and boards", status: "todo", priority: "medium", assignee: mockMembers[2], dueDate: "2026-05-28" }
    ],
    activities: [
      { id: "a3-1", user: { name: "Alex Rivera", initials: "AR" }, action: "pushed code for", target: "Mongoose database resilience retry limits", timestamp: "2 days ago" },
      { id: "a3-2", user: { name: "Casey Morgan", initials: "CM" }, action: "flagged validation issues on", target: "Task schema description fields", timestamp: "3 days ago" }
    ]
  },
  {
    id: "p4",
    title: "Mobile App Framework",
    description: "Build a cross-platform React Native client to access board cards and overview analytics.",
    progress: 15,
    priority: "low",
    status: "paused",
    dueDate: "2026-09-01",
    members: [mockMembers[1], mockMembers[2]],
    tasks: [
      { id: "t4-1", title: "Initialize Expo bare workflow repository", status: "done", priority: "low", assignee: mockMembers[1], dueDate: "2026-05-12" },
      { id: "t4-2", title: "Prototype draggable columns using Reanimated", status: "todo", priority: "high", assignee: mockMembers[2], dueDate: "2026-07-15" },
      { id: "t4-3", title: "Setup local notification alerts", status: "todo", priority: "low", assignee: mockMembers[1], dueDate: "2026-08-01" }
    ],
    activities: [
      { id: "a4-1", user: { name: "Jordan Kim", initials: "JK" }, action: "paused progress on", target: "Draggable column layout prototyping", timestamp: "5 days ago" }
    ]
  }
];
