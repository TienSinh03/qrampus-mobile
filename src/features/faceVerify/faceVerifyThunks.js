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
        timeout: 60000, // face ML inference cần nhiều thời gian hơn default
      });

      // { match, status, distance, label, image_url, verified_at, student_code, full_name }
      return response.data.data;
    } catch (error) {
      const serverMsg = error.response?.data?.message || '';
      const isTimeout =
        error.code === 'ECONNABORTED' ||
        error.message?.toLowerCase().includes('timeout') ||
        serverMsg.toLowerCase().includes('timeout');

      if (isTimeout) {
        return rejectWithValue(
          'Server xử lý quá lâu. Hãy thử lại – đảm bảo mặt rõ và ánh sáng tốt.'
        );
      }
      return rejectWithValue(serverMsg || 'Xác thực thất bại');
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
