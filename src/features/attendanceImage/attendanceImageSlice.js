import { createSlice } from '@reduxjs/toolkit';
import { 
  fetchAttendanceImagesBySessionId,
  uploadAttendanceImage 
} from './attendanceImageThunks';

const initialState = {
  images: [],
  isLoading: false,
  error: null,
  uploading: false,
  uploadError: null,
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
        // Thêm ảnh mới vào đầu danh sách
        state.images = [action.payload, ...state.images];
      })
      .addCase(uploadAttendanceImage.rejected, (state, action) => {
        state.uploading = false;
        state.uploadError = action.payload;
      });
  },
});

export const { clearImages, clearError, resetAttendanceImageState } =
  attendanceImageSlice.actions;

export default attendanceImageSlice.reducer;
