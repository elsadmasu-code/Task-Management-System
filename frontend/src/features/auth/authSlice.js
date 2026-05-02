import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/auth.service';

const storedUser = localStorage.getItem('tms_user');
const storedToken = localStorage.getItem('tms_token');

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await authService.register(data);
    localStorage.setItem('tms_token', res.data.token);
    localStorage.setItem('tms_user', JSON.stringify(res.data.user));
    return res.data;
  } catch (err) { return rejectWithValue(err.message || 'Registration failed'); }
});

export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await authService.login(data);
    localStorage.setItem('tms_token', res.data.token);
    localStorage.setItem('tms_user', JSON.stringify(res.data.user));
    return res.data;
  } catch (err) { return rejectWithValue(err.message || 'Login failed'); }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authService.logout();
  } catch (_) {}
  localStorage.removeItem('tms_token');
  localStorage.removeItem('tms_user');
});

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const res = await authService.getMe();
    return res.data.user;
  } catch (err) { return rejectWithValue(err.message); }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken || null,
    isLoading: false,
    error: null,
    isAuthenticated: !!storedToken,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('tms_user', JSON.stringify(state.user));
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.isLoading = true; state.error = null; };
    const rejected = (state, action) => { state.isLoading = false; state.error = action.payload; };

    builder
      .addCase(register.pending, pending)
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, rejected)
      .addCase(login.pending, pending)
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, rejected)
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem('tms_user', JSON.stringify(action.payload));
      });
  },
});

export const { clearError, updateUser } = authSlice.actions;
export default authSlice.reducer;
