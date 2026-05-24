import { createAsyncThunk } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import { instance } from '../../api/axiosInstance';

/**
 * Gửi ảnh selfie lên backend để xác thực khuôn mặt.
 * Dùng fetch thay axios để React Native tự set Content-Type với boundary đúng cho FormData.
 *
 * @param {string} imageUri       - URI ảnh chụp từ camera
 * @param {string} [attendanceId] - UUID bản ghi điểm danh (optional)
 */
export const verifyFaceThunk = createAsyncThunk(
  'faceVerify/verify',
  async ({ imageUri, attendanceId = null }, { rejectWithValue }) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 60000);

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

      const token = await SecureStore.getItemAsync('accessToken');
      const baseURL = (instance.defaults.baseURL || '').replace(/\/$/, '');

      const res = await fetch(`${baseURL}/face-verify/verify`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          // KHÔNG set Content-Type — React Native fetch tự thêm boundary cho FormData
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timer);

      const json = await res.json();

      if (!res.ok) {
        const msg =
          json?.message ||
          json?.error  ||
          json?.detail ||
          `Lỗi ${res.status}`;
        return rejectWithValue(msg);
      }

      return json.data;
    } catch (error) {
      clearTimeout(timer);

      const isTimeout =
        error.name === 'AbortError' ||
        error.message?.toLowerCase().includes('timeout');

      if (isTimeout) {
        return rejectWithValue(
          'Server xử lý quá lâu. Hãy thử lại – đảm bảo mặt rõ và ánh sáng tốt.'
        );
      }
      return rejectWithValue(error.message || 'Xác thực thất bại');
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
