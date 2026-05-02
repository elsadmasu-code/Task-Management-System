import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import KanbanCard from './KanbanCard';
import { Plus } from 'lucide-react';

const KanbanColumn = ({ column, tasks, onAddTask, onTaskClick }) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  return (
    <div
      ref={setNodeRef}
      className={`kanban-column transition-all duration-200 ${isOver ? 'border-primary-500/50 bg-primary-500/5' : ''}`}
      style={{ borderColor: isOver ? column.color : undefined }}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: column.color }} />
          <h3 className="font-semibold text-sm text-white">{column.name}</h3>
          <span className="text-xs text-gray-500 bg-white/10 px-1.5 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(column.id)}
          className="btn-icon w-6 h-6 p-0 flex items-center justify-center text-gray-400 hover:text-primary-400"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Cards */}
      <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 min-h-[80px]">
          {tasks.map((task) => (
            <KanbanCard key={task._id} task={task} onClick={() => onTaskClick(task)} />
          ))}
          {tasks.length === 0 && (
            <div className="flex items-center justify-center h-16 border border-dashed border-white/10 rounded-xl">
              <p className="text-gray-600 text-xs">No tasks</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};

export default KanbanColumn;
