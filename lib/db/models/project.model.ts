import { Schema, model, models, type InferSchemaType } from "mongoose";

export const PROJECT_STATUSES = ["planning", "active", "paused", "completed", "archived"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export const PROJECT_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type ProjectPriority = (typeof PROJECT_PRIORITIES)[number];

export const PROJECT_CATEGORIES = [
  "Web Application",
  "Mobile App",
  "API & Backend",
  "DevOps / Infrastructure",
  "Library / Package",
  "Design System",
  "Other",
] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export const ProjectSchema = new Schema(
  {
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, index: true },
    description: { type: String },
    status: { type: String, enum: PROJECT_STATUSES, default: "planning", index: true },
    priority: { type: String, enum: PROJECT_PRIORITIES, default: "medium", index: true },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    startDate: { type: Date },
    dueDate: { type: Date },
    category: { type: String, trim: true },
    requirements: { type: String, trim: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  },
);

// Virtual for title mapping to name
ProjectSchema.virtual("title")
  .get(function (this: any) {
    return this.name;
  })
  .set(function (this: any, val: string) {
    this.name = val;
  });

// Per-workspace unique project slug
ProjectSchema.index({ workspaceId: 1, slug: 1 }, { unique: true });
ProjectSchema.index({ workspaceId: 1, status: 1 });
ProjectSchema.index({ workspaceId: 1, createdAt: -1 });

export type ProjectDoc = InferSchemaType<typeof ProjectSchema> & {
  title?: string;
  startDate?: Date;
  category?: string;
  requirements?: string;
};

export const ProjectModel = models.Project ?? model("Project", ProjectSchema);

