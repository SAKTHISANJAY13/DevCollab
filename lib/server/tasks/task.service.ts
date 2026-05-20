import mongoose from "mongoose";

import { connectMongoose } from "@/lib/db/mongoose";
import { TaskModel, type TaskStatus, type TaskPriority } from "@/lib/db/models";

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
    await connectMongoose();

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

    return doc;
  },

  async update(input: UpdateTaskInput) {
    await connectMongoose();

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
    });

    return doc;
  },

  async remove(taskId: string) {
    await connectMongoose();
    const doc = await TaskModel.findByIdAndDelete(toObjectId(taskId));
    return doc;
  },

  async listByProject(params: { projectId: string }) {
    await connectMongoose();
    const docs = await TaskModel.find({ projectId: toObjectId(params.projectId) })
      .sort({ createdAt: -1 })
      .lean();
    return docs;
  },
};

