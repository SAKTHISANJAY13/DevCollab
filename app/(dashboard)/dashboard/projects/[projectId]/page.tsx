"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  LayoutDashboard,
  CheckSquare,
  Users,
  History,
  Plus,
  PlusCircle,
  Calendar,
  Check,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockProjects, mockMembers, type MockProject, type MockProjectTask } from "@/lib/mock/projects";
import { ProjectOverviewPanel } from "@/components/projects/project-overview-panel";
import { ProjectActivityFeed } from "@/components/projects/project-activity-feed";

type TabType = "overview" | "tasks" | "team" | "activity";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params?.projectId as string;

  const [project, setProject] = useState<MockProject | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [newTaskAssigneeId, setNewTaskAssigneeId] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [showAddTask, setShowAddTask] = useState(false);
  
  // Team invite state
  const [selectedInviteMemberId, setSelectedInviteMemberId] = useState("");

  // Load project on mount/id change
  useEffect(() => {
    if (projectId) {
      const found = mockProjects.find((p) => p.id === projectId);
      if (found) {
        setProject(JSON.parse(JSON.stringify(found))); // deep clone to avoid modifying default static mock directly
      }
    }
  }, [projectId]);

  if (!project) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-muted-foreground">Loading workspace details or project not found...</p>
        <Link href="/dashboard/projects" className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:underline">
          <ArrowLeft className="h-4.5 w-4.5" />
          Back to Projects list
        </Link>
      </div>
    );
  }

  // Calculate stats
  const completedTasksCount = project.tasks.filter((t) => t.status === "done").length;
  const totalTasksCount = project.tasks.length;

  // Toggle task status (Done <-> Todo)
  const handleToggleTask = (taskId: string) => {
    if (!project) return;

    const updatedTasks = project.tasks.map((task) => {
      if (task.id === taskId) {
        const newStatus = task.status === "done" ? "todo" as const : "done" as const;
        
        // Log activity for completion
        const actionStr = newStatus === "done" ? "completed task" : "marked task as incomplete";
        const newAct = {
          id: `a-${Date.now()}`,
          user: { name: "You", initials: "ME" },
          action: actionStr,
          target: task.title,
          timestamp: "Just now",
        };
        project.activities.unshift(newAct);

        return { ...task, status: newStatus };
      }
      return task;
    });

    // Recalculate progress
    const total = updatedTasks.length;
    const completed = updatedTasks.filter((t) => t.status === "done").length;
    const newProgress = total > 0 ? Math.round((completed / total) * 100) : 0;

    setProject({
      ...project,
      tasks: updatedTasks,
      progress: newProgress,
    });
  };

  // Add task handler
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskDueDate) return;

    const assignee = project.members.find((m) => m.id === newTaskAssigneeId) || project.members[0];

    const newTask: MockProjectTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle,
      status: "todo",
      priority: newTaskPriority,
      assignee,
      dueDate: newTaskDueDate,
    };

    const updatedTasks = [...project.tasks, newTask];
    const total = updatedTasks.length;
    const completed = updatedTasks.filter((t) => t.status === "done").length;
    const newProgress = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Log activity
    const newAct = {
      id: `a-${Date.now()}`,
      user: { name: "You", initials: "ME" },
      action: "created task",
      target: newTaskTitle,
      timestamp: "Just now",
    };

    setProject({
      ...project,
      tasks: updatedTasks,
      progress: newProgress,
      activities: [newAct, ...project.activities],
    });

    // Reset inputs
    setNewTaskTitle("");
    setNewTaskPriority("medium");
    setNewTaskDueDate("");
    setShowAddTask(false);
  };

  // Invite member handler
  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInviteMemberId) return;

    const memberToInvite = mockMembers.find((m) => m.id === selectedInviteMemberId);
    if (!memberToInvite) return;

    // Check if already in project
    if (project.members.some((m) => m.id === memberToInvite.id)) {
      alert("Collaborator is already a team member of this project.");
      return;
    }

    const updatedMembers = [...project.members, memberToInvite];
    
    // Log activity
    const newAct = {
      id: `a-${Date.now()}`,
      user: { name: "You", initials: "ME" },
      action: "added collaborator",
      target: memberToInvite.name,
      timestamp: "Just now",
    };

    setProject({
      ...project,
      members: updatedMembers,
      activities: [newAct, ...project.activities],
    });

    setSelectedInviteMemberId("");
  };

  // Priority badge coloring helper
  const taskPriorityStyles = {
    low: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
    medium: "text-sky-400 border-sky-500/20 bg-sky-500/5",
    high: "text-amber-400 border-amber-500/20 bg-amber-500/5",
    urgent: "text-rose-400 border-rose-500/20 bg-rose-500/5",
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/dashboard/projects" className="hover:text-foreground transition-colors">
          Projects
        </Link>
        <span>/</span>
        <span className="text-foreground font-semibold">{project.title}</span>
      </div>

      {/* Detail Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border/20 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              {project.title}
            </h1>
          </div>
          <p className="text-xs text-muted-foreground font-mono">
            Project ID: <span className="text-indigo-400 font-semibold">{project.id}</span>
          </p>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-lg border border-border/30 overflow-x-auto w-fit">
          <button
            onClick={() => setActiveTab("overview")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap",
              activeTab === "overview"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("tasks")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap",
              activeTab === "tasks"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <CheckSquare className="h-3.5 w-3.5" />
            Tasks ({totalTasksCount})
          </button>
          <button
            onClick={() => setActiveTab("team")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap",
              activeTab === "team"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Users className="h-3.5 w-3.5" />
            Team ({project.members.length})
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer whitespace-nowrap",
              activeTab === "activity"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <History className="h-3.5 w-3.5" />
            Activity
          </button>
        </div>
      </div>

      {/* Render Dynamic Tab Panels */}
      <div className="mt-4 transition-all duration-300">
        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <ProjectOverviewPanel project={project} />
        )}

        {/* Tab 2: Tasks Checklist */}
        {activeTab === "tasks" && (
          <div className="space-y-6 max-w-4xl">
            {/* Header control */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">
                  Project Tasks Checklist
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Completed {completedTasksCount} of {totalTasksCount} tasks ({project.progress}%)
                </p>
              </div>

              <button
                onClick={() => setShowAddTask(!showAddTask)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 border border-indigo-500/20 bg-indigo-500/5 px-2.5 py-1.5 rounded-lg cursor-pointer hover:bg-indigo-500/10"
              >
                <PlusCircle className="h-4 w-4" />
                Add Project Task
              </button>
            </div>

            {/* Quick Inline Task Add Form */}
            {showAddTask && (
              <form onSubmit={handleAddTask} className="rounded-xl border border-border/40 bg-card/20 p-4 space-y-4">
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="sm:col-span-2 space-y-1">
                    <label htmlFor="tsk-title" className="text-[10px] font-semibold text-muted-foreground uppercase">Task Title</label>
                    <input
                      id="tsk-title"
                      type="text"
                      required
                      placeholder="e.g. Design WebSocket schemas"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="tsk-assign" className="text-[10px] font-semibold text-muted-foreground uppercase">Assignee</label>
                    <select
                      id="tsk-assign"
                      value={newTaskAssigneeId}
                      onChange={(e) => setNewTaskAssigneeId(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                    >
                      <option value="">Select Assignee</option>
                      {project.members.map((m) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label htmlFor="tsk-due" className="text-[10px] font-semibold text-muted-foreground uppercase">Due Date</label>
                    <input
                      id="tsk-due"
                      type="date"
                      required
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="tsk-priority" className="text-[10px] font-semibold text-muted-foreground uppercase">Priority</label>
                    <select
                      id="tsk-priority"
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value as "low" | "medium" | "high" | "urgent")}
                      className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border/10">
                  <button
                    type="button"
                    onClick={() => setShowAddTask(false)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer"
                  >
                    Add Task
                  </button>
                </div>
              </form>
            )}

            {/* Task list render */}
            {project.tasks.length > 0 ? (
              <div className="rounded-xl border border-border/40 bg-card/10 overflow-hidden divide-y divide-border/20">
                {project.tasks.map((task) => {
                  const isDone = task.status === "done";
                  return (
                    <div
                      key={task.id}
                      className={cn(
                        "flex items-center justify-between p-4 transition-colors",
                        isDone ? "bg-muted/5 opacity-70" : "hover:bg-muted/10"
                      )}
                    >
                      {/* Left side: checkbox and title */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleTask(task.id)}
                          className={cn(
                            "flex h-4.5 w-4.5 items-center justify-center rounded border transition-all cursor-pointer",
                            isDone
                              ? "bg-indigo-600 border-indigo-600 text-white"
                              : "border-border hover:border-indigo-500/50"
                          )}
                        >
                          {isDone && <Check className="h-3 w-3 stroke-[3]" />}
                        </button>
                        <span className={cn("text-sm font-medium", isDone ? "line-through text-muted-foreground" : "text-foreground")}>
                          {task.title}
                        </span>
                      </div>

                      {/* Right side details */}
                      <div className="flex items-center gap-3 shrink-0">
                        {/* Priority */}
                        <span className={cn("text-[9px] font-bold border px-1.5 py-0.5 rounded-full uppercase tracking-wider", taskPriorityStyles[task.priority])}>
                          {task.priority}
                        </span>

                        {/* Assignee */}
                        <div
                          title={`${task.assignee.name} - ${task.assignee.role}`}
                          className={cn("h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold border border-border/30 cursor-pointer", task.assignee.avatarColor)}
                        >
                          {task.assignee.initials}
                        </div>

                        {/* Due date */}
                        <span className="text-[10px] text-muted-foreground font-mono hidden sm:inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 rounded-xl border border-border/30 bg-card/10">
                <p className="text-xs text-muted-foreground">No tasks defined for this project yet. Add one above to begin.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Team Section */}
        {activeTab === "team" && (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">
                  Project Collaborators
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Developers and leads assigned to {project.title}
                </p>
              </div>

              {/* Add Member form */}
              <form onSubmit={handleInviteMember} className="flex items-center gap-2 shrink-0">
                <select
                  value={selectedInviteMemberId}
                  onChange={(e) => setSelectedInviteMemberId(e.target.value)}
                  className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none"
                  required
                >
                  <option value="">Choose Developer</option>
                  {mockMembers
                    .filter((m) => !project.members.some((pm) => pm.id === m.id))
                    .map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                </select>
                <button
                  type="submit"
                  disabled={!selectedInviteMemberId}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 px-3 py-1.5 rounded-lg cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </button>
              </form>
            </div>

            {/* Team Grid */}
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {project.members.map((member) => (
                <div key={member.id} className="rounded-xl border border-border/40 bg-card/25 p-4 flex items-center gap-3">
                  <div className={cn("h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-sm border border-border/10", member.avatarColor)}>
                    {member.initials}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-foreground text-sm truncate">{member.name}</h4>
                    <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1 mt-0.5">
                      <Briefcase className="h-3 w-3 text-indigo-400" />
                      {member.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Activity logs */}
        {activeTab === "activity" && (
          <div className="max-w-xl space-y-4">
            <div>
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">
                Workspace Log History
              </h3>
              <p className="text-[11px] text-muted-foreground mb-4">
                Chronological list of updates made to this project
              </p>
            </div>

            <ProjectActivityFeed activities={project.activities} />
          </div>
        )}
      </div>
    </div>
  );
}
