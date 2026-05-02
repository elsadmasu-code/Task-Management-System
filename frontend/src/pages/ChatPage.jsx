import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMessages, sendMessage, setActiveProject } from '../features/chat/chatSlice';
import { fetchProjects } from '../features/projects/projectsSlice';
import { useSocket } from '../hooks/useSocket';
import Avatar from '../components/ui/Avatar';
import { PageLoader } from '../components/ui/Spinner';
import { timeAgo } from '../utils/helpers';
import { Send, Hash, MessageSquare, Smile } from 'lucide-react';
import toast from 'react-hot-toast';

const ChatPage = () => {
  const dispatch = useDispatch();
  const { emit } = useSocket();
  const { messages, activeProject, isLoading } = useSelector((s) => s.chat);
  const { items: projects } = useSelector((s) => s.projects);
  const user = useSelector((s) => s.auth.user);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { dispatch(fetchProjects()); }, [dispatch]);

  useEffect(() => {
    if (activeProject) {
      dispatch(fetchMessages({ project: activeProject._id }));
      emit('chat:join', activeProject._id);
    }
  }, [activeProject, dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectProject = (project) => {
    dispatch(setActiveProject(project));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeProject) return;
    setIsSending(true);
    try {
      await dispatch(sendMessage({ content: messageText.trim(), project: activeProject._id }));
      setMessageText('');
      inputRef.current?.focus();
    } catch { toast.error('Failed to send message'); }
    finally { setIsSending(false); }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Sidebar — Project List */}
      <div className="w-64 flex-shrink-0 glass rounded-2xl border border-white/8 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/8">
          <h3 className="font-semibold text-white flex items-center gap-2">
            <MessageSquare size={16} className="text-primary-400" /> Channels
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {projects.length === 0 ? (
            <p className="text-gray-500 text-xs text-center mt-4">No projects yet</p>
          ) : (
            projects.map((project) => (
              <button
                key={project._id}
                onClick={() => handleSelectProject(project)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all duration-150 mb-0.5 ${
                  activeProject?._id === project._id
                    ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-white/8'
                }`}
              >
                <Hash size={14} className="flex-shrink-0" />
                <span className="text-sm font-medium truncate">{project.name}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 glass rounded-2xl border border-white/8 flex flex-col overflow-hidden">
        {!activeProject ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-primary-600/20 flex items-center justify-center mb-4">
              <MessageSquare size={28} className="text-primary-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Select a Channel</h3>
            <p className="text-gray-400 text-sm max-w-xs">Choose a project from the left to start chatting with your team in real time.</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="px-5 py-4 border-b border-white/8 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: (activeProject.color || '#6366f1') + '30' }}>
                {activeProject.icon || '#'}
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">{activeProject.name}</h3>
                <p className="text-xs text-gray-500">{activeProject.members?.length} members</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {isLoading ? (
                <PageLoader />
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-4xl mb-3">💬</p>
                  <p className="text-gray-400 text-sm">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isOwn = msg.sender?._id === user?._id;
                  const prevMsg = messages[idx - 1];
                  const showAvatar = !prevMsg || prevMsg.sender?._id !== msg.sender?._id;

                  return (
                    <div key={msg._id} className={`flex items-end gap-2.5 ${isOwn ? 'flex-row-reverse' : ''} ${showAvatar ? 'mt-4' : 'mt-0.5'}`}>
                      {/* Avatar */}
                      {showAvatar && !isOwn ? (
                        <Avatar user={msg.sender} size="sm" className="flex-shrink-0 mb-0.5" />
                      ) : !isOwn ? (
                        <div className="w-8 flex-shrink-0" />
                      ) : null}

                      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                        {showAvatar && !isOwn && (
                          <p className="text-xs text-gray-500 mb-1 ml-1">{msg.sender?.name}</p>
                        )}
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed transition-all
                          ${isOwn
                            ? 'bg-primary-600 text-white rounded-br-sm'
                            : 'glass text-gray-100 rounded-bl-sm border border-white/8'
                          }
                          ${msg.isDeleted ? 'opacity-50 italic' : ''}
                        `}>
                          {msg.content}
                        </div>
                        <p className="text-[10px] text-gray-600 mt-1 mx-1">{timeAgo(msg.createdAt)}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-white/8">
              <div className="flex items-center gap-3">
                <Avatar user={user} size="sm" className="flex-shrink-0" />
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message #${activeProject.name}...`}
                    rows={1}
                    className="input pr-12 resize-none py-2.5 text-sm"
                    style={{ maxHeight: '120px' }}
                  />
                  <button
                    type="submit"
                    disabled={!messageText.trim() || isSending}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary-600 hover:bg-primary-500 disabled:opacity-40 flex items-center justify-center transition-all"
                  >
                    <Send size={14} className="text-white" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-1.5 ml-11">Press Enter to send, Shift+Enter for new line</p>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
