import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";

import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/db/models";
import { taskService } from "@/lib/server/tasks/task.service";

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

    return NextResponse.json({ task: doc }, { status: 201 });
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

    const updated = await taskService.update({
      taskId,
      ...parsed.data,
      assigneeId: parsed.data.assigneeId === "" ? "" : parsed.data.assigneeId,
      dueDate: parsed.data.dueDate || undefined,
    });

    if (!updated) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ task: updated }, { status: 200 });
  },

  async remove(taskId: string) {
    const authed = await requireAuth();
    if (!authed.ok) return authed.response;

    const deleted = await taskService.remove(taskId);
    if (!deleted) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  },

  async listByProject(req: NextRequest) {
    const authed = await requireAuth();
    if (!authed.ok) return authed.response;

    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId") ?? "";
    const parsed = objectIdSchema.safeParse(projectId);
    if (!parsed.success) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const tasks = await taskService.listByProject({ projectId });
    return NextResponse.json({ tasks }, { status: 200 });
  },
};

