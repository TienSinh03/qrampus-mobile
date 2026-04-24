import { createAsyncThunk } from '@reduxjs/toolkit';
import { instance } from '../../api/axiosInstance';

/**
 * Gửi ảnh selfie lên backend để xác thực khuôn mặt.
 *
 * @param {string} imageUri       - URI ảnh chụp từ camera
 * @param {string} [attendanceId] - UUID bản ghi điểm danh (optional, gắn kết quả với attendance)
 */
export const verifyFaceThunk = createAsyncThunk(
  'faceVerify/verify',
  async ({ imageUri, attendanceId = null }, { rejectWithValue }) => {
    try {
      const filename = imageUri.split('/').pop() || 'face.jpg';
      const formData = new FormData();

      formData.append('image', {
        uri: imageUri,
        name: filename,
        type: 'image/jpeg',
      });

      if (attendanceId) {
        formData.append('attendance_id', attendanceId);
      }

      const response = await instance.post('/face-verify/verify', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // { match, status, distance, label, image_url, verified_at, student_code, full_name }
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Xác thực thất bại'
      );
    }
  }
);

/**
 * Lấy lịch sử xác thực khuôn mặt của sinh viên.
 */
export const fetchMyVerificationHistoryThunk = createAsyncThunk(
  'faceVerify/fetchHistory',
  async (limit = 20, { rejectWithValue }) => {
    try {
      const response = await instance.get(`/face-verify/my-history?limit=${limit}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể tải lịch sử xác thực'
      );
    }
  }
);
