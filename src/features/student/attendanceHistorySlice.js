import { createSlice } from "@reduxjs/toolkit";
import { getAttendanceHistoryThunk } from "./attendanceHistoryThunks";

const initialState = {
  // Lịch sử điểm danh
  records: [],
  
  // Thống kê tổng quan
  summary: {
    totalSessions: 0,
    presentCount: 0,
    absentCount: 0,
    excusedCount: 0,
    attendanceRate: 0,
  },
  
  // Các filters đang áp dụng
  currentFilters: {
    semester: null,
    courseSectionId: null,
    status: null,
    fromDate: null,
    toDate: null,
  },
  
  // Pagination
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  
  // Danh sách học kỳ có sẵn
  availableSemesters: [],
  
  // Loading states
  isLoading: false,
  isRefreshing: false,
  isLoadingMore: false,
  
  error: null,
};

const attendanceHistorySlice = createSlice({
  name: 'attendanceHistory',
  initialState,
  reducers: {
    // Reset state
    resetAttendanceHistoryState: () => initialState,
    
    // Clear error
    clearAttendanceHistoryError: (state) => {
      state.error = null;
    },
    
    // Set filters
    setAttendanceFilters: (state, action) => {
      state.currentFilters = {
        ...state.currentFilters,
        ...action.payload,
      };
    },
    
    // Clear filters
    clearAttendanceFilters: (state) => {
      state.currentFilters = initialState.currentFilters;
    },
    
    // Set refreshing state
    setAttendanceRefreshing: (state, action) => {
      state.isRefreshing = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get attendance history
      .addCase(getAttendanceHistoryThunk.pending, (state, action) => {
        const { isLoadMore, isRefresh } = action.meta.arg || {};
        
        if (isLoadMore) {
          state.isLoadingMore = true;
        } else if (isRefresh) {
          state.isRefreshing = true;
        } else {
          state.isLoading = true;
        }
        state.error = null;
      })
      .addCase(getAttendanceHistoryThunk.fulfilled, (state, action) => {
        const { isLoadMore } = action.meta.arg || {};
        const { student, summary, filters, pagination, records, availableSemesters } = action.payload;
        
        state.summary = summary;
        state.currentFilters = filters;
        state.pagination = pagination;
        state.availableSemesters = availableSemesters;
        
        if (isLoadMore) {
          // Append records khi load more
          state.records = [...state.records, ...records];
        } else {
          // Replace records khi fetch mới
          state.records = records;
        }
        
        state.isLoading = false;
        state.isRefreshing = false;
        state.isLoadingMore = false;
        state.error = null;
      })
      .addCase(getAttendanceHistoryThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.isRefreshing = false;
        state.isLoadingMore = false;
        state.error = action.payload;
      });
  },
});

export const {
  resetAttendanceHistoryState,
  clearAttendanceHistoryError,
  setAttendanceFilters,
  clearAttendanceFilters,
  setAttendanceRefreshing,
} = attendanceHistorySlice.actions;

// Selectors
export const selectAttendanceRecords = (state) => state.attendanceHistory.records;
export const selectAttendanceStudent = (state) => state.attendanceHistory.student;
export const selectAttendanceSummary = (state) => state.attendanceHistory.summary;
export const selectAttendanceFilters = (state) => state.attendanceHistory.currentFilters;
export const selectAttendancePagination = (state) => state.attendanceHistory.pagination;
export const selectAvailableSemesters = (state) => state.attendanceHistory.availableSemesters;
export const selectAttendanceHistoryLoading = (state) => state.attendanceHistory.isLoading;
export const selectAttendanceHistoryRefreshing = (state) => state.attendanceHistory.isRefreshing;
export const selectAttendanceHistoryLoadingMore = (state) => state.attendanceHistory.isLoadingMore;
export const selectAttendanceHistoryError = (state) => state.attendanceHistory.error;

export default attendanceHistorySlice.reducer;
