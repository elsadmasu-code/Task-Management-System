import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../features/auth/authSlice';
import { useTheme } from '../hooks/useTheme';
import { userService } from '../services/chat.service';
import authService from '../services/auth.service';
import Avatar from '../components/ui/Avatar';
import { Sun, Moon, User, Lock, Bell, Palette, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

const Settings = () => {
  const dispatch = useDispatch();
  const { isDark, toggleTheme } = useTheme();
  const user = useSelector((s) => s.auth.user);

  const [profile, setProfile] = useState({ name: user?.name || '', bio: user?.bio || '', phone: user?.phone || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const res = await userService.updateProfile(profile);
      dispatch(updateUser(res.data.user));
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update profile'); }
    finally { setIsSavingProfile(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setIsSavingPassword(true);
    try {
      await authService.changePassword({ currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.message || 'Failed to change password'); }
    finally { setIsSavingPassword(false); }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="page-header">
        <h1 className="section-title">Settings</h1>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-1 glass rounded-xl p-1 border border-white/10 w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === id ? 'bg-primary-600 text-white shadow-glow' : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card animate-fade-in space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar user={user} size="xl" />
              <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center shadow-glow hover:bg-primary-500 transition-all">
                <Camera size={13} className="text-white" />
              </button>
            </div>
            <div>
              <p className="font-semibold text-white text-lg">{user?.name}</p>
              <p className="text-gray-400 text-sm">{user?.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs bg-primary-600/20 text-primary-300 border border-primary-500/30 capitalize">
                {user?.role}
              </span>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Your full name" />
            </div>
            <div>
              <label className="label">Bio</label>
              <textarea className="input resize-none" rows={3} value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Tell your team about yourself..." />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+1 234 567 890" />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input opacity-60 cursor-not-allowed" value={user?.email} disabled />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            <button type="submit" disabled={isSavingProfile} className="btn-primary flex items-center gap-2">
              {isSavingProfile && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Save Changes
            </button>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="card animate-fade-in space-y-5">
          <h3 className="font-semibold text-white">Change Password</h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input type="password" className="input" value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} placeholder="Enter current password" required />
            </div>
            <div>
              <label className="label">New Password</label>
              <input type="password" className="input" value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} placeholder="At least 6 characters" required />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input type="password" className={`input ${passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword ? 'border-red-500' : ''}`}
                value={passwords.confirmPassword} onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })} placeholder="Repeat new password" required />
            </div>
            <button type="submit" disabled={isSavingPassword} className="btn-primary flex items-center gap-2">
              {isSavingPassword && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              Update Password
            </button>
          </form>
        </div>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <div className="card animate-fade-in space-y-6">
          <h3 className="font-semibold text-white">Theme</h3>
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => !isDark && toggleTheme()}
              className={`p-4 rounded-xl border-2 transition-all text-left ${!isDark ? 'border-primary-500 bg-primary-500/10' : 'border-white/10 hover:border-white/20'}`}>
              <div className="w-full h-20 rounded-lg bg-gray-100 mb-3 flex items-center justify-center">
                <Sun size={24} className="text-amber-500" />
              </div>
              <p className="font-medium text-white text-sm">Light Mode</p>
              <p className="text-xs text-gray-400">Clean and bright interface</p>
            </button>
            <button onClick={() => isDark || toggleTheme()}
              className={`p-4 rounded-xl border-2 transition-all text-left ${isDark ? 'border-primary-500 bg-primary-500/10' : 'border-white/10 hover:border-white/20'}`}>
              <div className="w-full h-20 rounded-lg bg-dark-400 mb-3 flex items-center justify-center border border-white/10">
                <Moon size={24} className="text-primary-400" />
              </div>
              <p className="font-medium text-white text-sm">Dark Mode</p>
              <p className="text-xs text-gray-400">Easy on the eyes at night</p>
            </button>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="card animate-fade-in space-y-4">
          <h3 className="font-semibold text-white">Notification Preferences</h3>
          {[
            { label: 'Task assigned to me', desc: 'When someone assigns a task to you' },
            { label: 'Comment on my task', desc: 'When someone comments on your task' },
            { label: 'Deadline reminder', desc: '24 hours before a task is due' },
            { label: 'Project invitations', desc: 'When added to a new project' },
            { label: 'Task status updates', desc: 'When a task you watch changes status' },
          ].map(({ label, desc }) => (
            <div key={label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
              <div>
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-10 h-5 bg-gray-700 rounded-full peer peer-checked:bg-primary-600 peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all" />
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Settings;
