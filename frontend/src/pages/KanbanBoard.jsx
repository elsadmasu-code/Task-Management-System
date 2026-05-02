import { useEffect, useState } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragOverlay,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, bulkUpdateTasks, createTask, updateTask } from '../features/tasks/tasksSlice';
import { fetchProject } from '../features/projects/projectsSlice';
import { useParams, useNavigate } from 'react-router-dom';
import KanbanColumn from '../components/kanban/KanbanColumn';
import KanbanCard from '../components/kanban/KanbanCard';
import Modal from '../components/ui/Modal';
import Input, { Textarea, Select } from '../components/ui/Input';
import { PageLoader } from '../components/ui/Spinner';
import { StatusBadge, PriorityBadge } from '../components/ui/Badge';
import { AvatarGroup } from '../components/ui/Avatar';
import { formatDateTime } from '../utils/helpers';
import { KANBAN_COLUMNS } from '../utils/constants';
import { Plus, ArrowLeft, MessageSquare, Calendar, User2, Pencil, Trash2, CheckSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' }, { value: 'critical', label: 'Critical' },
];

const KanbanBoard = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: tasks, isLoading } = useSelector((s) => s.tasks);
  const { currentProject } = useSelector((s) => s.projects);
  const user = useSelector((s) => s.auth.user);

  const [activeTask, setActiveTask] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [createColumnId, setCreateColumnId] = useState('todo');
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', deadline: '' });
  const [isCreating, setIsCreating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (projectId) {
      dispatch(fetchTasks({ project: projectId }));
      dispatch(fetchProject(projectId));
    }
  }, [dispatch, projectId]);

  const columns = currentProject?.columns || KANBAN_COLUMNS;

  const getColumnTasks = (columnId) =>
    [...tasks]
      .filter((t) => (t.columnId || t.status) === columnId)
      .sort((a, b) => a.order - b.order);

  const handleDragStart = (event) => {
    const task = tasks.find((t) => t._id === event.active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeTask = tasks.find((t) => t._id === active.id);
    if (!activeTask) return;

    // Find the target column
    let targetColumnId = over.id;
    if (!columns.find((c) => c.id === targetColumnId)) {
      const overTask = tasks.find((t) => t._id === over.id);
      targetColumnId = overTask?.columnId || overTask?.status;
    }

    if (!targetColumnId || targetColumnId === (activeTask.columnId || activeTask.status)) return;

    // Optimistically update
    const updated = {
      _id: activeTask._id,
      status: targetColumnId,
      columnId: targetColumnId,
      order: getColumnTasks(targetColumnId).length,
    };

    try {
      await dispatch(bulkUpdateTasks([updated]));
      dispatch(updateTask({ id: activeTask._id, data: { status: targetColumnId, columnId: targetColumnId } }));
    } catch {
      toast.error('Failed to move task');
    }
  };

  const handleAddTask = (columnId) => {
    setCreateColumnId(columnId);
    setNewTask({ title: '', description: '', priority: 'medium', deadline: '' });
    setShowCreateModal(true);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;
    setIsCreating(true);
    try {
      await dispatch(createTask({
        ...newTask,
        project: projectId,
        workspace: currentProject?.workspace?._id || currentProject?.workspace,
        status: createColumnId,
        columnId: createColumnId,
      }));
      toast.success('Task created!');
      setShowCreateModal(false);
    } catch {
      toast.error('Failed to create task');
    } finally {
      setIsCreating(false);
    }
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  if (isLoading && tasks.length === 0) return <PageLoader />;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/projects')} className="btn-icon">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg"
              style={{ background: (currentProject?.color || '#6366f1') + '30' }}>
              {currentProject?.icon || '📁'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{currentProject?.name || 'Kanban Board'}</h1>
              <p className="text-xs text-gray-400">{tasks.length} tasks</p>
            </div>
          </div>
        </div>
        <button onClick={() => handleAddTask('todo')} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={15} /> Add Task
        </button>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto pb-4">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 h-full min-h-[500px]" style={{ minWidth: `${columns.length * 304}px` }}>
            {columns.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={getColumnTasks(column.id)}
                onAddTask={handleAddTask}
                onTaskClick={handleTaskClick}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask && <KanbanCard task={activeTask} />}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Create Task Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Task"
        footer={
          <>
            <button onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleCreateTask} disabled={isCreating} className="btn-primary flex items-center gap-2">
              {isCreating && <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Create Task
            </button>
          </>
        }
      >
        <form className="space-y-4">
          <Input label="Task Title *" placeholder="Enter task title..."
            value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} required />
          <Textarea label="Description" placeholder="Describe the task..."
            value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Priority" value={newTask.priority} options={PRIORITY_OPTIONS}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })} />
            <div>
              <label className="label">Deadline</label>
              <input type="datetime-local" className="input text-sm"
                value={newTask.deadline} onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })} />
            </div>
          </div>
        </form>
      </Modal>

      {/* Task Detail Modal */}
      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)}
        title={selectedTask?.title || 'Task Details'} size="lg">
        {selectedTask && (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={selectedTask.status} />
              <PriorityBadge priority={selectedTask.priority} />
            </div>
            {selectedTask.description && (
              <p className="text-gray-300 text-sm leading-relaxed">{selectedTask.description}</p>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs mb-1">Assigned To</p>
                <AvatarGroup users={selectedTask.assignedTo || []} size="sm" />
              </div>
              {selectedTask.deadline && (
                <div>
                  <p className="text-gray-500 text-xs mb-1 flex items-center gap-1"><Calendar size={12} /> Deadline</p>
                  <p className="text-gray-200">{formatDateTime(selectedTask.deadline)}</p>
                </div>
              )}
            </div>
            {selectedTask.checklist?.length > 0 && (
              <div>
                <p className="text-gray-500 text-xs mb-2 flex items-center gap-1"><CheckSquare size={12} /> Checklist</p>
                <div className="space-y-1.5">
                  {selectedTask.checklist.map((item, i) => (
                    <div key={i} className={`flex items-center gap-2 text-sm ${item.completed ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${item.completed ? 'border-emerald-500 bg-emerald-500' : 'border-gray-600'}`}>
                        {item.completed && <span className="text-white text-[10px]">✓</span>}
                      </div>
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default KanbanBoard;
