import { createSlice } from "@reduxjs/toolkit";
import { getTeacherProfileThunk, getTeacherSchedulesThunk } from "./teacherThunks";

const initialState = {
    profile: null,
    isLoading: false,
    error: null,

    // schedule
    schedules: [], // Raw schedules từ API
    schedulesByDate: {}, // Schedules được group theo ngày { '2025-01-15': [...] }
    schedulesLoading: false,
    schedulesError: null,
    currentScheduleRange: null, // { startDate, endDate }
};

/**
 * Transform schedule từ API sang format UI
 */
const transformScheduleToUI = (schedule) => {
    return {
        id: schedule.id,
        classDate: schedule.class_date,
        dayOfWeek: schedule.day_of_week,
        startHour: schedule.start_hour?.slice(0, 5) || '', // "07:30:00" -> "07:30"
        endHour: schedule.end_hour?.slice(0, 5) || '',
        scheduleType: schedule.schedule_type, // 'theory' | 'practice'
        sessionNumber: schedule.session_number,
        // Course info
        courseName: schedule.courseSection?.name || '',
        courseCode: schedule.courseSection?.code || '',
        credits: schedule.courseSection?.credits || 0,
        semester: schedule.courseSection?.semester || '',
        courseDescription: schedule.courseSection?.description || '',
        courseSectionId: schedule.courseSection?.id || '',
        // Teacher info
        teacherName: schedule.teacher?.full_name || '',
        teacherId: schedule.teacher?.id || '',
        teacherDepartment: schedule.teacher?.department || '',
        teacherPhone: schedule.teacher?.phone || '',
        teacherEmail: schedule.teacher?.email || '',
        // Room info
        room: schedule.room?.room_code || schedule.room?.room_name || '',
        roomId: schedule.room?.id || '',
        roomName: schedule.room?.room_name || '',
        roomCoordinates: schedule.room?.coordinates || [],
        // Practice group
        practiceGroup: schedule.practiceGroup,
        // UI helpers
        isTheory: schedule.schedule_type === 'theory',
        isPractice: schedule.schedule_type === 'practice',
    };
};

/**
 * Group schedules theo ngày
 */
const groupSchedulesByDate = (schedules) => {
    const grouped = {};
    schedules.forEach(schedule => {
        const date = schedule.class_date;
        if (!grouped[date]) {
            grouped[date] = [];
        }
        grouped[date].push(transformScheduleToUI(schedule));
    });
    
    // Sort schedules trong mỗi ngày theo startTime
    Object.keys(grouped).forEach(date => {
        grouped[date].sort((a, b) => a.start_hour.localeCompare(b.start_hour));
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
            });            
    },
});

export const { resetTeacherState, clearScheduleError, clearSchedules } = teacherSlice.actions;

// Selectors
export const selectTeacherProfile = (state) => state.teacher.profile;
export const selectTeacherLoading = (state) => state.teacher.isLoading;
export const selectTeacherError = (state) => state.teacher.error;

// Schedule selectors
export const selectTeacherSchedules = (state) => state.teacher.schedules;
export const selectSchedulesByDate = (state) => state.teacher.schedulesByDate;
export const selectSchedulesLoading = (state) => state.teacher.schedulesLoading;
export const selectSchedulesError = (state) => state.teacher.schedulesError;
export const selectCurrentScheduleRange = (state) => state.teacher.currentScheduleRange;

export default teacherSlice.reducer;