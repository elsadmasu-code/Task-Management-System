import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useDispatch } from 'react-redux';
import { addMessage } from '../features/chat/chatSlice';
import { addNotification } from '../features/notifications/notificationsSlice';
import { updateTaskLocally, addTaskFromSocket } from '../features/tasks/tasksSlice';
import { useAuth } from './useAuth';

let socket = null;

export const useSocket = () => {
  const { user, isAuthenticated } = useAuth();
  const dispatch = useDispatch();
  const socketRef = useRef(null);

  const connect = useCallback(() => {
    if (!isAuthenticated || !user) return;
    if (socketRef.current?.connected) return;

    const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { userId: user._id },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      newSocket.emit('join', user._id);
      newSocket.emit('notification:join', user._id);
    });

    newSocket.on('message:new', (message) => {
      dispatch(addMessage(message));
    });

    newSocket.on('notification', (notification) => {
      dispatch(addNotification(notification));
    });

    newSocket.on('task:updated', (task) => {
      dispatch(updateTaskLocally(task));
    });

    newSocket.on('task:created', (task) => {
      dispatch(addTaskFromSocket(task));
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    newSocket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });

    socketRef.current = newSocket;
    socket = newSocket;
    return newSocket;
  }, [isAuthenticated, user, dispatch]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      socket = null;
    }
  }, []);

  const joinRoom = useCallback((roomId) => {
    socketRef.current?.emit('joinRoom', roomId);
  }, []);

  const leaveRoom = useCallback((roomId) => {
    socketRef.current?.emit('leaveRoom', roomId);
  }, []);

  const emit = useCallback((event, data) => {
    socketRef.current?.emit(event, data);
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect]);

  return { socket: socketRef.current, connect, disconnect, joinRoom, leaveRoom, emit };
};

export { socket };
export default useSocket;
