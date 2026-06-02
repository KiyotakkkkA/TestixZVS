"use client";

import type { SequentialBlock, SequentialQuestion } from "@/models/TestQuestion";
import type { AnsweringFormProps } from "./AnsweringTypes";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Icon } from "@iconify/react";

const SortableBlock = ({
  block,
  index,
}: {
  block: SequentialBlock;
  index: number;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={[
        "grid gap-3 rounded-md border border-main-700 bg-main-900/30 p-4 sm:grid-cols-[auto_auto_minmax(0,1fr)] sm:items-center",
        isDragging ? "relative z-10 border-main-300 bg-main-800 shadow-lg" : "",
      ].join(" ")}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        className="flex h-10 w-10 touch-none items-center justify-center rounded-md border border-main-700 bg-main-800 text-main-200"
        {...attributes}
        {...listeners}
      >
        <Icon icon="mdi:drag" width={20} height={20} />
      </button>
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-main-700/80 text-sm font-bold text-main-50">
        {index + 1}
      </span>
      <span className="text-sm font-semibold text-main-50">{block.text}</span>
    </div>
  );
};

export const SequentialAnswerForm = ({
  question,
  value,
  onChange,
  showHint,
  showResult,
}: AnsweringFormProps<SequentialQuestion>) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const selectedOrder = Array.isArray(value)
    ? value
    : question.blocks.map(({ id }) => id);
  const blocksById = new Map(question.blocks.map((block) => [block.id, block]));
  const visibleBlocks = selectedOrder
    .map((id) => blocksById.get(id))
    .filter(Boolean) as SequentialBlock[];

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = selectedOrder.indexOf(String(active.id));
    const newIndex = selectedOrder.indexOf(String(over.id));

    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    onChange(arrayMove(selectedOrder, oldIndex, newIndex));
  };

  return (
    <div className="grid gap-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={visibleBlocks.map(({ id }) => id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid gap-3">
            {visibleBlocks.map((block, index) => (
              <SortableBlock key={block.id} block={block} index={index} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {(showHint || showResult) && (
        <div className="rounded-md border border-emerald-500/70 bg-emerald-500/10 p-4 text-sm text-emerald-100">
          Правильный порядок:{" "}
          {question.blocks.map((block) => block.text).join(" → ")}
        </div>
      )}
    </div>
  );
};
