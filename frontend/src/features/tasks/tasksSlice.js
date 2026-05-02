import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { taskService } from '../../services/task.service';
import taskServiceDefault from '../../services/task.service';

export const fetchTasks = createAsyncThunk('tasks/fetchAll', async (params, { rejectWithValue }) => {
  try { const res = await taskServiceDefault.getTasks(params); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const fetchMyTasks = createAsyncThunk('tasks/fetchMine', async (params, { rejectWithValue }) => {
  try { const res = await taskServiceDefault.getMyTasks(params); return res.data.tasks; }
  catch (err) { return rejectWithValue(err.message); }
});

export const createTask = createAsyncThunk('tasks/create', async (data, { rejectWithValue }) => {
  try { const res = await taskServiceDefault.createTask(data); return res.data.task; }
  catch (err) { return rejectWithValue(err.message); }
});

export const updateTask = createAsyncThunk('tasks/update', async ({ id, data }, { rejectWithValue }) => {
  try { const res = await taskServiceDefault.updateTask(id, data); return res.data.task; }
  catch (err) { return rejectWithValue(err.message); }
});

export const deleteTask = createAsyncThunk('tasks/delete', async (id, { rejectWithValue }) => {
  try { await taskServiceDefault.deleteTask(id); return id; }
  catch (err) { return rejectWithValue(err.message); }
});

export const bulkUpdateTasks = createAsyncThunk('tasks/bulkUpdate', async (tasks, { rejectWithValue }) => {
  try { await taskServiceDefault.bulkUpdate(tasks); return tasks; }
  catch (err) { return rejectWithValue(err.message); }
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: { items: [], myTasks: [], isLoading: false, error: null, total: 0, currentTask: null },
  reducers: {
    setCurrentTask: (state, action) => { state.currentTask = action.payload; },
    updateTaskLocally: (state, action) => {
      const idx = state.items.findIndex(t => t._id === action.payload._id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
    addTaskFromSocket: (state, action) => {
      if (!state.items.find(t => t._id === action.payload._id)) {
        state.items.unshift(action.payload);
      }
    },
    clearTasks: (state) => { state.items = []; state.total = 0; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => { state.isLoading = true; })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.tasks;
        state.total = action.payload.total;
      })
      .addCase(fetchTasks.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      .addCase(fetchMyTasks.fulfilled, (state, action) => { state.myTasks = action.payload; })
      .addCase(createTask.fulfilled, (state, action) => { state.items.unshift(action.payload); state.total++; })
      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.items.findIndex(t => t._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter(t => t._id !== action.payload);
        state.total--;
      })
      .addCase(bulkUpdateTasks.fulfilled, (state, action) => {
        action.payload.forEach(update => {
          const idx = state.items.findIndex(t => t._id === update._id);
          if (idx !== -1) state.items[idx] = { ...state.items[idx], ...update };
        });
      });
  },
});

export const { setCurrentTask, updateTaskLocally, addTaskFromSocket, clearTasks } = tasksSlice.actions;
export default tasksSlice.reducer;
