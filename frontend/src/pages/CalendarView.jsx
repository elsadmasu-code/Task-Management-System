import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyTasks } from '../features/tasks/tasksSlice';
import { StatusBadge, PriorityBadge } from '../components/ui/Badge';
import { formatDate, isOverdue } from '../utils/helpers';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, isToday } from 'date-fns';

const CalendarView = () => {
  const dispatch = useDispatch();
  const { myTasks } = useSelector((s) => s.tasks);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => { dispatch(fetchMyTasks()); }, [dispatch]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start of month to align with Mon
  const startDay = (monthStart.getDay() + 6) % 7; // 0=Mon
  const paddedDays = [...Array(startDay).fill(null), ...days];

  const getTasksForDay = (day) =>
    myTasks.filter((t) => t.deadline && isSameDay(new Date(t.deadline), day));

  const selectedTasks = getTasksForDay(selectedDate);

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="section-title">Calendar</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="card lg:col-span-2">
          {/* Month Nav */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="btn-icon">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setCurrentDate(new Date())} className="btn-secondary text-xs px-3 py-1.5">
                Today
              </button>
              <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="btn-icon">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-gray-500 py-2">{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {paddedDays.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} />;
              const dayTasks = getTasksForDay(day);
              const hasOverdue = dayTasks.some((t) => isOverdue(t.deadline) && t.status !== 'done');
              const isSelected = isSameDay(day, selectedDate);
              const todayDay = isToday(day);

              return (
                <button
                  key={day.toString()}
                  onClick={() => setSelectedDate(day)}
                  className={`relative p-1.5 rounded-xl text-center transition-all duration-150 min-h-[52px] flex flex-col items-center
                    ${isSelected ? 'bg-primary-600 text-white shadow-glow' : todayDay ? 'bg-primary-600/20 text-primary-300' : 'hover:bg-white/8 text-gray-300'}
                    ${!isSameMonth(day, currentDate) ? 'opacity-30' : ''}
                  `}
                >
                  <span className={`text-sm font-semibold ${isSelected ? 'text-white' : todayDay ? 'text-primary-300' : ''}`}>
                    {format(day, 'd')}
                  </span>
                  {dayTasks.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
                      {dayTasks.slice(0, 3).map((_, i) => (
                        <div key={i} className={`w-1.5 h-1.5 rounded-full ${hasOverdue ? 'bg-red-400' : isSelected ? 'bg-white' : 'bg-primary-400'}`} />
                      ))}
                      {dayTasks.length > 3 && <span className="text-[8px] text-gray-500">+{dayTasks.length - 3}</span>}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Tasks */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon size={16} className="text-primary-400" />
            <h3 className="font-semibold text-white">
              {format(selectedDate, 'MMM d, yyyy')}
            </h3>
          </div>

          {selectedTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">📭</p>
              <p className="text-gray-500 text-sm">No tasks due this day</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedTasks.map((task) => (
                <div key={task._id}
                  className={`p-3 rounded-xl border transition-all ${
                    isOverdue(task.deadline) && task.status !== 'done'
                      ? 'border-red-500/30 bg-red-500/5'
                      : 'border-white/8 glass'
                  }`}
                >
                  <p className="text-sm font-medium text-white mb-2 leading-snug">{task.title}</p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <StatusBadge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                  </div>
                  {task.project?.name && (
                    <p className="text-xs text-gray-500 mt-1.5">📁 {task.project.name}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
