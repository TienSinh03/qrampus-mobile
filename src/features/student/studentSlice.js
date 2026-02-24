import { createSlice } from "@reduxjs/toolkit";
import { getStudentProfileThunk, getStudentSchedulesThunk, getMySchedules, getStudentCoursesThunk, transformScheduleToUI, updateStudentProfileThunk } from "./studentThunks";

const initialState = {
    profile: null,
    isLoading: false,
    error: null,
    // Schedule state
    schedules: [], // Raw schedules từ API
    schedulesByDate: {}, // Schedules được group theo ngày { '2025-01-15': [...] }
    schedulesLoading: false,
    schedulesError: null,
    currentScheduleRange: null, // { startDate, endDate } - range đang fetch
    // Courses state
    courses: [], // Danh sách khóa học
    coursesLoading: false,
    coursesError: null,
};

/**
 * Group schedules theo ngày
 */
const groupSchedulesByDate = (schedules) => {
    const grouped = {};
    schedules.forEach(schedule => {
        const date = schedule.classDate;
        if (!grouped[date]) {
            grouped[date] = [];
        }
        grouped[date].push(schedule);
    });
    
    // Sort schedules trong mỗi ngày theo startTime
    Object.keys(grouped).forEach(date => {
        grouped[date].sort((a, b) => a.startHour.localeCompare(b.startHour));
    });
    
    return grouped;
};

const studentSlice = createSlice({
    name: 'student',
    initialState,
    reducers: {
        // Reset student state
        resetStudentState: () => initialState,
        // Clear schedule error
        clearScheduleError: (state) => {
            state.schedulesError = null;
        },
        // Clear schedules
        clearSchedules: (state) => {
            state.schedules = [];
            state.schedulesByDate = {};
            state.currentScheduleRange = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Get student profile
            .addCase(getStudentProfileThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getStudentProfileThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.profile = action.payload;
                state.error = null;
            })
            .addCase(getStudentProfileThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Get student schedules
            .addCase(getStudentSchedulesThunk.pending, (state) => {
                state.schedulesLoading = true;
                state.schedulesError = null;
            })
            .addCase(getStudentSchedulesThunk.fulfilled, (state, action) => {
                state.schedulesLoading = false;
                state.schedules = action.payload.schedules;
                state.schedulesByDate = groupSchedulesByDate(action.payload.schedules);
                state.currentScheduleRange = action.payload.params;
                state.schedulesError = null;
            })
            .addCase(getStudentSchedulesThunk.rejected, (state, action) => {
                state.schedulesLoading = false;
                state.schedulesError = action.payload;
            })
            // Get my schedules for today
            .addCase(getMySchedules.pending, (state) => {
                state.schedulesLoading = true;
                state.schedulesError = null;
            })
            .addCase(getMySchedules.fulfilled, (state, action) => {
                state.schedulesLoading = false;
                state.schedules = action.payload.schedules;
                state.schedulesByDate = groupSchedulesByDate(action.payload.schedules);
                state.schedulesError = null;
            })
            .addCase(getMySchedules.rejected, (state, action) => {
                state.schedulesLoading = false;
                state.schedulesError = action.payload;
            })
            // Get student courses
            .addCase(getStudentCoursesThunk.pending, (state) => {
                state.coursesLoading = true;
                state.coursesError = null;
            })
            .addCase(getStudentCoursesThunk.fulfilled, (state, action) => {
                state.coursesLoading = false;
                state.courses = action.payload.courses;
                state.coursesError = null;
            })
            .addCase(getStudentCoursesThunk.rejected, (state, action) => {
                state.coursesLoading = false;
                state.coursesError = action.payload;
            })
            // Update student profile
            .addCase(updateStudentProfileThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateStudentProfileThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.profile = action.payload;
                state.error = null;
            })
            .addCase(updateStudentProfileThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });
    },
});

export const { resetStudentState, clearScheduleError, clearSchedules } = studentSlice.actions;

// Selectors
export const selectStudentProfile = (state) => state.student.profile;
export const selectStudentLoading = (state) => state.student.isLoading;
export const selectStudentError = (state) => state.student.error;

// Schedule selectors
export const selectStudentSchedules = (state) => state.student.schedules;
export const selectSchedulesByDate = (state) => state.student.schedulesByDate;
export const selectSchedulesLoading = (state) => state.student.schedulesLoading;
export const selectSchedulesError = (state) => state.student.schedulesError;
export const selectCurrentScheduleRange = (state) => state.student.currentScheduleRange;

// Courses selectors
export const selectStudentCourses = (state) => state.student.courses;
export const selectCoursesLoading = (state) => state.student.coursesLoading;
export const selectCoursesError = (state) => state.student.coursesError;

export default studentSlice.reducer;