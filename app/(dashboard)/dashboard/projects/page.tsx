"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectFilters } from "@/components/projects/project-filters";
import { projectService } from "@/services";
import { useSocket } from "@/hooks/use-socket";
import { useProjectModal } from "@/providers/project-modal-provider";

function formatProjectItem(p: any) {
  const id = (p._id || p.id)?.toString();
  return {
    id,
    _id: id,
    workspaceId: p.workspaceId?.toString() || "",
    title: p.title || p.name || "Untitled Project",
    name: p.name || p.title || "Untitled Project",
    description: p.description || "Collaborative dev workspace project.",
    requirements: p.requirements || "",
    category: p.category || "",
    progress: typeof p.progress === "number" ? p.progress : 0,
    priority: p.priority || "medium",
    status: p.status || "active",
    startDate: p.startDate ? new Date(p.startDate).toISOString().split("T")[0] : "",
    dueDate: p.dueDate ? new Date(p.dueDate).toISOString().split("T")[0] : "",
    members: (p.members || []).map((m: any) => ({
      id: (m._id || m.id)?.toString() || "m",
      name: m.name || "Member",
      initials: m.name
        ? m.name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
        : "M",
      role: m.role || "Developer",
      avatarColor: "bg-indigo-600 text-indigo-100",
    })),
    tasks: p.tasks || [],
    activities: p.activities || [],
  };
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const { socket } = useSocket({ projectId: "global" });
  const { openCreateModal } = useProjectModal();

  const fetchProjects = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const list = await projectService.list();
      const formatted = list.map(formatProjectItem);
      setProjects(formatted);
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addOrUpdateProject = useCallback((rawProject: any) => {
    if (!rawProject) return;
    const formatted = formatProjectItem(rawProject);
    setProjects((prev) => {
      const existsIndex = prev.findIndex(
        (p) => p.id === formatted.id || (p._id && p._id === formatted.id)
      );
      if (existsIndex >= 0) {
        const next = [...prev];
        next[existsIndex] = { ...next[existsIndex], ...formatted };
        return next;
      }
      return [formatted, ...prev];
    });
  }, []);

  // Fetch projects on initial mount
  useEffect(() => {
    fetchProjects(true);
  }, [fetchProjects]);

  // Listen to in-app custom event for instant creator UI updates
  useEffect(() => {
    const handleCreatedEvent = (e: any) => {
      if (e.detail) {
        addOrUpdateProject(e.detail);
        fetchProjects(false);
      }
    };

    window.addEventListener("devcollab:projectCreated", handleCreatedEvent);
    return () => {
      window.removeEventListener("devcollab:projectCreated", handleCreatedEvent);
    };
  }, [addOrUpdateProject, fetchProjects]);

  // Socket.IO real-time listener for collaborator sync
  useEffect(() => {
    if (!socket) return;

    const onProjectCreated = (newProject: any) => {
      console.log("[Projects] Socket projectCreated received:", newProject);
      addOrUpdateProject(newProject);
      fetchProjects(false);
    };

    const onProjectUpdated = (updatedProject: any) => {
      console.log("[Projects] Socket projectUpdated received:", updatedProject);
      addOrUpdateProject(updatedProject);
      fetchProjects(false);
    };

    const onProjectDeleted = (data: { _id: string }) => {
      console.log("[Projects] Socket projectDeleted received:", data);
      const delId = data?._id?.toString();
      setProjects((prev) => prev.filter((p) => p.id !== delId && p._id !== delId));
    };

    socket.on("projectCreated", onProjectCreated);
    socket.on("projectUpdated", onProjectUpdated);
    socket.on("projectDeleted", onProjectDeleted);

    return () => {
      socket.off("projectCreated", onProjectCreated);
      socket.off("projectUpdated", onProjectUpdated);
      socket.off("projectDeleted", onProjectDeleted);
    };
  }, [socket, addOrUpdateProject, fetchProjects]);

  const handleOpenCreate = () => {
    openCreateModal({
      onCreated: (newProj) => {
        addOrUpdateProject(newProj);
        fetchProjects(false);
      },
    });
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.category && project.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;

    const matchesPriority =
      priorityFilter === "all" || project.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Collaborative Projects"
          description="Manage repositories, track goals, and review milestones across your workspace."
        />
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-600/10 hover:bg-indigo-500 hover:shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer w-fit"
        >
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      {/* Project Filters */}
      <ProjectFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
      />

      {/* Grid of Projects */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
          <p className="text-sm text-muted-foreground">Loading workspace projects...</p>
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 rounded-xl border border-border/30 bg-card/10 space-y-3">
          <p className="text-sm text-muted-foreground">No projects found matching the current search criteria.</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
              setPriorityFilter("all");
            }}
            className="text-xs font-semibold text-indigo-400 hover:underline hover:text-indigo-300 cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
