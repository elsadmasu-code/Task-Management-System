import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markAsRead, markAllAsRead } from '../features/notifications/notificationsSlice';
import { timeAgo } from '../utils/helpers';
import { NOTIFICATION_ICONS } from '../utils/constants';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { notificationService } from '../services/chat.service';
import toast from 'react-hot-toast';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const { items: notifications, unreadCount, isLoading } = useSelector((s) => s.notifications);

  useEffect(() => { dispatch(fetchNotifications()); }, [dispatch]);

  const handleMarkRead = (id) => dispatch(markAsRead(id));
  const handleMarkAll = () => {
    dispatch(markAllAsRead());
    toast.success('All notifications marked as read');
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="section-title">Notifications</h1>
          <p className="text-gray-400 text-sm mt-1">{unreadCount} unread</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAll} className="btn-secondary flex items-center gap-2 text-sm">
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      <div className="card max-w-2xl">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell size={48} className="text-gray-700 mb-4" />
            <h3 className="text-lg font-semibold text-gray-300 mb-1">All caught up!</h3>
            <p className="text-gray-500 text-sm">No notifications yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                className={`flex items-start gap-4 py-4 transition-all ${!notif.isRead ? 'opacity-100' : 'opacity-60'}`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0
                  ${!notif.isRead ? 'bg-primary-600/20' : 'bg-white/5'}`}>
                  {NOTIFICATION_ICONS[notif.type] || '📢'}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium ${!notif.isRead ? 'text-white' : 'text-gray-300'}`}>
                      {notif.title}
                    </p>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{notif.message}</p>
                  <p className="text-xs text-gray-600 mt-1">{timeAgo(notif.createdAt)}</p>
                </div>

                {/* Action */}
                {!notif.isRead && (
                  <button
                    onClick={() => handleMarkRead(notif._id)}
                    className="btn-icon w-7 h-7 flex-shrink-0 text-primary-400"
                    title="Mark as read"
                  >
                    <CheckCheck size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
