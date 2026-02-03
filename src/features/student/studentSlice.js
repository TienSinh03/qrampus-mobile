import { createSlice } from "@reduxjs/toolkit";
import { getStudentProfileThunk, getStudentSchedulesThunk, getMySchedules } from "./studentThunks";

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
};

/**
 * Transform schedule từ API sang format UI
 */
const transformScheduleToUI = (schedule) => {
    return {
        id: schedule.sessionId,
        sessionId: schedule.sessionId,
        enrollmentId: schedule.enrollmentId,
        enrollmentStatus: schedule.enrollmentStatus,
        classDate: schedule.classDate,
        dayOfWeek: schedule.dayOfWeek,
        startHour: schedule.startHour?.slice(0, 5) || '', // "07:30:00" -> "07:30"
        endHour: schedule.endHour?.slice(0, 5) || '',
        scheduleType: schedule.scheduleType, // 'theory' | 'practice'
        sessionStatus: schedule.sessionStatus,
        // Course info
        courseName: schedule.courseSection?.courseName || '',
        courseCode: schedule.courseSection?.courseCode || '',
        credits: schedule.courseSection?.credits || 0,
        semester: schedule.courseSection?.semester || '',
        courseDescription: schedule.courseSection?.description || '',
        courseSectionId: schedule.courseSection?.courseSectionId || '',
        // Teacher info
        teacherName: schedule.teacher?.teacherName || '',
        teacherId: schedule.teacher?.teacherId || '',
        teacherCode: schedule.teacher?.teacherCode || '',
        teacherDepartment: schedule.teacher?.department || '',
        teacherPhone: schedule.teacher?.phone || '',
        teacherEmail: schedule.teacher?.email || '',
        // Room info
        room: schedule.room?.roomCode || schedule.room?.roomName || '',
        roomId: schedule.room?.roomId || '',
        roomName: schedule.room?.roomName || '',
        roomCoordinates: schedule.room?.coordinates || [],
        roomDescription: schedule.room?.description || '',
        // Practice group
        practiceGroup: schedule.practiceGroup,
        // UI helpers
        hasQR: schedule.sessionStatus === 'ongoing' || schedule.sessionStatus === 'scheduled',
        isTheory: schedule.scheduleType === 'theory',
        isPractice: schedule.scheduleType === 'practice',
    };
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
        grouped[date].push(transformScheduleToUI(schedule));
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

export default studentSlice.reducer;