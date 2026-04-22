import { createSlice } from '@reduxjs/toolkit';
import {
  fetchImageSessionsByTeacher,
  checkImageSessionStatus,
  createImageSession,
} from './imageSessionThunks.js';

const initialState = {
  // Danh sách phiên chụp ảnh (có phân trang)
  sessions: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
  isLoading: false,
  error: null,

  // Trạng thái check
  sessionStatus: null,
  checkLoading: false,
  checkError: null,

  // Tạo mới
  newSession: null,
  createLoading: false,
  createError: null,
};

const imageSessionSlice = createSlice({
  name: 'imageSession',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.checkError = null;
      state.createError = null;
    },
    clearSessions: (state) => {
      state.sessions = [];
      state.pagination = initialState.pagination;
    },
    clearNewSession: (state) => {
      state.newSession = null;
    },
    resetImageSessionState: () => initialState,
    
    // Socket handlers
    setImageSessionStatus: (state, action) => {
      state.sessionStatus = action.payload;
    },
    addImageSession: (state, action) => {
      const newSession = action.payload;
      // Check if session already exists
      const exists = state.sessions.some(s => s.id === newSession.id);
      if (!exists) {
        state.sessions.unshift(newSession);
        state.pagination.total += 1;
      }
    },
    updateImageSessionStatus: (state, action) => {
      const { sessionId, status } = action.payload;
      const session = state.sessions.find(s => s.id === sessionId);
      if (session) {
        session.status = status;
      }
      if (state.sessionStatus?.id === sessionId) {
        state.sessionStatus.status = status;
      }
    },
  },
  extraReducers: (builder) => {
    // fetchImageSessionsByTeacher
    builder
      .addCase(fetchImageSessionsByTeacher.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchImageSessionsByTeacher.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sessions = action.payload.data || [];
        state.pagination = {
          total: action.payload.total || 0,
          page: action.payload.page || 1,
          limit: action.payload.limit || 10,
          totalPages: action.payload.totalPages || 1,
        };
      })
      .addCase(fetchImageSessionsByTeacher.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // checkImageSessionStatus
    builder
      .addCase(checkImageSessionStatus.pending, (state) => {
        state.checkLoading = true;
        state.checkError = null;
      })
      .addCase(checkImageSessionStatus.fulfilled, (state, action) => {
        state.checkLoading = false;
        state.sessionStatus = action.payload;
      })
      .addCase(checkImageSessionStatus.rejected, (state, action) => {
        state.checkLoading = false;
        state.checkError = action.payload;
      });

    // createImageSession
    builder
      .addCase(createImageSession.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createImageSession.fulfilled, (state, action) => {
        state.createLoading = false;
        state.newSession = action.payload;
        // Thêm session mới vào đầu danh sách
        state.sessions.unshift(action.payload);
      })
      .addCase(createImageSession.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      });
  },
});

export const {
  clearError,
  clearSessions,
  clearNewSession,
  resetImageSessionState,
  setImageSessionStatus,
  addImageSession,
  updateImageSessionStatus,
} = imageSessionSlice.actions;

export default imageSessionSlice.reducer;
