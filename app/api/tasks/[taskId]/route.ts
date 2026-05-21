/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse, type NextRequest } from "next/server";

import { taskController } from "@/lib/server/tasks/task.controller";

export const runtime = "nodejs";

type Params = { taskId: string };

export async function PATCH(request: NextRequest, { params }: {params: Promise<{ taskId: string }>}) {
  try {
    const { taskId } = await params;
    return await taskController.update(taskId, request);
  } catch (error) {
    console.error("PATCH /api/tasks/[taskId] Error:", error);
    return NextResponse.json({ error: "Fallback mode active" }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    return await taskController.remove(taskId);
  } catch (error) {
    console.error("DELETE /api/tasks/[taskId] Error:", error);
    return NextResponse.json({ error: "Fallback mode active" }, { status: 400 });
  }
}

