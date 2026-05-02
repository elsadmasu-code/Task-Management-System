import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import tasksReducer from '../features/tasks/tasksSlice';
import projectsReducer from '../features/projects/projectsSlice';
import chatReducer from '../features/chat/chatSlice';
import notificationsReducer from '../features/notifications/notificationsSlice';
import activityReducer from '../features/activity/activitySlice';
import workspacesReducer from '../features/workspaces/workspacesSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: tasksReducer,
    projects: projectsReducer,
    chat: chatReducer,
    notifications: notificationsReducer,
    activity: activityReducer,
    workspaces: workspacesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export default store;
