import { apiClient } from "@/lib/api-client";
import type { PaginatedResponse, Project } from "@/types";

const BASE = "/api/projects";

export const projectService = {
  list: (page = 1) =>
    apiClient<PaginatedResponse<Project>>(`${BASE}?page=${page}`),
  getById: (id: string) => apiClient<Project>(`${BASE}/${id}`),
};
