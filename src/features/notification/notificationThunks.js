import { createAsyncThunk } from '@reduxjs/toolkit';
import { instance } from '../../api/axiosInstance';

/**
 * Lấy danh sách thông báo (inbox)
 * { unread?: boolean, type?: string, limit?: number, offset?: number }
 */
export const fetchNotificationsThunk = createAsyncThunk(
  'notification/fetchNotifications',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { unread, type, limit, offset } = params;
      const queryParams = new URLSearchParams();
      if (unread !== undefined) queryParams.set('unread', unread);
      if (type) queryParams.set('type', type);
      if (limit) queryParams.set('limit', limit);
      if (offset) queryParams.set('offset', offset);

      const response = await instance.get(`/notifications?${queryParams.toString()}`);
      return {
        notifications: response.data?.data?.notifications || [],
        pagination: response.data?.data?.pagination || null,
        unreadCount: response.data?.data?.unreadCount || 0,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể tải thông báo'
      );
    }
  }
);

/**
 * Lấy số lượng chưa đọc (badge count)
 */
export const fetchUnreadCountThunk = createAsyncThunk(
  'notification/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await instance.get('/notifications/unread-count');
      return response.data?.data?.unreadCount; // { unreadCount: number }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể lấy số thông báo chưa đọc'
      );
    }
  }
);

/**
 * Đánh dấu 1 thông báo đã đọc
 */
export const markAsReadThunk = createAsyncThunk(
  'notification/markAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await instance.post(`/notifications/${notificationId}/read`);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể đánh dấu đã đọc'
      );
    }
  }
);

/**
 * Đánh dấu tất cả đã đọc
 */
export const markAllAsReadThunk = createAsyncThunk(
  'notification/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await instance.post('/notifications/read-all');
      return response.data?.data?.updated; // { updated: number }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể đánh dấu tất cả đã đọc'
      );
    }
  }
);

/**
 * Đăng ký Expo Push Token
 * @param {string} expoPushToken - "ExponentPushToken[xxxx]"
 */
export const registerPushTokenThunk = createAsyncThunk(
  'notification/registerPushToken',
  async (expoPushToken, { rejectWithValue }) => {
    try {
      const response = await instance.post('/notifications/register-token', {
        expo_push_token: expoPushToken,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể đăng ký push token'
      );
    }
  }
);

/**
 * Hủy đăng ký push token (khi logout)
 */
export const unregisterPushTokenThunk = createAsyncThunk(
  'notification/unregisterPushToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await instance.post('/notifications/unregister-token');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Không thể hủy đăng ký push token'
      );
    }
  }
);
