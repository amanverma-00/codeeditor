import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from './utils/axiosClient'

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
    const response =  await axiosClient.post('/user/register', userData);
    return response.data; // Return full response data including requiresVerification
    } catch (error) {
      
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Registration failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/login', credentials);
      return response.data.user;
    } catch (error) {
      
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Login failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/check',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get('/user/check');
      return data.user;
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue(null); 
      }
      
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Auth check failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ emailId, otp }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/verify-otp', { emailId, otp });
      return response.data.user;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'OTP verification failed';
      return rejectWithValue(errorMessage);
    }
  }
);

export const resendOTP = createAsyncThunk(
  'auth/resendOTP',
  async ({ emailId }, { rejectWithValue }) => {
    try {
      const response = await axiosClient.post('/user/resend-otp', { emailId });
      return response.data.message;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Failed to resend OTP';
      return rejectWithValue(errorMessage);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axiosClient.post('/user/logout');
      return null;
    } catch (error) {
      
      const errorMessage = error.response?.data?.message || error.response?.data || error.message || 'Logout failed';
      return rejectWithValue(errorMessage);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  },
  reducers: {
  },
  extraReducers: (builder) => {
    builder
      
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        // Don't set authenticated yet if verification is required
        if (action.payload.requiresVerification) {
          state.isAuthenticated = false;
          state.user = null;
        } else {
          state.isAuthenticated = !!action.payload.user;
          state.user = action.payload.user;
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'Registration failed';
        state.isAuthenticated = false;
        state.user = null;
      })

      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'Login failed';
        state.isAuthenticated = false;
        state.user = null;
      })

      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        
        state.error = action.payload === null ? null : (typeof action.payload === 'string' ? action.payload : 'Auth check failed');
        state.isAuthenticated = false;
        state.user = null;
      })

      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'Logout failed';
        state.isAuthenticated = false;
        state.user = null;
      })

      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = !!action.payload;
        state.user = action.payload;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'OTP verification failed';
        state.isAuthenticated = false;
      })

      .addCase(resendOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resendOTP.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resendOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : 'Failed to resend OTP';
      });
  }
});

export default authSlice.reducer;