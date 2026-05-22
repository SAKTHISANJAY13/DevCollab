import mongoose from "mongoose";

import { connectMongoose, isMockMode } from "@/lib/db/mongoose";
import { TaskModel, type TaskStatus, type TaskPriority } from "@/lib/db/models";

export interface MockTask {
  _id: string;
  projectId: string;
  workspaceId?: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  assigneeId?: { _id: string; name: string; avatarUrl?: string };
  dueDate?: Date | string;
}

const mockTasks: MockTask[] = [
  {
    _id: "1",
    projectId: "000000000000000000000000",
    title: "Setup authentication",
    status: "todo",
    priority: "high",
    assigneeId: { _id: "unassigned", name: "Unassigned" },
  },
  {
    _id: "2",
    projectId: "000000000000000000000000",
    title: "Build realtime Kanban",
    status: "in-progress",
    priority: "medium",
    assigneeId: { _id: "unassigned", name: "Unassigned" },
  },
  {
    _id: "3",
    projectId: "000000000000000000000000",
    title: "Deploy application",
    status: "done",
    priority: "high",
    assigneeId: { _id: "unassigned", name: "Unassigned" },
  }
];

export type CreateTaskInput = {
  workspaceId: string;
  projectId: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  dueDate?: string;
};

export type UpdateTaskInput = Partial<Omit<CreateTaskInput, "workspaceId" | "projectId">> & {
  taskId: string;
};

function toObjectId(id: string) {
  return new mongoose.Types.ObjectId(id);
}

