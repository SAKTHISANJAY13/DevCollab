"use client";

import { useState } from "react";
import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
  type DragEndEvent,
  type DragStartEvent,
  type DropAnimation,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import { KanbanColumn } from "@/components/kanban/kanban-column";
import { KanbanTaskCard } from "@/components/kanban/kanban-task-card";
import {
  KANBAN_COLUMN_IDS,
  initialKanbanColumnOrder,
  initialKanbanTasks,
} from "@/lib/kanban/seed";
import type { KanbanColumnId, KanbanTask } from "@/types";

function isColumnId(value: string): value is KanbanColumnId {
  return KANBAN_COLUMN_IDS.includes(value as KanbanColumnId);
}

function findColumnForTask(
  taskId: string,
  columns: Record<KanbanColumnId, string[]>,
): KanbanColumnId | undefined {
  for (const col of KANBAN_COLUMN_IDS) {
    if (columns[col].includes(taskId)) return col;
  }
  return undefined;
}

function resolveOverColumn(
  overId: string,
  columns: Record<KanbanColumnId, string[]>,
): KanbanColumnId | undefined {
  if (isColumnId(overId)) return overId;
  return findColumnForTask(overId, columns);
}

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: "0.5" } },
  }),
};

export function KanbanBoard() {
  const [columns, setColumns] =
    useState<Record<KanbanColumnId, string[]>>(initialKanbanColumnOrder);
  const [tasks] = useState<Record<string, KanbanTask>>(() => ({ ...initialKanbanTasks }));
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const activeTask = activeId ? tasks[activeId] : null;

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeTaskId = String(active.id);
    const overId = String(over.id);

    if (activeTaskId === overId) return;

    setColumns((prev) => {
      const activeColumn = findColumnForTask(activeTaskId, prev);
      const overColumn = resolveOverColumn(overId, prev);

      if (!activeColumn || !overColumn) return prev;

      if (activeColumn === overColumn) {
        const list = prev[activeColumn];
        const activeIndex = list.indexOf(activeTaskId);
        if (activeIndex < 0) return prev;

        if (isColumnId(overId)) return prev;

        const overIndex = list.indexOf(overId);
        if (overIndex < 0) return prev;

        return {
          ...prev,
          [activeColumn]: arrayMove(list, activeIndex, overIndex),
        };
      }

      const from = [...prev[activeColumn]];
      const to = [...prev[overColumn]];
      const fromIndex = from.indexOf(activeTaskId);
      if (fromIndex < 0) return prev;

      const [moved] = from.splice(fromIndex, 1);

      if (isColumnId(overId)) {
        to.push(moved);
      } else {
        const overIndex = to.indexOf(overId);
        const insertAt = overIndex < 0 ? to.length : overIndex;
        to.splice(insertAt, 0, moved);
      }

      return {
        ...prev,
        [activeColumn]: from,
        [overColumn]: to,
      };
    });
  }

  function onDragCancel() {
    setActiveId(null);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <div className="grid min-h-[min(70vh,720px)] grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {KANBAN_COLUMN_IDS.map((columnId) => (
          <KanbanColumn
            key={columnId}
            columnId={columnId}
            taskIds={columns[columnId]}
            tasks={tasks}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={dropAnimation}>
        {activeTask ? (
          <div className="max-w-[280px] rotate-2 cursor-grabbing opacity-95 shadow-xl">
            <KanbanTaskCard task={activeTask} isOverlay />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
