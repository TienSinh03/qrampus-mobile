import { createSlice } from "@reduxjs/toolkit";
import { loadSessionThunk, loginThunk, logoutThunk, refreshTokenThunk } from "./authThunks";

// Định nghĩa các role hợp lệ
export const ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
};

const initialState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isSessionLoaded: false,
  error: null,
  loginRole: null, // Role được chọn khi login (student/teacher)
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set role trước khi login
    setLoginRole: (state, action) => {
      state.loginRole = action.payload;
    },
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    // Reset auth state
    resetAuth: () => initialState,
    // Update tokens (dùng khi refresh)
    updateTokens: (state, action) => {
      state.accessToken = action.payload.accessToken;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
    },
  },
  extraReducers: (builder) => {
    builder
        // Load session
        .addCase(loadSessionThunk.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(loadSessionThunk.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isSessionLoaded = true;
            state.accessToken = action.payload.accessToken;
            state.user = action.payload.user;
            state.isAuthenticated = !!action.payload.accessToken;
            state.loginRole = action.payload.loginRole;
        })
        .addCase(loadSessionThunk.rejected, (state) => {
            state.isLoading = false;
            state.isSessionLoaded = true;
        })
        // Login
        .addCase(loginThunk.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(loginThunk.fulfilled, (state, action) => {
            state.isLoading = false;
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
            state.user = action.payload.user;
            state.isAuthenticated = true;
            state.error = null;
        })
        .addCase(loginThunk.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
            state.isAuthenticated = false;
        })
        
        // Logout
        .addCase(logoutThunk.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(logoutThunk.fulfilled, (state) => {
            return { ...initialState, isSessionLoaded: true };
        })
        .addCase(logoutThunk.rejected, (state) => {
            return { ...initialState, isSessionLoaded: true };
        })
        
        // Refresh token
        .addCase(refreshTokenThunk.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(refreshTokenThunk.fulfilled, (state, action) => {
          state.isLoading = false;
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken || state.refreshToken;
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.error = null;
        })
        .addCase(refreshTokenThunk.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload;
          state.isAuthenticated = false;
        });

  },
});

export const { setLoginRole, clearError, resetAuth, updateTokens } = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectLoginRole = (state) => state.auth.loginRole;
export const selectUserRoles = (state) => state.auth.user?.roles || [];

// Helper để check role
export const hasRole = (userRoles, role) => {
  if (!userRoles || !Array.isArray(userRoles)) return false;
  return userRoles.includes(role);
};

export default authSlice.reducer;
