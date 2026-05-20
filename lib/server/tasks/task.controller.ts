import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";

import { TASK_PRIORITIES, TASK_STATUSES, TaskModel } from "@/lib/db/models";
import { taskService } from "@/lib/server/tasks/task.service";
import { realtimeBroker } from "@/lib/server/realtime-broker";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid id.");

const createTaskBodySchema = z.object({
  workspaceId: objectIdSchema,
  projectId: objectIdSchema,
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  assigneeId: objectIdSchema.optional().or(z.literal("")),
  dueDate: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || !Number.isNaN(Date.parse(v)), "Invalid dueDate."),
});

const updateTaskBodySchema = z.object({
  title: z.string().trim().min(2).max(160).optional(),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  assigneeId: objectIdSchema.optional().or(z.literal("")),
  dueDate: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((v) => !v || !Number.isNaN(Date.parse(v)), "Invalid dueDate."),
});

export async function requireAuth() {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false as const, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { ok: true as const, userId };
}

interface SeededAssignee {
  _id?: { toString(): string } | string;
  name?: string;
  avatarUrl?: string;
}

interface TaskInputDoc {
  toObject?: () => {
    _id?: { toString(): string } | string;
    title?: string;
    priority?: string;
    status?: string;
    assigneeId?: SeededAssignee | null;
    dueDate?: string | Date | null;
  };
  _id?: { toString(): string } | string;
  title?: string;
  priority?: string;
  status?: string;
  assigneeId?: SeededAssignee | null;
  dueDate?: string | Date | null;
}

function mapTaskDocToKanbanTask(doc: TaskInputDoc) {
  if (!doc) return null;
  const plainDoc = typeof doc.toObject === "function" ? doc.toObject() : doc;
  
  const assigneeDoc = plainDoc.assigneeId;
  const name = assigneeDoc?.name || "Unassigned";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  return {
    id: plainDoc._id?.toString() || "",
    title: plainDoc.title || "",
    priority: (plainDoc.priority || "medium") as "low" | "medium" | "high" | "urgent",
    status: (plainDoc.status || "todo") as "todo" | "in-progress" | "in-review" | "done",
    assignee: {
      id: assigneeDoc?._id?.toString() || "unassigned",
      name,
      initials,
      avatarUrl: assigneeDoc?.avatarUrl || undefined,
    },
    dueDate: plainDoc.dueDate ? new Date(plainDoc.dueDate).toISOString().split("T")[0] : "",
  };
}

export const taskController = {
  async create(req: NextRequest) {
    const authed = await requireAuth();
    if (!authed.ok) return authed.response;

    const json = await req.json().catch(() => null);
    const parsed = createTaskBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const doc = await taskService.create({
      ...parsed.data,
      description: parsed.data.description ?? "",
      assigneeId: parsed.data.assigneeId || undefined,
      dueDate: parsed.data.dueDate || undefined,
    });

    const mapped = mapTaskDocToKanbanTask(doc);

    // Publish realtime update
    if (mapped) {
      await realtimeBroker.publish(doc.projectId.toString(), "taskCreated", mapped);
    }

    return NextResponse.json({ task: mapped }, { status: 201 });
  },

  async update(taskId: string, req: NextRequest) {
    const authed = await requireAuth();
    if (!authed.ok) return authed.response;

    const json = await req.json().catch(() => null);
    const parsed = updateTaskBodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    // Fetch the task before update to determine if it is a move or update
    const originalTask = await TaskModel.findById(taskId).select("status").lean();
    const originalStatus = originalTask?.status;

    const updated = await taskService.update({
      taskId,
      ...parsed.data,
      assigneeId: parsed.data.assigneeId === "" ? "" : parsed.data.assigneeId,
      dueDate: parsed.data.dueDate || undefined,
    });

    if (!updated) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const mapped = mapTaskDocToKanbanTask(updated);

    // Publish realtime update
    if (mapped) {
      const eventName = originalStatus !== updated.status ? "taskMoved" : "taskUpdated";
      await realtimeBroker.publish(updated.projectId.toString(), eventName, mapped);
    }

    return NextResponse.json({ task: mapped }, { status: 200 });
  },

  async remove(taskId: string) {
    const authed = await requireAuth();
    if (!authed.ok) return authed.response;

    const deleted = await taskService.remove(taskId);
    if (!deleted) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    // Publish realtime update
    await realtimeBroker.publish(deleted.projectId.toString(), "taskDeleted", {
      taskId,
      projectId: deleted.projectId.toString(),
    });

    return NextResponse.json({ ok: true }, { status: 200 });
  },

  async listByProject(req: NextRequest) {
    const authed = await requireAuth();
    if (!authed.ok) return authed.response;

    const url = new URL(req.url);
    let projectId = url.searchParams.get("projectId") ?? "";

    if (!projectId || projectId === "undefined" || projectId === "null") {
      const seeded = await taskService.ensureSeededData();
      projectId = seeded.projectId;
    }

    const parsed = objectIdSchema.safeParse(projectId);
    if (!parsed.success) {
      return NextResponse.json({ error: "projectId is required and must be valid" }, { status: 400 });
    }

    const tasks = await taskService.listByProject({ projectId });
    const mappedTasks = tasks.map(mapTaskDocToKanbanTask).filter(Boolean);
    return NextResponse.json({ tasks: mappedTasks, projectId }, { status: 200 });
  },
};

