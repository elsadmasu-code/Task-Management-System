import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import chatService from '../../services/chat.service';

export const fetchMessages = createAsyncThunk('chat/fetchMessages', async (params, { rejectWithValue }) => {
  try { const res = await chatService.getMessages(params); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const sendMessage = createAsyncThunk('chat/send', async (data, { rejectWithValue }) => {
  try { const res = await chatService.sendMessage(data); return res.data.message; }
  catch (err) { return rejectWithValue(err.message); }
});

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [],
    activeProject: null,
    activeDM: null,
    isLoading: false,
    error: null,
    unreadCount: 0,
  },
  reducers: {
    setActiveProject: (state, action) => { state.activeProject = action.payload; state.messages = []; },
    setActiveDM: (state, action) => { state.activeDM = action.payload; state.messages = []; },
    addMessage: (state, action) => {
      if (!state.messages.find(m => m._id === action.payload._id)) {
        state.messages.push(action.payload);
      }
    },
    updateMessage: (state, action) => {
      const idx = state.messages.findIndex(m => m._id === action.payload._id);
      if (idx !== -1) state.messages[idx] = action.payload;
    },
    deleteMessageLocally: (state, action) => {
      const idx = state.messages.findIndex(m => m._id === action.payload);
      if (idx !== -1) state.messages[idx].isDeleted = true;
    },
    setUnreadCount: (state, action) => { state.unreadCount = action.payload; },
    incrementUnread: (state) => { state.unreadCount++; },
    clearMessages: (state) => { state.messages = []; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => { state.isLoading = true; })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload.messages;
      })
      .addCase(fetchMessages.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      .addCase(sendMessage.fulfilled, (state, action) => {
        if (!state.messages.find(m => m._id === action.payload._id)) {
          state.messages.push(action.payload);
        }
      });
  },
});

export const { setActiveProject, setActiveDM, addMessage, updateMessage, deleteMessageLocally, setUnreadCount, incrementUnread, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;
