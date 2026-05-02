import { format, formatDistanceToNow, isPast, isToday, isTomorrow } from 'date-fns';

export const formatDate = (date) => {
  if (!date) return 'No date';
  return format(new Date(date), 'MMM d, yyyy');
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return format(new Date(date), 'MMM d, yyyy h:mm a');
};

export const timeAgo = (date) => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatDeadline = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (isToday(d)) return 'Today';
  if (isTomorrow(d)) return 'Tomorrow';
  if (isPast(d)) return `Overdue (${formatDate(date)})`;
  return formatDate(date);
};

export const isOverdue = (date) => date && isPast(new Date(date));

export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const truncate = (str, length = 80) => {
  if (!str) return '';
  return str.length > length ? str.slice(0, length) + '...' : str;
};

export const getPriorityColor = (priority) => {
  const map = { low: 'sky', medium: 'amber', high: 'orange', critical: 'red' };
  return map[priority] || 'gray';
};

export const getStatusColor = (status) => {
  const map = { todo: 'gray', 'in-progress': 'amber', review: 'purple', done: 'emerald', cancelled: 'red' };
  return map[status] || 'gray';
};

export const classNames = (...classes) => classes.filter(Boolean).join(' ');

export const generateColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const hue = hash % 360;
  return `hsl(${Math.abs(hue)}, 65%, 55%)`;
};

export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};
