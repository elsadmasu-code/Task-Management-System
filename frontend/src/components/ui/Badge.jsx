import { STATUS_LABELS, PRIORITY_LABELS } from '../../utils/constants';

const statusStyles = {
  todo: 'badge-todo',
  'in-progress': 'badge-in-progress',
  review: 'badge-review',
  done: 'badge-done',
  cancelled: 'badge-cancelled',
};

const priorityStyles = {
  low: 'badge-low',
  medium: 'badge-medium',
  high: 'badge-high',
  critical: 'badge-critical',
};

export const StatusBadge = ({ status }) => (
  <span className={`badge ${statusStyles[status] || 'badge-todo'}`}>
    {STATUS_LABELS[status] || status}
  </span>
);

export const PriorityBadge = ({ priority }) => {
  const icons = { low: '↓', medium: '→', high: '↑', critical: '⚡' };
  return (
    <span className={`badge ${priorityStyles[priority] || 'badge-medium'}`}>
      {icons[priority]} {PRIORITY_LABELS[priority] || priority}
    </span>
  );
};

const Badge = ({ children, color = 'gray', className = '' }) => {
  const colorMap = {
    gray: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    primary: 'bg-primary-500/20 text-primary-300 border-primary-500/30',
    green: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    yellow: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    red: 'bg-red-500/20 text-red-300 border-red-500/30',
    purple: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    blue: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  };
  return <span className={`badge border ${colorMap[color] || colorMap.gray} ${className}`}>{children}</span>;
};

export default Badge;
