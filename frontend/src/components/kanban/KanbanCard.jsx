import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AvatarGroup } from '../ui/Avatar';
import { PriorityBadge } from '../ui/Badge';
import { formatDeadline, isOverdue } from '../../utils/helpers';
import { MessageSquare, Paperclip, CheckSquare, Calendar } from 'lucide-react';

const KanbanCard = ({ task, onClick }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  const deadline = task.deadline ? formatDeadline(task.deadline) : null;
  const overdue = task.deadline ? isOverdue(task.deadline) : false;
  const completedChecklist = task.checklist?.filter((c) => c.completed).length || 0;
  const totalChecklist = task.checklist?.length || 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`glass rounded-xl p-3.5 border border-white/8 transition-all duration-200 select-none
        hover:border-primary-500/30 hover:shadow-card-hover group
        ${isDragging ? 'shadow-glow border-primary-500/50 rotate-1' : ''}
        ${overdue && task.status !== 'done' ? 'border-l-2 border-l-red-500' : ''}
      `}
    >
      {/* Title */}
      <p className="text-sm font-medium text-gray-100 mb-2 leading-snug group-hover:text-white transition-colors">
        {task.title}
      </p>

      {/* Priority */}
      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        <PriorityBadge priority={task.priority} />
        {task.tags?.slice(0, 2).map((tag) => (
          <span key={tag} className="text-[10px] bg-white/8 text-gray-400 px-1.5 py-0.5 rounded-full">{tag}</span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <AvatarGroup users={task.assignedTo || []} size="xs" max={3} />
        
        <div className="flex items-center gap-2 text-gray-500">
          {totalChecklist > 0 && (
            <span className="flex items-center gap-0.5 text-[10px]">
              <CheckSquare size={10} />
              <span className={completedChecklist === totalChecklist ? 'text-emerald-400' : ''}>
                {completedChecklist}/{totalChecklist}
              </span>
            </span>
          )}
          {task.commentCount > 0 && (
            <span className="flex items-center gap-0.5 text-[10px]">
              <MessageSquare size={10} /> {task.commentCount}
            </span>
          )}
          {deadline && (
            <span className={`flex items-center gap-0.5 text-[10px] ${overdue && task.status !== 'done' ? 'text-red-400' : 'text-gray-500'}`}>
              <Calendar size={10} /> {deadline}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default KanbanCard;
