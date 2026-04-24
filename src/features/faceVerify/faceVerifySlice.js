import { createSlice } from '@reduxjs/toolkit';
import { verifyFaceThunk, fetchMyVerificationHistoryThunk } from './faceVerifyThunks';

const initialState = {
  status: 'idle',   // 'idle' | 'loading' | 'success' | 'error'
  result: null,     // { match, status, distance, label, image_url, verified_at, student_code, full_name }
  error: null,
  history: [],
  historyLoading: false,
};

const faceVerifySlice = createSlice({
  name: 'faceVerify',
  initialState,
  reducers: {
    resetFaceVerify: (state) => {
      state.status = 'idle';
      state.result = null;
      state.error  = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ── verify ──
      .addCase(verifyFaceThunk.pending, (state) => {
        state.status = 'loading';
        state.result = null;
        state.error  = null;
      })
      .addCase(verifyFaceThunk.fulfilled, (state, action) => {
        state.status = 'success';
        state.result = action.payload;
      })
      .addCase(verifyFaceThunk.rejected, (state, action) => {
        state.status = 'error';
        state.error  = action.payload;
      })

      // ── history ──
      .addCase(fetchMyVerificationHistoryThunk.pending, (state) => {
        state.historyLoading = true;
      })
      .addCase(fetchMyVerificationHistoryThunk.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.history = action.payload;
      })
      .addCase(fetchMyVerificationHistoryThunk.rejected, (state) => {
        state.historyLoading = false;
      });
  },
});

export const { resetFaceVerify } = faceVerifySlice.actions;

export const selectFaceVerifyStatus  = (state) => state.faceVerify.status;
export const selectFaceVerifyResult  = (state) => state.faceVerify.result;
export const selectFaceVerifyError   = (state) => state.faceVerify.error;
export const selectFaceVerifyHistory = (state) => state.faceVerify.history;

export default faceVerifySlice.reducer;
