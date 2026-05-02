import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { workspaceService } from '../../services/chat.service';

export const fetchWorkspaces = createAsyncThunk('workspaces/fetchAll', async (_, { rejectWithValue }) => {
  try { const res = await workspaceService.getWorkspaces(); return res.data.workspaces; }
  catch (err) { return rejectWithValue(err.message); }
});

export const createWorkspace = createAsyncThunk('workspaces/create', async (data, { rejectWithValue }) => {
  try { const res = await workspaceService.createWorkspace(data); return res.data.workspace; }
  catch (err) { return rejectWithValue(err.message); }
});

const workspacesSlice = createSlice({
  name: 'workspaces',
  initialState: { items: [], current: null, isLoading: false, error: null },
  reducers: {
    setCurrentWorkspace: (state, action) => { state.current = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkspaces.pending, (state) => { state.isLoading = true; })
      .addCase(fetchWorkspaces.fulfilled, (state, action) => { state.isLoading = false; state.items = action.payload; })
      .addCase(fetchWorkspaces.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      .addCase(createWorkspace.fulfilled, (state, action) => { state.items.unshift(action.payload); });
  },
});

export const { setCurrentWorkspace } = workspacesSlice.actions;
export default workspacesSlice.reducer;
