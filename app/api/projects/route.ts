import { NextResponse, type NextRequest } from "next/server";
import { projectService } from "@/lib/server/services/project.service";
import { connectMongoose } from "@/lib/db/mongoose";
import { getCurrentMongoUser } from "@/lib/server/auth/getCurrentMongoUser";
import { getActiveWorkspace } from "@/lib/server/auth/getActiveWorkspace";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getCurrentMongoUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongoose();
    const workspace = await getActiveWorkspace(user);
    if (!workspace) {
      return NextResponse.json({ projects: [] }, { status: 200 });
    }
    const projects = await projectService.list(workspace._id.toString());
    return NextResponse.json({ projects }, { status: 200 });
  } catch (err) {
    console.error("GET /api/projects error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentMongoUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const name = (body.name || body.title || "").trim();
    if (!name) {
      return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    // Validate dates if both are provided
    if (body.startDate && body.dueDate) {
      const start = new Date(body.startDate);
      const due = new Date(body.dueDate);
      if (isNaN(start.getTime()) || isNaN(due.getTime())) {
        return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
      }
      if (start.getTime() > due.getTime()) {
        return NextResponse.json({ error: "Start date cannot be after target due date" }, { status: 400 });
      }
    }

    await connectMongoose();
    const workspace = await getActiveWorkspace(user);
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    // Verify workspace membership authorization
    const isMember = (workspace.members || []).some(
      (m: any) => (m.userId?._id || m.userId)?.toString() === user._id.toString()
    );
    const isOwner = workspace.ownerId?.toString() === user._id.toString();
    if (!isMember && !isOwner) {
      return NextResponse.json({ error: "Forbidden: You are not a member of this workspace" }, { status: 403 });
    }

    // Validate assigned team members to ensure they belong to this workspace
    const workspaceMemberIds = new Set<string>();
    if (workspace.ownerId) {
      workspaceMemberIds.add(workspace.ownerId.toString());
    }
    (workspace.members || []).forEach((m: any) => {
      const uid = (m.userId?._id || m.userId)?.toString();
      if (uid) workspaceMemberIds.add(uid);
    });

    const requestedMembers = Array.isArray(body.members) ? body.members : [];
    const validMemberIds = requestedMembers
      .map((m: any) => (typeof m === "object" ? (m._id || m.id) : m)?.toString())
      .filter((id: string) => Boolean(id) && workspaceMemberIds.has(id));

    const userDisplayName = user.name || "Developer";
    const userInitials = user.name
      ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
      : "D";

    const project = await projectService.create(workspace._id.toString(), {
      name,
      description: typeof body.description === "string" ? body.description.trim() : "",
      status: body.status || "planning",
      priority: body.priority || "medium",
      progress: typeof body.progress === "number" ? body.progress : (body.status === "completed" ? 100 : 0),
      startDate: body.startDate ? new Date(body.startDate).toISOString().split("T")[0] : undefined,
      dueDate: body.dueDate ? new Date(body.dueDate).toISOString().split("T")[0] : undefined,
      category: typeof body.category === "string" ? body.category.trim() : undefined,
      requirements: typeof body.requirements === "string" ? body.requirements.trim() : undefined,
      members: validMemberIds,
      user: {
        name: userDisplayName,
        initials: userInitials,
        avatarUrl: user.avatarUrl,
      },
      createdBy: user._id.toString(),
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/projects error:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
