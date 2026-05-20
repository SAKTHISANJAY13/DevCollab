import { Schema, model, models, type InferSchemaType } from "mongoose";

export const PROJECT_STATUSES = ["active", "archived"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const ProjectSchema = new Schema(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, index: true },
    description: { type: String },
    status: { type: String, enum: PROJECT_STATUSES, default: "active", index: true },
  },
  { timestamps: true },
);

// Per-workspace unique project slug
ProjectSchema.index({ workspaceId: 1, slug: 1 }, { unique: true });

export type ProjectDoc = InferSchemaType<typeof ProjectSchema>;

export const ProjectModel = models.Project ?? model("Project", ProjectSchema);

