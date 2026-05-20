import type { NextRequest } from "next/server";

import { taskController } from "@/lib/server/tasks/task.controller";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  return taskController.listByProject(req);
}

export async function POST(req: NextRequest) {
  return taskController.create(req);
}

