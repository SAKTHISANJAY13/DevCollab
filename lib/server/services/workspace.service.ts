import mongoose from "mongoose";
import { connectMongoose } from "@/lib/db/mongoose";
import { WorkspaceModel, ProjectModel, TaskModel, ActivityModel } from "@/lib/db/models";
import { invitationService } from "./invitation.service";

export const workspaceService = {
  async createWorkspace(ownerId: string, name: string, slug: string, description?: string) {
    const conn = await connectMongoose();
    if (!conn) throw new Error("Database connection failed");

    try {
      const workspace = await WorkspaceModel.create({
        name,
        slug,
        description: description || "",
        ownerId: ownerId,
        members: [{ userId: ownerId, role: "owner" }],
      });
      return workspace;
    } catch (err) {
      console.error("Failed to create workspace in MongoDB:", err);
      throw err;
    }
  },

  async getMetrics(workspaceId: string) {
    const conn = await connectMongoose();
    if (!conn) throw new Error("Database connection failed");
    try {
      const wId = new mongoose.Types.ObjectId(workspaceId);
      const now = new Date();

      // Start of 6 days ago (7 days total including today)
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      const [
        activeProjects,
        tasksCompleted,
        pendingTasks,
        overdueTasks,
        workspace,
        createdDaily,
        completedDaily,
      ] = await Promise.all([
        ProjectModel.countDocuments({ workspaceId: wId, status: { $ne: "completed" } }),
        TaskModel.countDocuments({ workspaceId: wId, status: "done" }),
        TaskModel.countDocuments({ workspaceId: wId, status: { $ne: "done" } }),
        TaskModel.countDocuments({
          workspaceId: wId,
          status: { $ne: "done" },
          dueDate: { $lt: now },
        }),
        WorkspaceModel.findById(wId, { members: 1 }).lean(),
        TaskModel.aggregate([
          {
            $match: {
              workspaceId: wId,
              createdAt: { $gte: sevenDaysAgo },
            },
          },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              count: { $sum: 1 },
            },
          },
        ]),
        TaskModel.aggregate([
          {
            $match: {
              workspaceId: wId,
              status: "done",
              updatedAt: { $gte: sevenDaysAgo },
            },
          },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

      const totalMembers = (workspace as any)?.members?.length || 1;
      const onlineMembers = Math.max(1, Math.ceil(totalMembers * 0.75));

      const createdMap = new Map<string, number>(
        (createdDaily || []).map((item: any) => [item._id, item.count])
      );
      const completedMap = new Map<string, number>(
        (completedDaily || []).map((item: any) => [item._id, item.count])
      );

      const velocity: Array<{ name: string; completed: number; created: number }> = [];
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const year = d.getUTCFullYear();
        const month = String(d.getUTCMonth() + 1).padStart(2, "0");
        const day = String(d.getUTCDate()).padStart(2, "0");
        const dateKey = `${year}-${month}-${day}`;

        velocity.push({
          name: days[d.getDay()],
          completed: completedMap.get(dateKey) || 0,
          created: createdMap.get(dateKey) || 0,
        });
      }

      return {
        activeProjects,
        tasksCompleted,
        pendingTasks,
        overdueTasks,
        totalMembers,
        onlineMembers,
        velocity,
      };
    } catch (err) {
      console.error("Failed to get workspace metrics in MongoDB:", err);
      return {
        activeProjects: 0,
        tasksCompleted: 0,
        pendingTasks: 0,
        overdueTasks: 0,
        totalMembers: 1,
        onlineMembers: 1,
        velocity: [],
      };
    }
  },

  async inviteMember(workspaceId: string, email: string, role: string = "member", inviterId?: string) {
    const conn = await connectMongoose();
    if (!conn) throw new Error("Database connection failed");
    try {
      if (!inviterId) {
        throw new Error("Inviter ID is required");
      }
      const { invitation, resent } = await invitationService.createInvitation(
        workspaceId,
        inviterId,
        email,
        role as "admin" | "member"
      );
      return { success: true, invitation, resent };
    } catch (err: any) {
      console.error("Failed to invite member in MongoDB:", err);
      return { success: false, error: err.message || String(err), statusCode: err.statusCode || 400 };
    }
  },

  async deleteWorkspace(workspaceId: string) {
    const conn = await connectMongoose();
    if (!conn) throw new Error("Database connection failed");

    try {
      const wId = new mongoose.Types.ObjectId(workspaceId);
      // Delete tasks associated with this workspace
      await TaskModel.deleteMany({ workspaceId: wId });
      // Delete projects associated with this workspace
      await ProjectModel.deleteMany({ workspaceId: wId });
      // Delete activities associated with this workspace
      await ActivityModel.deleteMany({ workspaceId: wId });
      // Delete the workspace document itself
      await WorkspaceModel.findByIdAndDelete(wId);
      return true;
    } catch (err) {
      console.error(`Failed to delete workspace ${workspaceId}:`, err);
      throw err;
    }
  }
};

