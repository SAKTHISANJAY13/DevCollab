"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { KanbanTaskCard } from "@/components/kanban/kanban-task-card";
import { cn } from "@/lib/utils";
import { KANBAN_COLUMN_LABELS } from "@/lib/kanban/seed";
import type { KanbanColumnId, KanbanTask } from "@/types";

type KanbanColumnProps = {
  columnId: KanbanColumnId;
  taskIds: string[];
  tasks: Record<string, KanbanTask>;
};

export function KanbanColumn({ columnId, taskIds, tasks }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId });

  return (
    <div className="flex min-h-0 flex-col rounded-xl border border-border/60 bg-secondary/20 backdrop-blur-sm">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/50 px-3 py-2.5">
        <h2 className="truncate text-sm font-semibold tracking-tight text-foreground">
          {KANBAN_COLUMN_LABELS[columnId]}
        </h2>
        <span className="shrink-0 rounded-md bg-muted/80 px-2 py-0.5 text-xs font-medium tabular-nums text-muted-foreground">
          {taskIds.length}
        </span>
      </div>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn(
            "flex min-h-[min(12rem,40vh)] flex-1 flex-col gap-2 overflow-y-auto p-3 transition-colors",
            isOver && "bg-primary/5 ring-1 ring-inset ring-primary/20",
          )}
        >
          {taskIds.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">Drop tasks here</p>
          ) : null}
          {taskIds.map((id) => {
            const task = tasks[id];
            if (!task) return null;
            return <KanbanTaskCard key={id} task={task} />;
          })}
        </div>
      </SortableContext>
    </div>
  );
}
