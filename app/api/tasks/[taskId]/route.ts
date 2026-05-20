/* eslint-disable @typescript-eslint/no-unused-vars */
import type { NextRequest } from "next/server";

import { taskController } from "@/lib/server/tasks/task.controller";

export const runtime = "nodejs";

type Params = { taskId: string };

export async function PATCH(request: NextRequest, { params }: {params: Promise<{ taskId: string }>}) {
  const { taskId } = await params;
  return taskController.update(taskId, request);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params

  try {
    // delete logic here

    return Response.json({
      success: true,
    })
  } catch (error) {
    return Response.json(
      { error: "Failed to delete task" },
      { status: 500 }
    )
  }
}

