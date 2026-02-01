import { createSlice } from "@reduxjs/toolkit";
import { getTeacherProfileThunk } from "./teacherThunks";

const initialState = {
    profile: null,
    isLoading: false,
    error: null,
};

const teacherSlice = createSlice({
    name: 'teacher',
    initialState,
    reducers: {
        // Reset teacher state
        resetTeacherState: () => initialState,
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
            });
    },
});

export const { resetTeacherState } = teacherSlice.actions;

// Selectors
export const selectTeacherProfile = (state) => state.teacher.profile;
export const selectTeacherLoading = (state) => state.teacher.isLoading;
export const selectTeacherError = (state) => state.teacher.error;

export default teacherSlice.reducer;