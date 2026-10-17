"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { CreateProjectModal } from "@/components/projects/create-project-modal";
import { projectService } from "@/services/project.service";

type OpenModalOptions = {
  onCreated?: (project: any) => void;
};

type ProjectModalContextType = {
  isOpen: boolean;
  openCreateModal: (options?: OpenModalOptions) => void;
  closeCreateModal: () => void;
};

const ProjectModalContext = createContext<ProjectModalContextType>({
  isOpen: false,
  openCreateModal: () => {},
  closeCreateModal: () => {},
});

export const useProjectModal = () => useContext(ProjectModalContext);

export function ProjectModalProvider({
  children,
  workspaceId,
}: {
  children: React.ReactNode;
  workspaceId?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [onCreatedCallback, setOnCreatedCallback] = useState<((project: any) => void) | null>(null);

  const fetchMembers = useCallback(async () => {
    try {
      const res = await fetch("/api/workspace");
      if (!res.ok) return;
      const data = await res.json();
      if (data.workspace?.members) {
        const list = (data.workspace.members || [])
          .map((m: any) => {
            const u = m.userId;
            if (!u) return null;
            return {
              id: u._id || u.id,
              name: u.name || "Member",
              initials: u.name
                ? u.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2)
                : "M",
              role: m.role || "Developer",
              email: u.email,
            };
          })
          .filter(Boolean);
        setMembers(list);
      }
    } catch (err) {
      console.error("[ProjectModalProvider] Failed to fetch workspace members:", err);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const openCreateModal = useCallback(
    (options?: OpenModalOptions) => {
      if (options?.onCreated) {
        setOnCreatedCallback(() => options.onCreated);
      } else {
        setOnCreatedCallback(null);
      }
      setIsOpen(true);
      fetchMembers();
    },
    [fetchMembers]
  );

  const closeCreateModal = useCallback(() => {
    setIsOpen(false);
    setOnCreatedCallback(null);
  }, []);

  const handleCreateProject = async (newProjectInput: any) => {
    try {
      const created = await projectService.create(newProjectInput);
      
      // Dispatch browser event for immediate UI updates
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("devcollab:projectCreated", {
            detail: created,
          })
        );
      }

      if (onCreatedCallback) {
        onCreatedCallback(created);
      }

      return created;
    } catch (err) {
      console.error("[ProjectModalProvider] Project creation failed:", err);
      throw err;
    }
  };

  return (
    <ProjectModalContext.Provider value={{ isOpen, openCreateModal, closeCreateModal }}>
      {children}
      <CreateProjectModal
        isOpen={isOpen}
        onClose={closeCreateModal}
        onCreateProject={handleCreateProject}
        members={members}
      />
    </ProjectModalContext.Provider>
  );
}
