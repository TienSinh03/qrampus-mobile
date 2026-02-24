import { createSlice } from "@reduxjs/toolkit";
import {
  createLeaveRequestThunk,
  getLeaveRequestsOfStudentThunk,
  getTeacherLeaveRequestsThunk,
  getLeavesByScheduleThunk,
  approveLeaveRequestThunk,
  rejectLeaveRequestThunk,
} from "./leaveRequestThunk";

const initialState = {
  // Student state
  studentLeaves: [],
  studentLeavesLoading: false,
  studentLeavesError: null,
  
  // Teacher state
  teacherLeaves: [],
  teacherLeavesLoading: false,
  teacherLeavesError: null,
  
  // Detail state (shared)
  currentLeaveRequest: null,
  detailLoading: false,
  detailError: null,
  
  // Create state
  createLoading: false,
  createError: null,
  createSuccess: false,
  
  // Approve/Reject state
  actionLoading: false,
  actionError: null,
  actionSuccess: false,
  
  // Pagination
  pagination: null,
};

const leaveRequestSlice = createSlice({
  name: "leaveRequests",
  initialState,
  reducers: {
    // Reset create state
    resetCreateState: (state) => {
      state.createLoading = false;
      state.createError = null;
      state.createSuccess = false;
    },
    // Reset action state (approve/reject)
    resetActionState: (state) => {
      state.actionLoading = false;
      state.actionError = null;
      state.actionSuccess = false;
    },
    // Reset detail state
    resetDetailState: (state) => {
      state.currentLeaveRequest = null;
      state.detailLoading = false;
      state.detailError = null;
    },
    // Clear errors
    clearErrors: (state) => {
      state.studentLeavesError = null;
      state.teacherLeavesError = null;
      state.detailError = null;
      state.createError = null;
      state.actionError = null;
    },
    // Update leave request in list after approve/reject
    updateLeaveInList: (state, action) => {
      const updatedLeave = action.payload;
      // Update in student list
      const studentIndex = state.studentLeaves.findIndex(l => l.id === updatedLeave.id);
      if (studentIndex !== -1) {
        state.studentLeaves[studentIndex] = updatedLeave;
      }
      // Update in teacher list
      const teacherIndex = state.teacherLeaves.findIndex(l => l.id === updatedLeave.id);
      if (teacherIndex !== -1) {
        state.teacherLeaves[teacherIndex] = updatedLeave;
      }
      // Update current detail
      if (state.currentLeaveRequest?.id === updatedLeave.id) {
        state.currentLeaveRequest = updatedLeave;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // ==================== CREATE LEAVE REQUEST ====================
      .addCase(createLeaveRequestThunk.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
        state.createSuccess = false;
      })
      .addCase(createLeaveRequestThunk.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createSuccess = true;
        // Add new leave to student list
        if (action.payload) {
          state.studentLeaves.unshift(action.payload);
        }
      })
      .addCase(createLeaveRequestThunk.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload || "Tao yeu cau nghi that bai";
      })

      // ==================== GET STUDENT LEAVES ====================
      .addCase(getLeaveRequestsOfStudentThunk.pending, (state) => {
        state.studentLeavesLoading = true;
        state.studentLeavesError = null;
      })
      .addCase(getLeaveRequestsOfStudentThunk.fulfilled, (state, action) => {
        state.studentLeavesLoading = false;
        state.studentLeaves = action.payload.leaves || [];
        state.pagination = action.payload.pagination || null;
      })
      .addCase(getLeaveRequestsOfStudentThunk.rejected, (state, action) => {
        state.studentLeavesLoading = false;
        state.studentLeavesError = action.payload || "Lay danh sach yeu cau nghi that bai";
      })

      // ==================== GET TEACHER LEAVES ====================
      .addCase(getTeacherLeaveRequestsThunk.pending, (state) => {
        state.teacherLeavesLoading = true;
        state.teacherLeavesError = null;
      })
      .addCase(getTeacherLeaveRequestsThunk.fulfilled, (state, action) => {
        state.teacherLeavesLoading = false;
        state.teacherLeaves = action.payload.leaves || [];
        state.pagination = action.payload.pagination || null;
      })
      .addCase(getTeacherLeaveRequestsThunk.rejected, (state, action) => {
        state.teacherLeavesLoading = false;
        state.teacherLeavesError = action.payload || "Lay danh sach yeu cau nghi that bai";
      })

      // ==================== GET LEAVES BY SCHEDULE ====================
      .addCase(getLeavesByScheduleThunk.pending, (state) => {
        state.teacherLeavesLoading = true;
        state.teacherLeavesError = null;
      })
      .addCase(getLeavesByScheduleThunk.fulfilled, (state, action) => {
        state.teacherLeavesLoading = false;
        state.teacherLeaves = action.payload.leaves || [];
        state.pagination = action.payload.pagination || null;
      })
      .addCase(getLeavesByScheduleThunk.rejected, (state, action) => {
        state.teacherLeavesLoading = false;
        state.teacherLeavesError = action.payload || "Lay danh sach yeu cau nghi theo lich that bai";
      })

      // ==================== APPROVE LEAVE REQUEST ====================
      .addCase(approveLeaveRequestThunk.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = false;
      })
      .addCase(approveLeaveRequestThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = true;
        // Update leave in lists
        if (action.payload) {
          const updatedLeave = action.payload;
          const teacherIndex = state.teacherLeaves.findIndex(l => l.id === updatedLeave.id);
          if (teacherIndex !== -1) {
            state.teacherLeaves[teacherIndex] = updatedLeave;
          }
          if (state.currentLeaveRequest?.id === updatedLeave.id) {
            state.currentLeaveRequest = updatedLeave;
          }
        }
      })
      .addCase(approveLeaveRequestThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || "Duyet yeu cau nghi that bai";
      })

      // ==================== REJECT LEAVE REQUEST ====================
      .addCase(rejectLeaveRequestThunk.pending, (state) => {
        state.actionLoading = true;
        state.actionError = null;
        state.actionSuccess = false;
      })
      .addCase(rejectLeaveRequestThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionSuccess = true;
        // Update leave in lists
        if (action.payload) {
          const updatedLeave = action.payload;
          const teacherIndex = state.teacherLeaves.findIndex(l => l.id === updatedLeave.id);
          if (teacherIndex !== -1) {
            state.teacherLeaves[teacherIndex] = updatedLeave;
          }
          if (state.currentLeaveRequest?.id === updatedLeave.id) {
            state.currentLeaveRequest = updatedLeave;
          }
        }
      })
      .addCase(rejectLeaveRequestThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionError = action.payload || "Tu choi yeu cau nghi that bai";
      });
  },
});

export const {
  resetCreateState,
  resetActionState,
  resetDetailState,
  clearErrors,
  updateLeaveInList,
} = leaveRequestSlice.actions;

export default leaveRequestSlice.reducer;
