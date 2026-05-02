import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { activityService } from '../../services/chat.service';

export const fetchProjectActivity = createAsyncThunk('activity/fetchProject', async ({ projectId, params }, { rejectWithValue }) => {
  try { const res = await activityService.getProjectActivity(projectId, params); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const fetchUserActivity = createAsyncThunk('activity/fetchUser', async (params, { rejectWithValue }) => {
  try { const res = await activityService.getUserActivity(params); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

const activitySlice = createSlice({
  name: 'activity',
  initialState: { logs: [], isLoading: false, error: null, total: 0 },
  reducers: {
    addActivityLog: (state, action) => { state.logs.unshift(action.payload); },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjectActivity.pending, (state) => { state.isLoading = true; })
      .addCase(fetchProjectActivity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.logs = action.payload.logs;
        state.total = action.payload.total;
      })
      .addCase(fetchProjectActivity.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      .addCase(fetchUserActivity.fulfilled, (state, action) => { state.logs = action.payload.logs; state.total = action.payload.total; });
  },
});

export const { addActivityLog } = activitySlice.actions;
export default activitySlice.reducer;
