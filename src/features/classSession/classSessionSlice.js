import { createSlice } from "@reduxjs/toolkit";
import { getStudentsByClassSessionThunk, getTeacherClassSessionOverviewThunk } from "./classSessionThunks";

const initialState = {
    students: [],
    totalStudents: 0,
    practiceGroupBreakdown: null,
    practiceGroup: null,
    classSession: null,
    courseSection: null,
    loadedForSessionId: null,

    studentsLoading: false,
    studentsError: null,

    
    // Class session overview state
    classSessionOverview: null,
    classSessionOverviewLoading: false,
    classSessionOverviewError: null,
};

const classSessionSlice = createSlice({
    name: 'classSession',
    initialState,
    reducers: {
        clearStudents: (state) => {
            state.students = [];
            state.totalStudents = 0;
            state.practiceGroupBreakdown = null;
            state.practiceGroup = null;
            state.classSession = null;
            state.courseSection = null;
            state.loadedForSessionId = null;
            state.studentsError = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getStudentsByClassSessionThunk.pending, (state) => {
                state.studentsLoading = true;
                state.studentsError = null;
            })
            .addCase(getStudentsByClassSessionThunk.fulfilled, (state, action) => {
                state.studentsLoading = false;
                state.students = action.payload.students || [];
                state.totalStudents = action.payload.totalStudents || 0;
                state.practiceGroupBreakdown = action.payload.practiceGroupBreakdown || null;
                state.practiceGroup = action.payload.practiceGroup || null;
                state.classSession = action.payload.classSession || null;
                state.courseSection = action.payload.courseSection || null;
                state.loadedForSessionId = action.meta.arg;
            })
            .addCase(getStudentsByClassSessionThunk.rejected, (state, action) => {
                state.studentsLoading = false;
                state.studentsError = action.payload;
            })
                        
            // Get teacher class session overview
            .addCase(getTeacherClassSessionOverviewThunk.pending, (state) => {
                state.classSessionOverviewLoading = true;
                state.classSessionOverviewError = null;
            })
            .addCase(getTeacherClassSessionOverviewThunk.fulfilled, (state, action) => {
                state.classSessionOverviewLoading = false;
                state.classSessionOverview = action.payload;
                state.classSessionOverviewError = null;
            })
            .addCase(getTeacherClassSessionOverviewThunk.rejected, (state, action) => {
                state.classSessionOverviewLoading = false;
                state.classSessionOverviewError = action.payload;
            });
    },
});

export const { clearStudents } = classSessionSlice.actions;

// Selectors
export const selectStudents = (state) => state.classSession.students;
export const selectTotalStudents = (state) => state.classSession.totalStudents;
export const selectPracticeGroupBreakdown = (state) => state.classSession.practiceGroupBreakdown;
export const selectApiPracticeGroup = (state) => state.classSession.practiceGroup;
export const selectStudentsLoading = (state) => state.classSession.studentsLoading;
export const selectStudentsError = (state) => state.classSession.studentsError;
export const selectLoadedForSessionId = (state) => state.classSession.loadedForSessionId;

export const selectClassSessionOverview = (state) => state.classSession.classSessionOverview;
export const selectClassSessionOverviewLoading = (state) => state.classSession.classSessionOverviewLoading;
export const selectClassSessionOverviewError = (state) => state.classSession.classSessionOverviewError;

export default classSessionSlice.reducer;
