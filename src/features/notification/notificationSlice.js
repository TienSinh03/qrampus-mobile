import { createSlice } from '@reduxjs/toolkit';
import {
  fetchNotificationsThunk,
  fetchUnreadCountThunk,
  markAsReadThunk,
  markAllAsReadThunk,
  registerPushTokenThunk,
} from './notificationThunks';

const initialState = {
  notifications: [],
  total: 0,
  unreadCount: 0,
  isLoading: false,
  isLoadingMore: false,
  error: null,
  pushTokenRegistered: false,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {

    /**
     * Nhận notification realtime từ socket
     */
    receiveNotification: (state, action) => {
      const notification = action.payload;

      const exists = state.notifications.find((n) => n.id === notification.id);
      if (!exists) {
        state.notifications.unshift(notification); // Thêm vào đâu danh sách noti
        state.total += 1;

        if (!notification.is_read) {
          state.unreadCount += 1;
        }

      }
    },

    /**
     * Cập nhật trạng thái đã đọc từ socket event
     */
    updateReadStatus: (state, action) => {
      const { notification_id, is_read } = action.payload;

      if (notification_id === '*') {
        state.notifications = state.notifications.map((n) => ({
          ...n,
          is_read: true,
        }));
        state.unreadCount = 0;
      } else {

        const idx = state.notifications.findIndex((n) => n.id === notification_id);

        if (idx !== -1 && !state.notifications[idx].is_read) {
          state.notifications[idx].is_read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    },

    /** Reset state khi logout */
    resetNotifications: () => initialState,

    /** Clear error */
    clearNotificationError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotificationsThunk.pending, (state, action) => {
        const isLoadMore = action.meta.arg?.offset > 0;
        if (isLoadMore) {
          state.isLoadingMore = true;
        } else {
          state.isLoading = true;
        }
        state.error = null;
      })
      .addCase(fetchNotificationsThunk.fulfilled, (state, action) => {
        const { notifications, pagination, unreadCount } = action.payload;
        const isLoadMore = action.meta.arg?.offset > 0;

        if (isLoadMore) {
          // Append thêm vào cuối
          const existingIds = new Set(state.notifications.map((n) => n.id));

          const newItems = notifications.filter((n) => !existingIds.has(n.id));
          
          state.notifications = [...state.notifications, ...newItems];
          state.isLoadingMore = false;
        } else {
          state.notifications = notifications;
          state.isLoading = false;
        }

        state.total = pagination.total;
        state.unreadCount = unreadCount;
      })
      .addCase(fetchNotificationsThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.isLoadingMore = false;
        state.error = action.payload || 'Không thể tải thông báo';
      })

      // Unread count
      .addCase(fetchUnreadCountThunk.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })

      // Mark as read
      .addCase(markAsReadThunk.fulfilled, (state, action) => {
        const notification = action.payload;
        const idx = state.notifications.findIndex((n) => n.id === notification.id);
        if (idx !== -1) {
          state.notifications[idx] = notification;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })

      // Mark all as read
      .addCase(markAllAsReadThunk.fulfilled, (state) => {
        state.notifications = state.notifications.map((n) => ({
          ...n,
          is_read: true,
        }));
        state.unreadCount = 0;
      })

      // Register push token
      .addCase(registerPushTokenThunk.fulfilled, (state) => {
        state.pushTokenRegistered = true;
      });
  },
});

export const { receiveNotification, updateReadStatus, resetNotifications, clearNotificationError } = notificationSlice.actions;

export const selectNotifications = (state) => state.notification.notifications;
export const selectUnreadCount = (state) => state.notification.unreadCount;
export const selectNotificationLoading = (state) => state.notification.isLoading;
export const selectNotificationTotal = (state) => state.notification.total;
export const selectNotificationError = (state) => state.notification.error;

export default notificationSlice.reducer;
