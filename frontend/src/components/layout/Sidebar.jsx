import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { useTheme } from '../../hooks/useTheme';
import { getInitials, generateColor } from '../../utils/helpers';
import {
  LayoutDashboard, FolderKanban, CheckSquare, MessageSquare,
  Bell, Settings, LogOut, Sun, Moon, Plus, Activity, Calendar,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/projects', icon: FolderKanban, label: 'Projects' },
  { path: '/tasks', icon: CheckSquare, label: 'My Tasks' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/chat', icon: MessageSquare, label: 'Chat' },
  { path: '/activity', icon: Activity, label: 'Activity' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

const Sidebar = ({ onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const user = useSelector((s) => s.auth.user);
  const unreadNotifications = useSelector((s) => s.notifications.unreadCount);
  const unreadMessages = useSelector((s) => s.chat.unreadCount);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const avatarColor = user?.name ? generateColor(user.name) : '#6366f1';
  const avatarUrl = user?.avatar?.url;

  return (
    <aside className="h-full flex flex-col bg-dark-200/80 backdrop-blur-xl border-r border-white/8 w-64">
      {/* Logo */}
      <div className="p-6 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-glow">
            <span className="text-white font-black text-sm">TMS</span>
          </div>
          <div>
            <h1 className="font-bold text-white text-sm leading-none">TaskFlow</h1>
            <p className="text-gray-500 text-xs mt-0.5">Pro Workspace</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-link relative ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={18} />
            <span className="text-sm">{label}</span>
            {label === 'Chat' && unreadMessages > 0 && (
              <span className="ml-auto bg-primary-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {unreadMessages > 9 ? '9+' : unreadMessages}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Notifications Bell (quick access) */}
      <div className="px-3 pb-2">
        <NavLink to="/notifications" onClick={onClose} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Bell size={18} />
          <span className="text-sm">Notifications</span>
          {unreadNotifications > 0 && (
            <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </span>
          )}
        </NavLink>
      </div>

      {/* Bottom user section */}
      <div className="p-3 border-t border-white/8">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-all cursor-pointer" onClick={() => navigate('/settings')}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={user?.name} className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: avatarColor }}>
              {getInitials(user?.name)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.role}</p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={(e) => { e.stopPropagation(); toggleTheme(); }} className="btn-icon w-7 h-7 p-0 flex items-center justify-center" title="Toggle theme">
              {isDark ? <Sun size={13} /> : <Moon size={13} />}
            </button>
            <button onClick={(e) => { e.stopPropagation(); handleLogout(); }} className="btn-icon w-7 h-7 p-0 flex items-center justify-center text-red-400 hover:text-red-300" title="Logout">
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
