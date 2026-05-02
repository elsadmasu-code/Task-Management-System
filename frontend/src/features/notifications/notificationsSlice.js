import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notificationService } from '../../services/chat.service';

export const fetchNotifications = createAsyncThunk('notifications/fetchAll', async (params, { rejectWithValue }) => {
  try { const res = await notificationService.getNotifications(params); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const markAsRead = createAsyncThunk('notifications/markRead', async (id, { rejectWithValue }) => {
  try { await notificationService.markAsRead(id); return id; }
  catch (err) { return rejectWithValue(err.message); }
});

export const markAllAsRead = createAsyncThunk('notifications/markAllRead', async (_, { rejectWithValue }) => {
  try { await notificationService.markAllAsRead(); }
  catch (err) { return rejectWithValue(err.message); }
});

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: { items: [], unreadCount: 0, isLoading: false, error: null },
  reducers: {
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      state.unreadCount++;
    },
    setUnreadCount: (state, action) => { state.unreadCount = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notif = state.items.find(n => n._id === action.payload);
        if (notif && !notif.isRead) { notif.isRead = true; state.unreadCount = Math.max(0, state.unreadCount - 1); }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.items.forEach(n => n.isRead = true);
        state.unreadCount = 0;
      });
  },
});

export const { addNotification, setUnreadCount } = notificationsSlice.actions;
export default notificationsSlice.reducer;
