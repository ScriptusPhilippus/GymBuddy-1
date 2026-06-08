/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { restrictToHorizontalAxis, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';

export { arrayMove };

interface SortableListProps {
  ids: string[];
  onReorder: (fromIndex: number, toIndex: number) => void;
  orientation?: 'vertical' | 'horizontal';
  children: React.ReactNode;
}

/**
 * Drag-and-drop reordering context for a list of string ids. Works with mouse,
 * touch (hold ~180ms to lift, so a quick swipe still scrolls), and keyboard.
 */
export const SortableList: React.FC<SortableListProps> = ({ ids, onReorder, orientation = 'vertical', children }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from !== -1 && to !== -1) onReorder(from, to);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleEnd}
      modifiers={[orientation === 'horizontal' ? restrictToHorizontalAxis : restrictToVerticalAxis]}
    >
      <SortableContext
        items={ids}
        strategy={orientation === 'horizontal' ? horizontalListSortingStrategy : verticalListSortingStrategy}
      >
        {children}
      </SortableContext>
    </DndContext>
  );
};

interface SortableItemRenderArgs {
  setNodeRef: (node: HTMLElement | null) => void;
  style: React.CSSProperties;
  /** Spread onto the drag handle element (button). */
  handleProps: Record<string, unknown>;
  isDragging: boolean;
}

interface SortableItemProps {
  id: string;
  children: (args: SortableItemRenderArgs) => React.ReactNode;
}

/**
 * Render-prop wrapper so the existing card JSX stays intact — attach
 * `setNodeRef` + `style` to the card root and `handleProps` to a drag handle.
 */
export const SortableItem: React.FC<SortableItemProps> = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 50 : undefined
    // NOTE: touch-action stays on the drag handle (not the card) so swiping the
    // card body still scrolls the list; only the handle starts a drag.
  };
  return <>{children({ setNodeRef, style, handleProps: { ...attributes, ...listeners }, isDragging })}</>;
};
