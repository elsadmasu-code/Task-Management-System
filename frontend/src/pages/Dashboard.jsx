import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyTasks } from '../features/tasks/tasksSlice';
import { fetchProjects } from '../features/projects/projectsSlice';
import { fetchUserActivity } from '../features/activity/activitySlice';
import { TaskBarChart, TaskPieChart } from '../components/dashboard/Charts';
import ActivityTimeline from '../components/timeline/ActivityTimeline';
import { AvatarGroup } from '../components/ui/Avatar';
import { StatusBadge, PriorityBadge } from '../components/ui/Badge';
import { Link, useNavigate } from 'react-router-dom';
import { CheckSquare, Clock, AlertTriangle, TrendingUp, Plus, ArrowRight, FolderOpen } from 'lucide-react';
import { formatDeadline, isOverdue } from '../utils/helpers';
import { KANBAN_COLUMNS } from '../utils/constants';

const StatCard = ({ icon: Icon, label, value, color, trend }) => (
  <div className="card flex items-start justify-between group">
    <div>
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
      {trend && <p className="text-xs text-emerald-400 mt-1">↑ {trend}</p>}
    </div>
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
      <Icon size={20} className="text-white" />
    </div>
  </div>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myTasks, isLoading: tasksLoading } = useSelector((s) => s.tasks);
  const { items: projects } = useSelector((s) => s.projects);
  const { logs, isLoading: activityLoading } = useSelector((s) => s.activity);
  const user = useSelector((s) => s.auth.user);

  useEffect(() => {
    dispatch(fetchMyTasks());
    dispatch(fetchProjects());
    dispatch(fetchUserActivity());
  }, [dispatch]);

  // Stats
  const total = myTasks.length;
  const completed = myTasks.filter((t) => t.status === 'done').length;
  const inProgress = myTasks.filter((t) => t.status === 'in-progress').length;
  const overdue = myTasks.filter((t) => t.isOverdue && t.status !== 'done').length;

  // Chart data
  const barData = KANBAN_COLUMNS.map((col) => ({
    name: col.name,
    count: myTasks.filter((t) => t.status === col.id).length,
  }));

  const pieData = [
    { name: 'Done', count: completed },
    { name: 'In Progress', count: inProgress },
    { name: 'Todo', count: myTasks.filter((t) => t.status === 'todo').length },
    { name: 'Review', count: myTasks.filter((t) => t.status === 'review').length },
  ].filter((d) => d.count > 0);

  const upcomingTasks = [...myTasks]
    .filter((t) => t.deadline && t.status !== 'done')
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="section-title">Good day, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-400 text-sm mt-1">Here's what's happening with your tasks</p>
        </div>
        <button onClick={() => navigate('/projects')} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={CheckSquare} label="Total Tasks" value={total} color="bg-primary-600" />
        <StatCard icon={TrendingUp} label="Completed" value={completed} color="bg-emerald-600" trend={total > 0 ? `${Math.round((completed / total) * 100)}%` : undefined} />
        <StatCard icon={Clock} label="In Progress" value={inProgress} color="bg-amber-600" />
        <StatCard icon={AlertTriangle} label="Overdue" value={overdue} color="bg-red-600" />
      </div>

      {/* Charts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <div className="card lg:col-span-1">
          <h3 className="font-semibold text-white mb-4">Tasks by Status</h3>
          <TaskBarChart data={barData} />
        </div>

        {/* Pie Chart */}
        <div className="card lg:col-span-1">
          <h3 className="font-semibold text-white mb-4">Distribution</h3>
          {pieData.length > 0 ? <TaskPieChart data={pieData} /> : (
            <div className="flex items-center justify-center h-48 text-gray-500 text-sm">No tasks yet</div>
          )}
        </div>

        {/* Activity Feed */}
        <div className="card lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Recent Activity</h3>
            <Link to="/activity" className="text-primary-400 text-xs hover:text-primary-300 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <ActivityTimeline logs={logs.slice(0, 6)} isLoading={activityLoading} />
        </div>
      </div>

      {/* Bottom: Upcoming Tasks + Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Upcoming Deadlines</h3>
            <Link to="/tasks" className="text-primary-400 text-xs hover:text-primary-300 flex items-center gap-1">
              My Tasks <ArrowRight size={12} />
            </Link>
          </div>
          {upcomingTasks.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">No upcoming deadlines 🎉</p>
          ) : (
            <div className="space-y-2">
              {upcomingTasks.map((task) => (
                <div key={task._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                  onClick={() => navigate(`/projects/${task.project?._id}`)}>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isOverdue(task.deadline) ? 'bg-red-500' : 'bg-amber-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{task.title}</p>
                    <p className={`text-xs mt-0.5 ${isOverdue(task.deadline) ? 'text-red-400' : 'text-gray-500'}`}>
                      {formatDeadline(task.deadline)} · {task.project?.name}
                    </p>
                  </div>
                  <PriorityBadge priority={task.priority} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Projects */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Your Projects</h3>
            <Link to="/projects" className="text-primary-400 text-xs hover:text-primary-300 flex items-center gap-1">
              All projects <ArrowRight size={12} />
            </Link>
          </div>
          {projects.length === 0 ? (
            <div className="text-center py-6">
              <FolderOpen className="mx-auto text-gray-600 mb-2" size={32} />
              <p className="text-gray-500 text-sm">No projects yet</p>
              <button onClick={() => navigate('/projects')} className="btn-primary mt-3 text-sm py-2 px-4">Create Project</button>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.slice(0, 5).map((project) => (
                <div key={project._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer"
                  onClick={() => navigate(`/projects/${project._id}`)}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: project.color + '30' }}>
                    {project.icon || '📁'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{project.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{project.members?.length} members</p>
                  </div>
                  <div className={`w-2 h-2 rounded-full`} style={{ background: project.color }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
