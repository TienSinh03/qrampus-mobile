import { createSlice } from "@reduxjs/toolkit";
import { getStudentProfileThunk } from "./studentThunks";

const initialState = {
    profile: null,
    isLoading: false,
    error: null,
};

const studentSlice = createSlice({
    name: 'student',
    initialState,
    reducers: {
        // Reset student state
        resetStudentState: () => initialState,
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
            });
    },
});

export const { resetStudentState } = studentSlice.actions;

// Selectors
export const selectStudentProfile = (state) => state.student.profile;
export const selectStudentLoading = (state) => state.student.isLoading;
export const selectStudentError = (state) => state.student.error;

export default studentSlice.reducer;