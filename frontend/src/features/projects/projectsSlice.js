import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { projectService } from '../../services/chat.service';

export const fetchProjects = createAsyncThunk('projects/fetchAll', async (params, { rejectWithValue }) => {
  try { const res = await projectService.getProjects(params); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const fetchProject = createAsyncThunk('projects/fetchOne', async (id, { rejectWithValue }) => {
  try { const res = await projectService.getProject(id); return res.data; }
  catch (err) { return rejectWithValue(err.message); }
});

export const createProject = createAsyncThunk('projects/create', async (data, { rejectWithValue }) => {
  try { const res = await projectService.createProject(data); return res.data.project; }
  catch (err) { return rejectWithValue(err.message); }
});

export const updateProject = createAsyncThunk('projects/update', async ({ id, data }, { rejectWithValue }) => {
  try { const res = await projectService.updateProject(id, data); return res.data.project; }
  catch (err) { return rejectWithValue(err.message); }
});

export const deleteProject = createAsyncThunk('projects/delete', async (id, { rejectWithValue }) => {
  try { await projectService.deleteProject(id); return id; }
  catch (err) { return rejectWithValue(err.message); }
});

const projectsSlice = createSlice({
  name: 'projects',
  initialState: { items: [], currentProject: null, isLoading: false, error: null, total: 0 },
  reducers: {
    setCurrentProject: (state, action) => { state.currentProject = action.payload; },
    clearProjects: (state) => { state.items = []; state.total = 0; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => { state.isLoading = true; })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.projects;
        state.total = action.payload.total;
      })
      .addCase(fetchProjects.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      .addCase(fetchProject.fulfilled, (state, action) => { state.currentProject = action.payload.project; })
      .addCase(createProject.fulfilled, (state, action) => { state.items.unshift(action.payload); state.total++; })
      .addCase(updateProject.fulfilled, (state, action) => {
        const idx = state.items.findIndex(p => p._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
        if (state.currentProject?._id === action.payload._id) state.currentProject = action.payload;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p._id !== action.payload);
        state.total--;
      });
  },
});

export const { setCurrentProject, clearProjects } = projectsSlice.actions;
export default projectsSlice.reducer;