export const taskService = {
  async create(input: CreateTaskInput) {
    const conn = await connectMongoose();

    if (!conn || isMockMode) {
      console.log("RUNNING IN MOCK DATA MODE");
      const newTask: MockTask = {
        _id: Math.random().toString(36).substring(7),
        projectId: input.projectId || "000000000000000000000000",
        workspaceId: input.workspaceId,
        title: input.title,
        description: input.description ?? "",
        status: input.status ?? "todo",
        priority: input.priority ?? "medium",
        assigneeId: input.assigneeId ? { _id: input.assigneeId, name: "Mock User" } : { _id: "unassigned", name: "Unassigned" },
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      };
      mockTasks.push(newTask);
      return newTask;
    }

    try {
      const doc = await TaskModel.create({
        workspaceId: toObjectId(input.workspaceId),
        projectId: toObjectId(input.projectId),
        title: input.title,
        description: input.description ?? "",
        status: input.status ?? "todo",
        priority: input.priority ?? "medium",
        assigneeId: input.assigneeId ? toObjectId(input.assigneeId) : undefined,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      });

      const populated = await TaskModel.findById(doc._id).populate("assigneeId");
      return populated;
    } catch (dbErr) {
      console.error("Database operation failed, falling back to mock mode:", dbErr);
      console.log("RUNNING IN MOCK DATA MODE");
      const newTask: MockTask = {
        _id: Math.random().toString(36).substring(7),
        projectId: input.projectId || "000000000000000000000000",
        workspaceId: input.workspaceId,
        title: input.title,
        description: input.description ?? "",
        status: input.status ?? "todo",
        priority: input.priority ?? "medium",
        assigneeId: input.assigneeId ? { _id: input.assigneeId, name: "Mock User" } : { _id: "unassigned", name: "Unassigned" },
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      };
      mockTasks.push(newTask);
      return newTask;
    }
  },

  async getById(taskId: string) {
    const conn = await connectMongoose();
    
    if (!conn || isMockMode) {
      console.log("RUNNING IN MOCK DATA MODE");
      return mockTasks.find((t) => t._id === taskId) || null;
    }

    try {
      return await TaskModel.findById(toObjectId(taskId)).lean();
    } catch (dbErr) {
      console.error("Database operation failed, falling back to mock mode:", dbErr);
      console.log("RUNNING IN MOCK DATA MODE");
      return mockTasks.find((t) => t._id === taskId) || null;
    }
  },

  async update(input: UpdateTaskInput) {
    const conn = await connectMongoose();

    if (!conn || isMockMode) {
      console.log("RUNNING IN MOCK DATA MODE");
      const idx = mockTasks.findIndex((t) => t._id === input.taskId);
      if (idx === -1) return null;
      const updatedTask = { ...mockTasks[idx] };
      if (input.title !== undefined) updatedTask.title = input.title;
      if (input.description !== undefined) updatedTask.description = input.description;
      if (input.status !== undefined) updatedTask.status = input.status;
      if (input.priority !== undefined) updatedTask.priority = input.priority;
      if (input.assigneeId !== undefined) {
        updatedTask.assigneeId = input.assigneeId ? { _id: input.assigneeId, name: "Mock User" } : { _id: "unassigned", name: "Unassigned" };
      }
      if (input.dueDate !== undefined) {
        updatedTask.dueDate = input.dueDate ? new Date(input.dueDate) : undefined;
      }
      mockTasks[idx] = updatedTask;
      return updatedTask;
    }

    try {
      const update: Record<string, unknown> = {};
      if (input.title !== undefined) update.title = input.title;
      if (input.description !== undefined) update.description = input.description;
      if (input.status !== undefined) update.status = input.status;
      if (input.priority !== undefined) update.priority = input.priority;
      if (input.assigneeId !== undefined) {
        update.assigneeId = input.assigneeId ? toObjectId(input.assigneeId) : undefined;
      }
      if (input.dueDate !== undefined) {
        update.dueDate = input.dueDate ? new Date(input.dueDate) : undefined;
      }

      const doc = await TaskModel.findByIdAndUpdate(toObjectId(input.taskId), update, {
        new: true,
      }).populate("assigneeId");

      return doc;
    } catch (dbErr) {
      console.error("Database operation failed, falling back to mock mode:", dbErr);
      console.log("RUNNING IN MOCK DATA MODE");
      const idx = mockTasks.findIndex((t) => t._id === input.taskId);
      if (idx === -1) return null;
      const updatedTask = { ...mockTasks[idx] };
      if (input.title !== undefined) updatedTask.title = input.title;
      if (input.description !== undefined) updatedTask.description = input.description;
      if (input.status !== undefined) updatedTask.status = input.status;
      if (input.priority !== undefined) updatedTask.priority = input.priority;
      if (input.assigneeId !== undefined) {
        updatedTask.assigneeId = input.assigneeId ? { _id: input.assigneeId, name: "Mock User" } : { _id: "unassigned", name: "Unassigned" };
      }
      if (input.dueDate !== undefined) {
        updatedTask.dueDate = input.dueDate ? new Date(input.dueDate) : undefined;
      }
      mockTasks[idx] = updatedTask;
      return updatedTask;
    }
  },

  async remove(taskId: string) {
    const conn = await connectMongoose();

    if (!conn || isMockMode) {
      console.log("RUNNING IN MOCK DATA MODE");
      const idx = mockTasks.findIndex((t) => t._id === taskId);
      if (idx === -1) return null;
      const [removed] = mockTasks.splice(idx, 1);
      return removed;
    }

    try {
      const doc = await TaskModel.findByIdAndDelete(toObjectId(taskId)).populate("assigneeId");
      return doc;
    } catch (dbErr) {
      console.error("Database operation failed, falling back to mock mode:", dbErr);
      console.log("RUNNING IN MOCK DATA MODE");
      const idx = mockTasks.findIndex((t) => t._id === taskId);
      if (idx === -1) return null;
      const [removed] = mockTasks.splice(idx, 1);
      return removed;
    }
  },

  async listByProject(params: { projectId?: string }) {
    const conn = await connectMongoose();

    if (!conn || isMockMode) {
      console.log("RUNNING IN MOCK DATA MODE");
      if (params.projectId) {
        mockTasks.forEach((t) => {
          t.projectId = params.projectId!;
        });
        return mockTasks.filter(t => t.projectId === params.projectId);
      }
      return [...mockTasks];
    }

    try {
      const query = params.projectId ? { projectId: toObjectId(params.projectId) } : {};
      const docs = await TaskModel.find(query)
        .populate("assigneeId")
        .sort({ createdAt: -1 })
        .lean();
      return docs;
    } catch (dbErr) {
      console.error("Database operation failed, falling back to mock mode:", dbErr);
      console.log("RUNNING IN MOCK DATA MODE");
      if (params.projectId) {
        mockTasks.forEach((t) => {
          t.projectId = params.projectId!;
        });
        return mockTasks.filter(t => t.projectId === params.projectId);
      }
      return [...mockTasks];
    }
  },
};
