"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  PlusCircle,
  UserPlus,
  FolderKanban,
  Send,
  Bot,
  Loader2,
  Calendar,
  Sparkle,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Components
import {
  DashboardStatCard,
  DashboardStatCardSkeleton,
} from "./dashboard-stat-card";
import {
  ProjectOverviewCard,
  ProjectOverviewCardSkeleton,
} from "./project-overview-card";
import { ActivityFeed, ActivityFeedSkeleton } from "./activity-feed";
import {
  ProductivityChart,
  ProductivityChartSkeleton,
} from "./productivity-chart";

// Dialog components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Mock Data
import {
  mockDashboardStats,
  mockDashboardProjects,
  mockRecentActivities,
  mockProductivityData,
  type DashboardProject,
} from "@/lib/mock/dashboard";

interface DashboardOverviewProps {
  userDisplayName?: string;
  userAvatarUrl?: string;
}

export function DashboardOverview({
  userDisplayName = "Developer",
  userAvatarUrl,
}: DashboardOverviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<DashboardProject[]>(mockDashboardProjects);
  const [activities, setActivities] = useState(mockRecentActivities);

  // Quick Action Dialog states
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);

  // Form states
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");

  // AI Assistant states
  const [aiInput, setAiInput] = useState("");
  const [aiTyping, setAiTyping] = useState(false);
  const [aiMessages, setAiMessages] = useState<
    Array<{ sender: "user" | "ai"; text: string; timestamp: string }>
  >([
    {
      sender: "ai",
      text: `Hello ${userDisplayName}! I am your DevCollab AI assistant. Ask me anything about your active projects, tasks, or workspace velocity.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom of AI chat when messages change
    if (isAiOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [aiMessages, isAiOpen]);

  // Simulate loading state on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 650);
    return () => clearTimeout(timer);
  }, []);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const newProject: DashboardProject = {
      id: `p-${Date.now()}`,
      title: newProjectName,
      description: newProjectDesc || "Collaborative workspace project.",
      progress: 0,
      status: "active",
      deadline: "August 30, 2026",
      accentColor: "from-indigo-500/20 to-purple-500/5",
      members: [{ id: "m-user", name: userDisplayName, initials: userDisplayName.slice(0, 2).toUpperCase() }],
    };

    setProjects((prev) => [newProject, ...prev]);

    // Add activity log
    const newActivity = {
      id: `a-${Date.now()}`,
      user: { name: userDisplayName, initials: userDisplayName.slice(0, 2).toUpperCase() },
      action: "created project",
      target: newProjectName,
      timestamp: "Just now",
      type: "project" as const,
    };
    setActivities((prev) => [newActivity, ...prev]);

    // Reset and close
    setNewProjectName("");
    setNewProjectDesc("");
    setIsNewProjectOpen(false);
  };

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    // Add activity log
    const newActivity = {
      id: `a-${Date.now()}`,
      user: { name: userDisplayName, initials: userDisplayName.slice(0, 2).toUpperCase() },
      action: `invited ${inviteRole}`,
      target: inviteEmail,
      timestamp: "Just now",
      type: "team" as const,
    };
    setActivities((prev) => [newActivity, ...prev]);

    setInviteEmail("");
    setIsInviteOpen(false);
  };

  const handleSendAiMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiInput.trim()) return;

    const text = aiInput;
    setAiInput("");

    const newMsg = {
      sender: "user" as const,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setAiMessages((prev) => [...prev, newMsg]);
    setAiTyping(true);

    setTimeout(() => {
      setAiTyping(false);
      let reply = `I'm analyzing your DevCollab workspaces. You currently have ${projects.length} active projects and 28 pending tasks. Everything looks healthy!`;

      const lower = text.toLowerCase();
      if (lower.includes("due") || lower.includes("deadline") || lower.includes("task")) {
        reply = "Looking at your boards, you have 3 tasks due soon: 'Design onboarding flow' is due tomorrow (High Priority), 'Implement OAuth refresh' is due today (Urgent), and 'QA billing edge cases' is due in 2 days.";
      } else if (lower.includes("project") || lower.includes("active")) {
        reply = `Here is a summary of active projects: \n\n1. *${projects[0].title}* - ${projects[0].progress}% complete (${projects[0].status})\n2. *${projects[1].title}* - ${projects[1].progress}% complete (${projects[1].status})`;
      } else if (lower.includes("velocity") || lower.includes("chart") || lower.includes("productivity")) {
        reply = "According to our velocity charts, task completion peaked on Friday at 24 completed tasks. Overall team velocity has increased by 18% compared to last week.";
      }

      setAiMessages((prev) => [
        ...prev,
        {
          sender: "ai" as const,
          text: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 1100);
  };

  const handleAiSuggestion = (suggestion: string) => {
    setAiInput(suggestion);
  };

  return (
    <div className="space-y-8">
      {/* Header and Welcome */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-border/20 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl flex items-center gap-2">
            Overview
            <Sparkle className="h-5 w-5 text-indigo-400 fill-indigo-400 animate-pulse" />
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Hi, <span className="font-semibold text-foreground">{userDisplayName}</span>. Welcome back to your workspace workspace.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg border border-border/30 w-fit">
          <Calendar className="h-3.5 w-3.5" />
          <span>{new Date().toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</span>
        </div>
      </div>

      {/* Analytics Stats Cards Grid */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <DashboardStatCardSkeleton key={i} />)
          : mockDashboardStats.map((stat) => (
              <DashboardStatCard key={stat.label} {...stat} />
            ))}
      </section>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Columns: Chart and Projects */}
        <div className="lg:col-span-2 space-y-6">
          {/* Productivity Chart */}
          {isLoading ? (
            <ProductivityChartSkeleton />
          ) : (
            <ProductivityChart data={mockProductivityData} />
          )}

          {/* Projects Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  Active Projects
                </h2>
                <p className="text-xs text-muted-foreground">
                  Manage goals and monitor progress
                </p>
              </div>
              <Link
                href="/dashboard/projects"
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:underline"
              >
                View all projects
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => <ProjectOverviewCardSkeleton key={i} />)
                : projects.map((project) => (
                    <ProjectOverviewCard key={project.id} {...project} />
                  ))}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Quick Actions & Activity Feed */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="rounded-xl border border-border/50 bg-card/30 p-5 space-y-4">
            <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/dashboard/board"
                className="flex flex-col items-center justify-center p-4 rounded-lg bg-card border border-border/40 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all text-center group"
              >
                <PlusCircle className="h-5 w-5 text-indigo-400 group-hover:scale-105 transition-transform" />
                <span className="text-xs font-semibold text-foreground mt-2">Create Task</span>
              </Link>
              <button
                onClick={() => setIsNewProjectOpen(true)}
                className="flex flex-col items-center justify-center p-4 rounded-lg bg-card border border-border/40 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all text-center group cursor-pointer"
              >
                <FolderKanban className="h-5 w-5 text-emerald-400 group-hover:scale-105 transition-transform" />
                <span className="text-xs font-semibold text-foreground mt-2">New Project</span>
              </button>
              <button
                onClick={() => setIsInviteOpen(true)}
                className="flex flex-col items-center justify-center p-4 rounded-lg bg-card border border-border/40 hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all text-center group cursor-pointer"
              >
                <UserPlus className="h-5 w-5 text-sky-400 group-hover:scale-105 transition-transform" />
                <span className="text-xs font-semibold text-foreground mt-2">Invite Team</span>
              </button>
              <button
                onClick={() => setIsAiOpen(true)}
                className="flex flex-col items-center justify-center p-4 rounded-lg bg-indigo-600/10 border border-indigo-500/30 hover:border-indigo-500/50 hover:bg-indigo-500/15 transition-all text-center group cursor-pointer relative"
              >
                <div className="absolute right-2 top-2">
                  <span className="flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
                  </span>
                </div>
                <Sparkles className="h-5 w-5 text-indigo-400 group-hover:scale-105 transition-transform animate-pulse" />
                <span className="text-xs font-semibold text-indigo-400 mt-2">Ask AI</span>
              </button>
            </div>
          </div>

          {/* Recent Activity Card */}
          <div className="rounded-xl border border-border/50 bg-card/30 p-5 space-y-4">
            <div>
              <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">
                Recent Activity
              </h3>
              <p className="text-[10px] text-muted-foreground">
                Live updates from your workspace
              </p>
            </div>

            {isLoading ? <ActivityFeedSkeleton /> : <ActivityFeed activities={activities} />}
          </div>
        </div>
      </div>

      {/* dialog / modals */}

      {/* New Project Dialog */}
      <Dialog open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Initialize a new collaborative development project in this workspace.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateProject} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label htmlFor="pname" className="text-xs font-semibold text-foreground">
                Project Name
              </label>
              <input
                id="pname"
                type="text"
                placeholder="e.g. Developer Portal Docs"
                required
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="pdesc" className="text-xs font-semibold text-foreground">
                Description
              </label>
              <textarea
                id="pdesc"
                placeholder="Explain the scope and targets of this project..."
                rows={3}
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsNewProjectOpen(false)}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                Create Project
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Invite Member Dialog */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Collaborator</DialogTitle>
            <DialogDescription>
              Add developers or managers to collaborate in this workspace.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInviteUser} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-foreground">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="developer@example.com"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="role" className="text-xs font-semibold text-foreground">
                Workspace Role
              </label>
              <select
                id="role"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="member">Member (Read & Write)</option>
                <option value="admin">Admin (Full Control)</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              >
                Send Invitation
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* AI Assistant Dialog */}
      <Dialog open={isAiOpen} onOpenChange={setIsAiOpen}>
        <DialogContent className="sm:max-w-120 p-0 overflow-hidden flex flex-col h-130">
          <div className="p-4 border-b border-border/50 bg-secondary/20 flex items-center gap-2 shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-sm font-bold flex items-center gap-1.5">
                DevCollab AI
              </DialogTitle>
              <p className="text-[10px] text-muted-foreground">
                Powered by Gemini & workspace context
              </p>
            </div>
          </div>

          {/* Message Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-card/20">
            {aiMessages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div
                  className={cn(
                    "flex h-6 w-6 shrink-0 select-none items-center justify-center rounded-md border text-[9px] font-bold overflow-hidden",
                    msg.sender === "ai"
                      ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {msg.sender === "ai" ? (
                    "AI"
                  ) : userAvatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={userAvatarUrl} alt={userDisplayName} className="h-full w-full object-cover" />
                  ) : (
                    "ME"
                  )}
                </div>
                <div className="space-y-1">
                  <div
                    className={cn(
                      "rounded-lg px-3 py-2 text-xs leading-relaxed whitespace-pre-line shadow-sm",
                      msg.sender === "ai"
                        ? "bg-muted/40 text-foreground border border-border/30"
                        : "bg-indigo-600 text-white"
                    )}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[8px] text-muted-foreground block text-right pr-1">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {aiTyping && (
              <div className="flex gap-3 max-w-[80%]">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 text-[9px] font-bold">
                  AI
                </div>
                <div className="flex items-center gap-1 rounded-lg bg-muted/40 border border-border/30 px-3 py-2 text-xs text-muted-foreground shadow-sm">
                  <Loader2 className="h-3 w-3 animate-spin text-indigo-400" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {aiMessages.length === 1 && !aiTyping && (
            <div className="p-3 bg-secondary/10 border-t border-border/30 shrink-0 space-y-1.5">
              <p className="text-[10px] font-semibold text-muted-foreground">Try asking:</p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => handleAiSuggestion("Which tasks are due soon?")}
                  className="text-[10px] text-foreground bg-muted border border-border/40 hover:border-indigo-500/40 hover:bg-indigo-500/5 px-2 py-1 rounded transition-all cursor-pointer"
                >
                  Which tasks are due soon?
                </button>
                <button
                  onClick={() => handleAiSuggestion("Summarize my project progress")}
                  className="text-[10px] text-foreground bg-muted border border-border/40 hover:border-indigo-500/40 hover:bg-indigo-500/5 px-2 py-1 rounded transition-all cursor-pointer"
                >
                  Summarize my project progress
                </button>
                <button
                  onClick={() => handleAiSuggestion("What is our weekly velocity?")}
                  className="text-[10px] text-foreground bg-muted border border-border/40 hover:border-indigo-500/40 hover:bg-indigo-500/5 px-2 py-1 rounded transition-all cursor-pointer"
                >
                  What is our weekly velocity?
                </button>
              </div>
            </div>
          )}

          {/* Chat Input */}
          <form
            onSubmit={handleSendAiMessage}
            className="p-3 border-t border-border/40 bg-card flex gap-2 items-center shrink-0"
          >
            <input
              type="text"
              placeholder="Ask anything..."
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <button
              type="submit"
              disabled={!aiInput.trim()}
              className="h-8 w-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors disabled:opacity-40 disabled:hover:bg-indigo-600 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
