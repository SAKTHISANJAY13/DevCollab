import { Schema, model, models, type InferSchemaType, type Types } from "mongoose";

export const WORKSPACE_ROLES = ["owner", "admin", "member"] as const;
export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];

const WorkspaceMemberSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    role: { type: String, enum: WORKSPACE_ROLES, required: true, default: "member" },
  },
  { _id: false },
);

export const WorkspaceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    members: { type: [WorkspaceMemberSchema], default: [] },
  },
  { timestamps: true },
);

export type WorkspaceMember = {
  userId: Types.ObjectId;
  role: WorkspaceRole;
};

export type WorkspaceDoc = InferSchemaType<typeof WorkspaceSchema> & {
  members: WorkspaceMember[];
};

export const WorkspaceModel = models.Workspace ?? model("Workspace", WorkspaceSchema);

