import { createSlice } from '@reduxjs/toolkit';
import {
  fetchAttendanceImagesBySessionId,
  uploadAttendanceImage,
  deleteAttendanceImage,
  fetchAttendanceImageById,
} from './attendanceImageThunks';

const initialState = {
  images: [],
  isLoading: false,
  error: null,
  uploading: false,
  uploadError: null,
  uploadedImageId: null,   // ID ảnh vừa upload, dùng để poll
  deleting: false,
  deleteError: null,
};

const attendanceImageSlice = createSlice({
  name: 'attendanceImage',
  initialState,
  reducers: {
    clearImages: (state) => {
      state.images = [];
    },
    clearError: (state) => {
      state.error = null;
      state.uploadError = null;
    },
    clearUploadedImageId: (state) => {
      state.uploadedImageId = null;
    },
    resetAttendanceImageState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendanceImagesBySessionId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAttendanceImagesBySessionId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.images = action.payload;
      })
      .addCase(fetchAttendanceImagesBySessionId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

    // uploadAttendanceImage
      .addCase(uploadAttendanceImage.pending, (state) => {
        state.uploading = true;
        state.uploadError = null;
      })
      .addCase(uploadAttendanceImage.fulfilled, (state, action) => {
        state.uploading = false;
        state.images = [action.payload, ...state.images];
        state.uploadedImageId = action.payload?.id ?? null;
      })
      .addCase(uploadAttendanceImage.rejected, (state, action) => {
        state.uploading = false;
        state.uploadError = action.payload;
      })

    // fetchAttendanceImageById (polling AI result)
      .addCase(fetchAttendanceImageById.fulfilled, (state, action) => {
        const updated = action.payload;
        if (!updated) return;
        const idx = state.images.findIndex((img) => img.id === updated.id);
        if (idx !== -1) {
          state.images[idx] = updated;
        }
      })

    // deleteAttendanceImage
      .addCase(deleteAttendanceImage.pending, (state) => {
        state.deleting = true;
        state.deleteError = null;
      })
      .addCase(deleteAttendanceImage.fulfilled, (state, action) => {
        state.deleting = false;
        // Loại bỏ ảnh đã xóa khỏi danh sách
        state.images = state.images.filter(
          (img) => img.id !== action.payload
        );
      })
      .addCase(deleteAttendanceImage.rejected, (state, action) => {
        state.deleting = false;
        state.deleteError = action.payload; 
      });


  },
});



export const { clearImages, clearError, resetAttendanceImageState, clearUploadedImageId } =
  attendanceImageSlice.actions;

export default attendanceImageSlice.reducer;
