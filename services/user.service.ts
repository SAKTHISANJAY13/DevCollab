import { apiClient } from "@/lib/api-client";
import type { User } from "@/types";

const BASE = "/api/users";

export const userService = {
  getCurrent: () => apiClient<User>(`${BASE}/me`),
  list: () => apiClient<User[]>(BASE),
};
