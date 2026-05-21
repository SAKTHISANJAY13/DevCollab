"use client";

import { useEffect, useState } from "react";
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
import { KANBAN_COLUMN_IDS } from "@/lib/kanban/seed";
import type { KanbanColumnId, KanbanTask } from "@/types";
import { useSocket } from "@/hooks/use-socket";
import { apiClient } from "@/lib/api-client";

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

const KanbanBoardSkeleton = () => (
  <div className="grid min-h-[min(70vh,720px)] grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 animate-pulse">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="flex flex-col gap-3 rounded-xl border bg-muted/20 p-4 min-h-[500px]">
        <div className="flex items-center justify-between">
          <div className="h-5 w-24 rounded bg-muted-foreground/20" />
          <div className="h-5 w-6 rounded bg-muted-foreground/20" />
        </div>
        <div className="space-y-3 mt-4">
          {Array.from({ length: i + 1 }).map((_, j) => (
            <div key={j} className="h-28 rounded-lg border border-dashed bg-muted/40 p-4 space-y-3">
              <div className="h-4 w-3/4 rounded bg-muted-foreground/20" />
              <div className="h-3 w-1/2 rounded bg-muted-foreground/20" />
              <div className="flex items-center justify-between pt-2">
                <div className="h-6 w-12 rounded bg-muted-foreground/20" />
                <div className="h-6 w-6 rounded-full bg-muted-foreground/20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export function KanbanBoard() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const { socket, isConnected } = useSocket({
    projectId: projectId ?? undefined,
  });
  const [columns, setColumns] = useState<Record<KanbanColumnId, string[]>>({
    todo: [],
    "in-progress": [],
    "in-review": [],
    done: [],
  });
  const [tasks, setTasks] = useState<Record<string, KanbanTask>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Fetch tasks on mount (and auto-seed if empty in DB)
  useEffect(() => {
    let active = true;

    apiClient<{ tasks: KanbanTask[]; projectId: string }>("/api/tasks")
      .then((data) => {
        if (!active) return;
        setProjectId(data.projectId);

        const newTasks: Record<string, KanbanTask> = {};
        const newColumns: Record<KanbanColumnId, string[]> = {
          todo: [],
          "in-progress": [],
          "in-review": [],
          done: [],
        };

        data.tasks.forEach((t) => {
          newTasks[t.id] = t;
          if (t.status && newColumns[t.status]) {
            newColumns[t.status].push(t.id);
          }
        });

        setTasks(newTasks);
        setColumns(newColumns);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load tasks from API:", err);
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  // Listen to Socket.IO real-time channel
  useEffect(() => {
    if (!socket) return;

    const onTaskCreated = (task: KanbanTask) => {
      console.log(`[Socket.IO Client] Event received: "taskCreated"`, task);
      setTasks((prev) => ({ ...prev, [task.id]: task }));
      setColumns((prev) => {
        const col = task.status || "todo";
        const exists = findColumnForTask(task.id, prev);
        if (exists) return prev;
        return {
          ...prev,
          [col]: [...prev[col], task.id],
        };
      });
    };

    const onTaskUpdated = (task: KanbanTask) => {
      console.log(`[Socket.IO Client] Event received: "taskUpdated"`, task);
      setTasks((prev) => ({ ...prev, [task.id]: task }));
    };

    const onTaskMoved = (task: KanbanTask) => {
      console.log(`[Socket.IO Client] Event received: "taskMoved"`, task);
      setTasks((prev) => ({ ...prev, [task.id]: task }));
      setColumns((prev) => {
        const newStatus = task.status || "todo";
        const oldStatus = findColumnForTask(task.id, prev);

        if (oldStatus === newStatus) return prev;

        const next = { ...prev };
        if (oldStatus) {
          next[oldStatus] = next[oldStatus].filter((id) => id !== task.id);
        }
        if (!next[newStatus].includes(task.id)) {
          next[newStatus] = [...next[newStatus], task.id];
        }
        return next;
      });
    };

    const onTaskDeleted = ({ taskId }: { taskId: string }) => {
      console.log(`[Socket.IO Client] Event received: "taskDeleted"`, { taskId });
      setTasks((prev) => {
        const next = { ...prev };
        delete next[taskId];
        return next;
      });
      setColumns((prev) => {
        const next = { ...prev };
        for (const col of KANBAN_COLUMN_IDS) {
          if (next[col].includes(taskId)) {
            next[col] = next[col].filter((id) => id !== taskId);
          }
        }
        return next;
      });
    };

    socket.on("taskCreated", onTaskCreated);
    socket.on("taskUpdated", onTaskUpdated);
    socket.on("taskMoved", onTaskMoved);
    socket.on("taskDeleted", onTaskDeleted);

    return () => {
      socket.off("taskCreated", onTaskCreated);
      socket.off("taskUpdated", onTaskUpdated);
      socket.off("taskMoved", onTaskMoved);
      socket.off("taskDeleted", onTaskDeleted);
    };
  }, [socket]);

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

    const activeColumn = findColumnForTask(activeTaskId, columns);
    const overColumn = resolveOverColumn(overId, columns);

    if (!activeColumn || !overColumn) return;

    setColumns((prev) => {
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

    // Persist status change to backend
    if (activeColumn !== overColumn) {
      const activeIndex = columns[activeColumn].indexOf(activeTaskId);

      setTasks((prev) => {
        const existing = prev[activeTaskId];
        if (!existing) return prev;
        return {
          ...prev,
          [activeTaskId]: {
            ...existing,
            status: overColumn,
          },
        };
      });

      apiClient(`/api/tasks/${activeTaskId}`, {
        method: "PATCH",
        body: { status: overColumn },
      }).catch((err) => {
        console.error("Failed to persist task status change:", err);
        setTasks((prev) => {
          const existing = prev[activeTaskId];
          if (!existing) return prev;
          return {
            ...prev,
            [activeTaskId]: {
              ...existing,
              status: activeColumn,
            },
          };
        });

        setColumns((prev) => {
          const next: Record<KanbanColumnId, string[]> = { ...prev };
          for (const col of KANBAN_COLUMN_IDS) {
            if (next[col].includes(activeTaskId)) {
              next[col] = next[col].filter((id) => id !== activeTaskId);
            }
          }

          const list = [...next[activeColumn]];
          const insertAt = activeIndex < 0 ? list.length : Math.min(activeIndex, list.length);
          list.splice(insertAt, 0, activeTaskId);

          return {
            ...next,
            [activeColumn]: list,
          };
        });
      });
    }
  }

  function onDragCancel() {
    setActiveId(null);
  }

  if (isLoading) {
    return <KanbanBoardSkeleton />;
  }

  return (
    <div className="space-y-4">
      {/* Live Connectivity Bar */}
      <div className="flex items-center justify-between rounded-lg border bg-muted/10 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-yellow-500 animate-bounce"}`} />
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {isConnected ? "Realtime Live Sync" : "Reconnecting server..."}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          Project ID: <span className="font-mono text-foreground">{projectId}</span>
        </div>
      </div>

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
              taskIds={columns[columnId] || []}
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
    </div>
  );
}
