import mongoose from "mongoose";

import { connectMongoose } from "@/lib/db/mongoose";
import { TaskModel, UserModel, WorkspaceModel, ProjectModel, type TaskStatus, type TaskPriority } from "@/lib/db/models";

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

    const populated = await TaskModel.findById(doc._id).populate("assigneeId");
    return populated;
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
    }).populate("assigneeId");

    return doc;
  },

  async remove(taskId: string) {
    await connectMongoose();
    const doc = await TaskModel.findByIdAndDelete(toObjectId(taskId)).populate("assigneeId");
    return doc;
  },

  async listByProject(params: { projectId: string }) {
    await connectMongoose();
    const docs = await TaskModel.find({ projectId: toObjectId(params.projectId) })
      .populate("assigneeId")
      .sort({ createdAt: -1 })
      .lean();
    return docs;
  },

  async ensureSeededData() {
    await connectMongoose();

    let workspace = await WorkspaceModel.findOne();
    let project = await ProjectModel.findOne();

    if (workspace && project) {
      return { workspaceId: workspace._id.toString(), projectId: project._id.toString() };
    }

    console.log("[Seeding] Database is empty or missing project/workspace. Running initial seed...");

    let user1 = await UserModel.findOne({ email: "alex@example.com" });
    if (!user1) {
      user1 = await UserModel.create({
        clerkUserId: "mock_clerk_user_1",
        email: "alex@example.com",
        name: "Alex Rivera",
        avatarUrl: "",
      });
    }

    let user2 = await UserModel.findOne({ email: "sam@example.com" });
    if (!user2) {
      user2 = await UserModel.create({
        clerkUserId: "mock_clerk_user_2",
        email: "sam@example.com",
        name: "Sam Lee",
        avatarUrl: "",
      });
    }

    let user3 = await UserModel.findOne({ email: "jordan@example.com" });
    if (!user3) {
      user3 = await UserModel.create({
        clerkUserId: "mock_clerk_user_3",
        email: "jordan@example.com",
        name: "Jordan Kim",
        avatarUrl: "",
      });
    }

    let user4 = await UserModel.findOne({ email: "casey@example.com" });
    if (!user4) {
      user4 = await UserModel.create({
        clerkUserId: "mock_clerk_user_4",
        email: "casey@example.com",
        name: "Casey Morgan",
        avatarUrl: "",
      });
    }

    if (!workspace) {
      workspace = await WorkspaceModel.create({
        name: "Default Workspace",
        slug: "default-workspace",
        description: "Default workspace created automatically.",
        ownerId: user1._id,
        members: [
          { userId: user1._id, role: "owner" },
          { userId: user2._id, role: "member" },
          { userId: user3._id, role: "member" },
          { userId: user4._id, role: "member" },
        ],
      });
    }

    if (!project) {
      project = await ProjectModel.create({
        workspaceId: workspace._id,
        name: "Default Project",
        slug: "default-project",
        description: "Default project created automatically.",
        status: "active",
      });
    }

    const taskCount = await TaskModel.countDocuments({ projectId: project._id });
    if (taskCount === 0) {
      console.log("[Seeding] Seeding initial tasks...");
      const initialTasks = [
        {
          workspaceId: workspace._id,
          projectId: project._id,
          title: "Design onboarding flow",
          priority: "high",
          status: "todo",
          assigneeId: user1._id,
          dueDate: new Date("2026-05-22"),
        },
        {
          workspaceId: workspace._id,
          projectId: project._id,
          title: "Document API error codes",
          priority: "low",
          status: "todo",
          assigneeId: user2._id,
          dueDate: new Date("2026-05-28"),
        },
        {
          workspaceId: workspace._id,
          projectId: project._id,
          title: "Implement OAuth refresh",
          priority: "urgent",
          status: "in-progress",
          assigneeId: user3._id,
          dueDate: new Date("2026-05-21"),
        },
        {
          workspaceId: workspace._id,
          projectId: project._id,
          title: "Webhook retries & backoff",
          priority: "medium",
          status: "in-progress",
          assigneeId: user1._id,
          dueDate: new Date("2026-05-24"),
        },
        {
          workspaceId: workspace._id,
          projectId: project._id,
          title: "QA billing edge cases",
          priority: "high",
          status: "in-review",
          assigneeId: user4._id,
          dueDate: new Date("2026-05-23"),
        },
        {
          workspaceId: workspace._id,
          projectId: project._id,
          title: "Release notes v2.4",
          priority: "low",
          status: "done",
          assigneeId: user2._id,
          dueDate: new Date("2026-05-18"),
        },
        {
          workspaceId: workspace._id,
          projectId: project._id,
          title: "Migrate CI to cached builds",
          priority: "medium",
          status: "done",
          assigneeId: user3._id,
          dueDate: new Date("2026-05-15"),
        },
      ];

      await TaskModel.insertMany(initialTasks);
    }

    return { workspaceId: workspace._id.toString(), projectId: project._id.toString() };
  },
};

