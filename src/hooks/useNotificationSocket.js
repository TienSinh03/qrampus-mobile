import { useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import Constants from 'expo-constants';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { selectAuth } from '../features/auth/authSlice';
import { updateTokens } from '../features/auth/authSlice';
import {
  receiveNotification,
  updateReadStatus,
} from '../features/notification/notificationSlice';
import {
  fetchNotificationsThunk,
  fetchUnreadCountThunk,
} from '../features/notification/notificationThunks';

const { SOCKET_URL } = Constants.expoConfig?.extra || {};

/**
 * Custom hook: quản lý kết nối Socket.IO cho notification realtime
 *
 * Sử dụng:
 * ```jsx
 * function App() {
 *   useNotificationSocket();
 *   return <Navigator />;
 * }
 * ```
 *
 * Flow:
 * - Khi user authenticated → connect socket với JWT token
 * - Auto-join rooms (server-side) theo userId và role
 * - Lắng nghe event `notification:new` → dispatch vào Redux store
 * - Lắng nghe event `notification:read` → sync trạng thái đã đọc
 * - Khi disconnect/reconnect → sync lại từ REST API
 */
export function useNotificationSocket() {
  const dispatch = useDispatch();
  const { accessToken, isAuthenticated } = useSelector(selectAuth);
  const socketRef = useRef(null);

  const connectSocket = useCallback(() => {
    if (!isAuthenticated || !accessToken) return;

    // Tránh tạo socket trùng lặp
    if (socketRef.current?.connected) return;

    const socketUrl = SOCKET_URL || 'http://localhost:3001';

    const socket = io(socketUrl, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketRef.current = socket;

    // Connection events 
    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
      // Sync notifications khi reconnect
      dispatch(fetchUnreadCountThunk());
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    socket.on('connect_error', async (error) => {
      console.error('[Socket] Connection error:', error.message);

      // Token hết hạn → thử refresh và reconnect
      if (error.message.includes('jwt expired') || error.message.includes('Invalid token')) {
        try {
          const storedRefreshToken = await SecureStore.getItemAsync('refreshToken');
          if (!storedRefreshToken) return;

          const { API_URL } = Constants.expoConfig?.extra || {};
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: storedRefreshToken,
          });

          const newAccessToken = response.data?.data?.accessToken;
          if (newAccessToken) {
            await SecureStore.setItemAsync('accessToken', newAccessToken);
            dispatch(updateTokens({ accessToken: newAccessToken }));
            // Cập nhật token cho socket và reconnect
            socket.auth = { token: newAccessToken };
            socket.connect();
            console.log('[Socket] Token refreshed, reconnecting...');
          }
        } catch (refreshError) {
          console.error('[Socket] Token refresh failed:', refreshError.message);
        }
      }
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('[Socket] Reconnected after', attemptNumber, 'attempts');
      // Full sync sau khi reconnect
      dispatch(fetchNotificationsThunk({ limit: 20, offset: 0 }));
    });

    //  Notification events 

    /**
     * Event: notification:new
     * Server gửi khi có thông báo mới
     * Payload: { id, title, message, type, priority, target_role, target_user_id,
     *            course_section_id, class_session_id, sent_at, is_read, metadata }
     */
    socket.on('notification:new', (payload) => {
      console.log('[Socket] New notification:', payload.id, payload.type);
      dispatch(receiveNotification(payload));
    });

    /**
     * Event: notification:read
     * Server gửi khi có thông báo được đánh dấu đã đọc (đồng bộ giữa các thiết bị)
     * Payload: { notification_id, is_read }
     */
    socket.on('notification:read', (payload) => {
      dispatch(updateReadStatus(payload));
    });
  }, [isAuthenticated, accessToken, dispatch]);

  // ── Connect/disconnect theo auth state ──
  useEffect(() => {
    if (isAuthenticated && accessToken) {
      connectSocket();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, accessToken, connectSocket]);

  // ── Expose socket for manual operations ──
  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
  };
}

export default useNotificationSocket;
