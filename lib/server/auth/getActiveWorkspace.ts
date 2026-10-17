import { cache } from "react";
import { cookies } from "next/headers";
import mongoose from "mongoose";
import { connectMongoose } from "@/lib/db/mongoose";
import { WorkspaceModel } from "@/lib/db/models/workspace.model";

const getCachedWorkspace = cache(async (userIdStr: string, workspaceIdFromCookie?: string) => {
  await connectMongoose();
  const userId = new mongoose.Types.ObjectId(userIdStr);

  if (workspaceIdFromCookie && mongoose.isValidObjectId(workspaceIdFromCookie)) {
    const workspace = await WorkspaceModel.findOne({
      _id: new mongoose.Types.ObjectId(workspaceIdFromCookie),
      "members.userId": userId,
    });

    if (workspace) {
      return workspace;
    }
  }

  // Fallback to first workspace the user belongs to
  const workspace = await WorkspaceModel.findOne({ "members.userId": userId });
  return workspace || null;
});

export async function getActiveWorkspace(user: { _id: mongoose.Types.ObjectId | string }) {
  const cookieStore = await cookies();
  const workspaceIdFromCookie = cookieStore.get("workspaceId")?.value;
  const userIdStr = user._id.toString();

  const workspace = await getCachedWorkspace(userIdStr, workspaceIdFromCookie);

  if (workspace && workspaceIdFromCookie !== workspace._id.toString()) {
    try {
      cookieStore.set("workspaceId", workspace._id.toString(), {
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    } catch {
      // Ignored in Server Component render where cookies are read-only
    }
  }

  return workspace;
}
