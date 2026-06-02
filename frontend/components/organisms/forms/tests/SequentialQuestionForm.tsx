"use client";

import type { SequentialBlock, SequentialQuestion } from "@/models/TestQuestion";
import { createQuestionId } from "@/models/TestQuestion";
import { Button, InputSmall } from "@kiyotakkkka/zvs-uikit-lib/ui";
import { Icon } from "@iconify/react";
import { TestQuestionFormLayout } from "./TestQuestionFormLayout";
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

type SequentialQuestionFormProps = {
  question: SequentialQuestion;
  onChange: (question: SequentialQuestion) => void;
};

const createBlock = (): SequentialBlock => ({
  id: createQuestionId(),
  text: "",
});

type SortableSequentialBlockProps = {
  block: SequentialBlock;
  index: number;
  blocksCount: number;
  onTextChange: (blockId: string, text: string) => void;
  onRemove: (blockId: string) => void;
};

const SortableSequentialBlock = ({
  block,
  index,
  blocksCount,
  onTextChange,
  onRemove,
}: SortableSequentialBlockProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={[
        "grid gap-3 rounded-md border border-main-700/70 p-3 sm:grid-cols-[auto_auto_minmax(0,1fr)_auto] sm:items-center",
        isDragging ? "relative z-10 border-main-400 bg-main-800 shadow-lg" : "",
      ].join(" ")}
    >
      <button
        ref={setActivatorNodeRef}
        type="button"
        className="flex h-10 w-10 touch-none items-center justify-center rounded-md border border-main-700 bg-main-800/70 text-main-200 transition hover:border-main-500 hover:text-main-50"
        aria-label={`Перетащить блок ${index + 1}`}
        {...attributes}
        {...listeners}
      >
        <Icon icon="mdi:drag" width={20} height={20} />
      </button>
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-main-700/80 text-sm font-bold text-main-100">
        {index + 1}
      </span>
      <InputSmall
        value={block.text}
        placeholder={`Блок ${index + 1}`}
        className="w-full"
        onChange={(event) => onTextChange(block.id, event.target.value)}
      />
      <Button
        type="button"
        variant="danger"
        className="h-10 w-10 p-0"
        onClick={() => onRemove(block.id)}
        disabled={blocksCount <= 1}
      >
        <Icon icon="mdi:trash-can-outline" width={18} height={18} />
      </Button>
    </div>
  );
};

export const SequentialQuestionForm = ({
  question,
  onChange,
}: SequentialQuestionFormProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const updateBlock = (blockId: string, text: string) => {
    onChange({
      ...question,
      blocks: question.blocks.map((block) =>
        block.id === blockId ? { ...block, text } : block,
      ),
    });
  };

  const removeBlock = (blockId: string) => {
    onChange({
      ...question,
      blocks: question.blocks.filter(({ id }) => id !== blockId),
    });
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = question.blocks.findIndex(({ id }) => id === active.id);
    const newIndex = question.blocks.findIndex(({ id }) => id === over.id);

    if (oldIndex < 0 || newIndex < 0) {
      return;
    }

    onChange({
      ...question,
      blocks: arrayMove(question.blocks, oldIndex, newIndex),
    });
  };

  return (
    <TestQuestionFormLayout
      title="Последовательность блоков"
      description="Перетаскивайте блоки, чтобы задать правильный порядок."
      addLabel="Добавить блок"
      onAdd={() =>
        onChange({ ...question, blocks: [...question.blocks, createBlock()] })
      }
    >
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={question.blocks.map(({ id }) => id)}
          strategy={verticalListSortingStrategy}
        >
          {question.blocks.map((block, index) => (
            <SortableSequentialBlock
              key={block.id}
              block={block}
              index={index}
              blocksCount={question.blocks.length}
              onTextChange={updateBlock}
              onRemove={removeBlock}
            />
          ))}
        </SortableContext>
      </DndContext>
    </TestQuestionFormLayout>
  );
};
