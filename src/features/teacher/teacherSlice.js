import { createSlice } from "@reduxjs/toolkit";
import { getTeacherProfileThunk, getTeacherSchedulesThunk, getMySchedulesToday, getTeacherCoursesThunk, updateTeacherProfileThunk, getTeacherWorkloadThunk } from "./teacherThunks";

const initialState = {
    profile: null,
    isLoading: false,
    error: null,

    // schedule
    schedules: [], // Raw schedules từ API
    schedulesToday: [], // Lịch học hôm nay riêng biệt để dễ truy cập
    schedulesByDate: {}, // Schedules được group theo ngày { '2025-01-15': [...] }
    schedulesLoading: false,
    schedulesError: null,
    currentScheduleRange: null, // { startDate, endDate }

    // Courses state
    courses: [], // Danh sách khóa học giảng dạy
    coursesLoading: false,
    coursesError: null,

    // Workload state
    workload: null, 
    workloadLoading: false,
    workloadError: null,
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

const teacherSlice = createSlice({
    name: 'teacher',
    initialState,
    reducers: {
        // Reset teacher state
        resetTeacherState: () => initialState,
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
        // Cập nhật hasActiveSession realtime khi GV tạo phiên điểm danh
        setScheduleHasActiveSession: (state, action) => {
            const { classSessionId, hasActiveSession } = action.payload;
            const updateInArray = (arr) => {
                const idx = arr.findIndex(s => s.id === classSessionId);
                if (idx !== -1) arr[idx] = { ...arr[idx], hasActiveSession };
            };
            updateInArray(state.schedules);
            updateInArray(state.schedulesToday);
            // Cập nhật trong schedulesByDate
            Object.keys(state.schedulesByDate).forEach(date => {
                updateInArray(state.schedulesByDate[date]);
            });
        },
    },
    extraReducers: (builder) => {
        builder
            // Get teacher profile
            .addCase(getTeacherProfileThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getTeacherProfileThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.profile = action.payload;
                state.error = null;
            })
            .addCase(getTeacherProfileThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Get teacher schedules
            .addCase(getTeacherSchedulesThunk.pending, (state) => {
                state.schedulesLoading = true;
                state.schedulesError = null;
            })
            .addCase(getTeacherSchedulesThunk.fulfilled, (state, action) => {
                state.schedulesLoading = false;
                state.schedules = action.payload.schedules;
                state.schedulesByDate = groupSchedulesByDate(action.payload.schedules);
                state.currentScheduleRange = action.payload.params;
                state.schedulesError = null;
            })
            .addCase(getTeacherSchedulesThunk.rejected, (state, action) => {
                state.schedulesLoading = false;
                state.schedulesError = action.payload;
            })
            // Get my schedules for today
            .addCase(getMySchedulesToday.pending, (state) => {
                state.schedulesLoading = true;
                state.schedulesError = null;
            })
            .addCase(getMySchedulesToday.fulfilled, (state, action) => {
                state.schedulesLoading = false;
                state.schedulesToday = action.payload.schedules;
                state.schedulesByDate = groupSchedulesByDate(action.payload.schedules);
                state.schedulesError = null;
            })
            .addCase(getMySchedulesToday.rejected, (state, action) => {
                state.schedulesLoading = false;
                state.schedulesError = action.payload;
            })
            // Get teacher courses
            .addCase(getTeacherCoursesThunk.pending, (state) => {
                state.coursesLoading = true;
                state.coursesError = null;
            })
            .addCase(getTeacherCoursesThunk.fulfilled, (state, action) => {
                state.coursesLoading = false;
                state.courses = action.payload.courses;
                state.coursesError = null;
            })
            .addCase(getTeacherCoursesThunk.rejected, (state, action) => {
                state.coursesLoading = false;
                state.coursesError = action.payload;
            })
            // Get teacher workload
            .addCase(getTeacherWorkloadThunk.pending, (state) => {
                state.workloadLoading = true;
                state.workloadError = null;
            })
            .addCase(getTeacherWorkloadThunk.fulfilled, (state, action) => {
                state.workloadLoading = false;
                state.workload = action.payload;
                state.workloadError = null;
            })
            .addCase(getTeacherWorkloadThunk.rejected, (state, action) => {
                state.workloadLoading = false;
                state.workloadError = action.payload;
            })
            // Update teacher profile
            .addCase(updateTeacherProfileThunk.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(updateTeacherProfileThunk.fulfilled, (state, action) => {
                state.isLoading = false;
                state.profile = action.payload;
                state.error = null;
            })
            .addCase(updateTeacherProfileThunk.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            });            
    },
});

export const { resetTeacherState, clearScheduleError, clearSchedules, setScheduleHasActiveSession } = teacherSlice.actions;

// Selectors
export const selectTeacherProfile = (state) => state.teacher.profile;
export const selectTeacherLoading = (state) => state.teacher.isLoading;
export const selectTeacherError = (state) => state.teacher.error;

// Schedule selectors
export const selectTeacherSchedules = (state) => state.teacher.schedules;
export const selectTeacherSchedulesToday = (state) => state.teacher.schedulesToday;
export const selectSchedulesByDate = (state) => state.teacher.schedulesByDate;
export const selectSchedulesLoading = (state) => state.teacher.schedulesLoading;
export const selectSchedulesError = (state) => state.teacher.schedulesError;
export const selectCurrentScheduleRange = (state) => state.teacher.currentScheduleRange;

// Courses selectors
export const selectTeacherCourses = (state) => state.teacher.courses;
export const selectCoursesLoading = (state) => state.teacher.coursesLoading;
export const selectCoursesError = (state) => state.teacher.coursesError;

// Workload selectors
export const selectTeacherWorkload = (state) => state.teacher.workload;
export const selectWorkloadLoading = (state) => state.teacher.workloadLoading;
export const selectWorkloadError = (state) => state.teacher.workloadError;

export default teacherSlice.reducer;