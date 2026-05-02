import Avatar from '../ui/Avatar';
import { timeAgo } from '../../utils/helpers';
import { NOTIFICATION_ICONS } from '../../utils/constants';

const activityIcons = {
  created_task: '✅',
  updated_task: '✏️',
  deleted_task: '🗑️',
  moved_task: '↗️',
  assigned_task: '👤',
  completed_task: '🎉',
  added_comment: '💬',
  created_project: '📁',
  updated_project: '📝',
  added_member: '👥',
  logged_in: '🔑',
};

const actionLabels = {
  created_task: 'created task',
  updated_task: 'updated task',
  deleted_task: 'deleted task',
  moved_task: 'moved task',
  assigned_task: 'assigned task',
  completed_task: 'completed task',
  added_comment: 'commented on',
  created_project: 'created project',
  updated_project: 'updated project',
  added_member: 'added member to',
  logged_in: 'logged in',
};

const ActivityItem = ({ log }) => (
  <div className="flex items-start gap-3 py-3 border-b border-white/5 last:border-0 animate-fade-in">
    <div className="relative flex-shrink-0">
      <Avatar user={log.user} size="sm" />
      <span className="absolute -bottom-1 -right-1 text-sm leading-none">
        {activityIcons[log.action] || '📌'}
      </span>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-gray-200">
        <span className="font-medium text-white">{log.user?.name}</span>{' '}
        <span className="text-gray-400">{actionLabels[log.action] || log.action}</span>{' '}
        {log.targetTitle && <span className="text-primary-400">"{log.targetTitle}"</span>}
        {log.meta?.from && log.meta?.to && (
          <span className="text-gray-400"> from <span className="text-amber-400">{log.meta.from}</span> to <span className="text-emerald-400">{log.meta.to}</span></span>
        )}
      </p>
      <p className="text-xs text-gray-600 mt-0.5">{timeAgo(log.createdAt)}</p>
    </div>
  </div>
);

const ActivityTimeline = ({ logs = [], isLoading }) => {
  if (isLoading) return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-3 animate-pulse">
          <div className="w-8 h-8 rounded-full bg-white/10" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-white/10 rounded w-3/4" />
            <div className="h-2 bg-white/5 rounded w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );

  if (logs.length === 0) return (
    <div className="text-center py-8 text-gray-500">
      <p className="text-2xl mb-2">📜</p>
      <p className="text-sm">No activity yet</p>
    </div>
  );

  return (
    <div>
      {logs.map((log) => (
        <ActivityItem key={log._id} log={log} />
      ))}
    </div>
  );
};

export default ActivityTimeline;
