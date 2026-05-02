import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, Plus } from 'lucide-react';
import { useSelector } from 'react-redux';
import { getInitials, generateColor } from '../../utils/helpers';

const Navbar = ({ onMenuToggle, title }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const unreadCount = useSelector((s) => s.notifications.unreadCount);
  const avatarColor = user?.name ? generateColor(user.name) : '#6366f1';

  return (
    <header className="h-16 glass border-b border-white/10 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button onClick={onMenuToggle} className="btn-icon lg:hidden">
          <Menu size={18} />
        </button>
        <h2 className="font-semibold text-white text-lg hidden sm:block">{title}</h2>
      </div>

      {/* Center — Search */}
      <div className="flex-1 max-w-sm mx-4 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
          <input
            type="text"
            placeholder="Search tasks, projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-9 py-2 text-sm h-9"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button
          onClick={() => navigate('/notifications')}
          className="btn-icon relative"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold animate-bounce-in">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Avatar */}
        <button onClick={() => navigate('/settings')} className="ml-1">
          {user?.avatar?.url ? (
            <img src={user.avatar.url} alt={user.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-500/50" />
          ) : (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ring-2 ring-primary-500/50"
              style={{ background: avatarColor }}>
              {getInitials(user?.name)}
            </div>
          )}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
