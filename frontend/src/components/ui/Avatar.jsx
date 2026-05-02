import { getInitials, generateColor } from '../../utils/helpers';

const Avatar = ({ user, size = 'md', className = '' }) => {
  const sizes = { xs: 'w-6 h-6 text-[10px]', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base', xl: 'w-16 h-16 text-xl' };
  const sizeClass = sizes[size] || sizes.md;
  const color = user?.name ? generateColor(user.name) : '#6366f1';

  if (user?.avatar?.url) {
    return <img src={user.avatar.url} alt={user.name} className={`${sizeClass} rounded-full object-cover ${className}`} />;
  }
  return (
    <div className={`${sizeClass} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 ${className}`} style={{ background: color }}>
      {getInitials(user?.name)}
    </div>
  );
};

export const AvatarGroup = ({ users = [], max = 3, size = 'sm' }) => {
  const shown = users.slice(0, max);
  const extra = users.length - max;
  const sizeMap = { xs: 'w-5 h-5', sm: 'w-7 h-7', md: 'w-9 h-9' };
  return (
    <div className="flex -space-x-2">
      {shown.map((u, i) => (
        <Avatar key={u._id || i} user={u} size={size} className="ring-2 ring-dark-300" />
      ))}
      {extra > 0 && (
        <div className={`${sizeMap[size] || sizeMap.sm} rounded-full bg-dark-100 border-2 border-dark-300 flex items-center justify-center text-gray-400 text-[10px] font-bold`}>
          +{extra}
        </div>
      )}
    </div>
  );
};

export default Avatar;
