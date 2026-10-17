"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  FolderPlus,
  Loader2,
  AlertCircle,
  Calendar,
  Users,
  Target,
  Sparkles,
  CheckCircle2,
  FileText,
  Clock,
} from "lucide-react";
import { PROJECT_CATEGORIES } from "@/lib/db/models/project.model";
import { cn } from "@/lib/utils";

export interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  onCreateProject?: (project: any) => Promise<any> | void;
  members?: Array<{
    id: string;
    name: string;
    initials: string;
    role?: string;
    email?: string;
  }>;
}

export function CreateProjectModal({
  isOpen,
  onClose,
  onCreateProject,
  members = [],
}: CreateProjectModalProps) {
  // Form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [category, setCategory] = useState<string>("Web Application");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [status, setStatus] = useState<"planning" | "active" | "paused" | "completed">("planning");
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  // Navigation tab for smooth reviewing: "details" | "requirements" | "team" | "review"
  const [activeTab, setActiveTab] = useState<"details" | "requirements" | "team" | "review">("details");

  // Interaction states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [isSuccess, setIsSuccess] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName("");
      setDescription("");
      setRequirements("");
      setCategory("Web Application");
      setPriority("medium");
      setStatus("planning");
      setStartDate("");
      setDueDate("");
      setSelectedMemberIds([]);
      setActiveTab("details");
      setErrorMessage(null);
      setValidationErrors({});
      setIsSuccess(false);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const toggleMemberSelection = (id: string) => {
    if (isSubmitting) return;
    setSelectedMemberIds((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]
    );
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!name.trim()) {
      errors.name = "Project name is required.";
    }

    if (startDate && dueDate) {
      const start = new Date(startDate);
      const due = new Date(dueDate);
      if (start.getTime() > due.getTime()) {
        errors.dates = "Target due date cannot be earlier than the start date.";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    if (!validateForm()) {
      if (!name.trim()) {
        setActiveTab("details");
      } else if (startDate && dueDate && new Date(startDate) > new Date(dueDate)) {
        setActiveTab("team");
      }
      return;
    }

    setIsSubmitting(true);

    try {
      // Selected member objects
      const projectMembers = members.filter((m) => selectedMemberIds.includes(m.id));

      const payload = {
        name: name.trim(),
        title: name.trim(),
        description: description.trim(),
        requirements: requirements.trim(),
        category,
        priority,
        status,
        progress: status === "completed" ? 100 : 0,
        startDate: startDate || undefined,
        dueDate: dueDate || undefined,
        members: projectMembers.map((m) => m.id),
      };

      if (onCreateProject) {
        await onCreateProject(payload);
      }

      setIsSuccess(true);
      setTimeout(() => {
        onClose(false);
      }, 500);
    } catch (err: any) {
      console.error("[CreateProjectModal] Error creating project:", err);
      setErrorMessage(err?.message || "Failed to create project. Please verify inputs and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && onClose(open)}>
      <DialogContent className="max-w-2xl max-h-[92vh] flex flex-col bg-card border-border/80 shadow-2xl p-0 overflow-hidden sm:rounded-2xl">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border/50 bg-secondary/20">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <FolderPlus className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
                  Initialize New Project
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Define project requirements, delivery goals, schedule, and team collaborators.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 mt-5 border-b border-border/40 -mb-4 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("details")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors cursor-pointer",
                activeTab === "details"
                  ? "border-indigo-500 text-indigo-400 font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <FileText className="h-3.5 w-3.5" />
              General Details
              {validationErrors.name && (
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("requirements")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors cursor-pointer",
                activeTab === "requirements"
                  ? "border-indigo-500 text-indigo-400 font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Target className="h-3.5 w-3.5" />
              Goals & Requirements
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("team")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors cursor-pointer",
                activeTab === "team"
                  ? "border-indigo-500 text-indigo-400 font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Users className="h-3.5 w-3.5" />
              Timeline & Team
              {validationErrors.dates && (
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("review")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors cursor-pointer",
                activeTab === "review"
                  ? "border-indigo-500 text-indigo-400 font-semibold"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Review & Submit
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {errorMessage && (
            <div className="mb-4 rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 flex items-start gap-2.5 text-xs text-rose-300 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold block">Submission Error</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {isSuccess && (
            <div className="mb-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 flex items-center gap-2 text-xs text-emerald-300 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Project created successfully! Loading your workspace...</span>
            </div>
          )}

          <form id="create-project-form" onSubmit={handleSubmit} className="space-y-4">
            {/* TAB 1: General Details */}
            {activeTab === "details" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Project Name */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="proj-name" className="text-xs font-semibold text-foreground">
                      Project Name <span className="text-rose-400">*</span>
                    </label>
                    <span className="text-[10px] text-muted-foreground">Required</span>
                  </div>
                  <input
                    id="proj-name"
                    type="text"
                    required
                    disabled={isSubmitting}
                    placeholder="e.g. Distributed Cache & Analytics Engine"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (validationErrors.name) {
                        setValidationErrors((prev) => ({ ...prev, name: "" }));
                      }
                    }}
                    className={cn(
                      "w-full rounded-lg border bg-background/80 px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all",
                      validationErrors.name ? "border-rose-500/80 ring-1 ring-rose-500/50" : "border-border"
                    )}
                  />
                  {validationErrors.name && (
                    <p className="text-[11px] font-medium text-rose-400">{validationErrors.name}</p>
                  )}
                </div>

                {/* Project Category */}
                <div className="space-y-1.5">
                  <label htmlFor="proj-category" className="text-xs font-semibold text-foreground">
                    Project Type / Category
                  </label>
                  <select
                    id="proj-category"
                    disabled={isSubmitting}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background/80 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                  >
                    {PROJECT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label htmlFor="proj-desc" className="text-xs font-semibold text-foreground">
                    Project Overview & Scope
                  </label>
                  <textarea
                    id="proj-desc"
                    disabled={isSubmitting}
                    placeholder="Provide a concise summary of what this project aims to accomplish..."
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background/80 px-3 py-2 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all resize-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: Goals & Requirements */}
            {activeTab === "requirements" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3 text-xs text-indigo-300">
                  <span className="font-semibold block mb-0.5">Project Requirements & Deliverables</span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Specify technical targets, business requirements, acceptance criteria, or key milestones for your team.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="proj-requirements" className="text-xs font-semibold text-foreground flex items-center justify-between">
                    <span>Goals & Acceptance Criteria</span>
                    <span className="text-[10px] text-muted-foreground">Markdown supported</span>
                  </label>
                  <textarea
                    id="proj-requirements"
                    disabled={isSubmitting}
                    placeholder={`- Feature 1: Sub-second latency on search endpoints&#10;- Feature 2: Role-based permissions matrix&#10;- Feature 3: CI/CD test automation covering >85%`}
                    rows={8}
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background/80 px-3 py-2.5 font-mono text-xs leading-relaxed text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all resize-none"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: Timeline & Team */}
            {activeTab === "team" && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Status & Priority */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="proj-status" className="text-xs font-semibold text-foreground">
                      Initial Status
                    </label>
                    <select
                      id="proj-status"
                      disabled={isSubmitting}
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full rounded-lg border border-border bg-background/80 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    >
                      <option value="planning">Planning</option>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="proj-priority" className="text-xs font-semibold text-foreground">
                      Priority Level
                    </label>
                    <select
                      id="proj-priority"
                      disabled={isSubmitting}
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full rounded-lg border border-border bg-background/80 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="proj-start-date" className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      Start Date
                    </label>
                    <input
                      id="proj-start-date"
                      type="date"
                      disabled={isSubmitting}
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        if (validationErrors.dates) {
                          setValidationErrors((prev) => ({ ...prev, dates: "" }));
                        }
                      }}
                      className="w-full rounded-lg border border-border bg-background/80 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="proj-due-date" className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      Target Due Date
                    </label>
                    <input
                      id="proj-due-date"
                      type="date"
                      disabled={isSubmitting}
                      value={dueDate}
                      onChange={(e) => {
                        setDueDate(e.target.value);
                        if (validationErrors.dates) {
                          setValidationErrors((prev) => ({ ...prev, dates: "" }));
                        }
                      }}
                      className="w-full rounded-lg border border-border bg-background/80 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>
                </div>
                {validationErrors.dates && (
                  <p className="text-[11px] font-medium text-rose-400">{validationErrors.dates}</p>
                )}

                {/* Team Members */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-indigo-400" />
                      Workspace Collaborators
                    </label>
                    <span className="text-[10px] text-muted-foreground">
                      {selectedMemberIds.length} of {members.length} selected
                    </span>
                  </div>

                  {members.length === 0 ? (
                    <div className="p-4 rounded-lg border border-border/40 bg-secondary/10 text-center">
                      <p className="text-xs text-muted-foreground">
                        No additional team members found in workspace.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 bg-background/60 border border-border/60 p-3 rounded-xl max-h-40 overflow-y-auto">
                      {members.map((m) => {
                        const isSelected = selectedMemberIds.includes(m.id);
                        return (
                          <button
                            key={m.id}
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => toggleMemberSelection(m.id)}
                            className={cn(
                              "flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium cursor-pointer transition-all border text-left",
                              isSelected
                                ? "bg-indigo-600/15 border-indigo-500/50 text-indigo-300 shadow-sm"
                                : "border-border/40 hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <span className="h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold bg-indigo-600 text-white shrink-0">
                              {m.initials}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium">{m.name}</p>
                              {m.role && (
                                <p className="text-[9px] text-muted-foreground truncate uppercase">
                                  {m.role}
                                </p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: Review & Summary */}
            {activeTab === "review" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="rounded-xl border border-border/60 bg-secondary/20 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Project Summary
                    </span>
                    <span className="text-[11px] font-medium text-indigo-400">{category}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Title</span>
                      <span className="font-semibold text-foreground">
                        {name.trim() || <span className="text-rose-400 italic">Not specified</span>}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Status / Priority</span>
                      <span className="font-medium text-foreground capitalize">
                        {status} · {priority} priority
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Start Date</span>
                      <span className="text-foreground">{startDate || "Not set"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase">Target Due Date</span>
                      <span className="text-foreground">{dueDate || "No deadline"}</span>
                    </div>
                  </div>

                  {description && (
                    <div className="border-t border-border/30 pt-2">
                      <span className="text-muted-foreground block text-[10px] uppercase mb-0.5">Overview</span>
                      <p className="text-xs text-foreground line-clamp-2 leading-relaxed">
                        {description}
                      </p>
                    </div>
                  )}

                  {requirements && (
                    <div className="border-t border-border/30 pt-2">
                      <span className="text-muted-foreground block text-[10px] uppercase mb-0.5">Goals & Requirements</span>
                      <p className="text-xs text-foreground font-mono bg-background/50 p-2 rounded border border-border/30 line-clamp-3">
                        {requirements}
                      </p>
                    </div>
                  )}

                  <div className="border-t border-border/30 pt-2 flex items-center justify-between">
                    <span className="text-muted-foreground text-[10px] uppercase">Assigned Collaborators</span>
                    <span className="text-xs font-semibold text-foreground">
                      {selectedMemberIds.length} {selectedMemberIds.length === 1 ? "member" : "members"}
                    </span>
                  </div>
                </div>

                {!name.trim() && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>Please enter a Project Name under General Details before creating.</span>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border/50 bg-secondary/15 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {activeTab !== "details" && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  if (activeTab === "review") setActiveTab("team");
                  else if (activeTab === "team") setActiveTab("requirements");
                  else if (activeTab === "requirements") setActiveTab("details");
                }}
                className="text-xs font-medium hover:text-foreground cursor-pointer transition-colors"
              >
                ← Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => onClose(false)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            {activeTab !== "review" ? (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  if (activeTab === "details") {
                    if (!name.trim()) {
                      setValidationErrors({ name: "Project name is required." });
                      return;
                    }
                    setActiveTab("requirements");
                  } else if (activeTab === "requirements") {
                    setActiveTab("team");
                  } else if (activeTab === "team") {
                    if (startDate && dueDate && new Date(startDate) > new Date(dueDate)) {
                      setValidationErrors({ dates: "Target due date cannot be earlier than start date." });
                      return;
                    }
                    setActiveTab("review");
                  }
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-secondary text-foreground hover:bg-secondary/80 border border-border transition-colors cursor-pointer"
              >
                Continue →
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isSubmitting || !name.trim()}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer",
                isSubmitting || !name.trim()
                  ? "bg-indigo-600/50 cursor-not-allowed opacity-70"
                  : "bg-indigo-600 hover:bg-indigo-500 active:scale-95"
              )}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Creating Project...</span>
                </>
              ) : (
                <>
                  <FolderPlus className="h-3.5 w-3.5" />
                  <span>Create Project</span>
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
