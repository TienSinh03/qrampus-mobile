import { useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useSelector, useDispatch } from 'react-redux';
import { selectAuth } from '../features/auth/authSlice';
import { registerPushTokenThunk } from '../features/notification/notificationThunks';

/** Kiểm tra có đang chạy trong Expo Go không */
const _isExpoGo =
  Constants.executionEnvironment === 'storeClient' ||
  Constants.appOwnership === 'expo';

/**
 * Lazy-load expo-notifications chỉ khi KHÔNG chạy trong Expo Go
 * Tránh crash vì SDK 53+ đã bỏ remote push trong Expo Go
 */
let Notifications = null;
if (!_isExpoGo) {
  Notifications = require('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

/**
 * Custom hook: quản lý Expo Push Notifications
 *
 * Flow:
 * 1. Request permission khi user đã login
 * 2. Lấy Expo Push Token
 * 3. Gửi token lên backend qua POST /notifications/register-token
 * 4. Lắng nghe notification khi app foreground/background
 *
 * Sử dụng:
 * ```jsx
 * function App() {
 *   const { onNotificationReceived } = usePushNotification();
 *   return <Navigator />;
 * }
 * ```
 */
export function usePushNotification() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(selectAuth);
  const notificationListener = useRef();
  const responseListener = useRef();

  /**
   * Đăng ký push notifications
   * Trả về Expo Push Token hoặc null
   */
  const registerForPushNotificationsAsync = useCallback(async () => {
    // Không chạy push remote trên Expo Go (SDK 53+)
    if (_isExpoGo || !Notifications) {
      console.log('[Push] Expo Go (SDK 53+) không hỗ trợ remote push. Hãy dùng Dev Build.');
      return null;
    }

    // Chỉ hoạt động trên thiết bị thật (không phải simulator)
    if (!Device.isDevice) {
      console.log('[Push] Must use physical device for Push Notifications');
      return null;
    }

    // Kiểm tra permission hiện tại
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Yêu cầu permission nếu chưa có
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[Push] Permission not granted');
      return null;
    }

    // Lấy Expo Push Token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    const token = tokenData.data; // "ExponentPushToken[xxxx]"
    console.log('[Push] Expo Push Token:', token);

    // Android: tạo notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'QRampus',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });
    }

    return token;
  }, []);

  // Đăng ký push khi user đã login 
  useEffect(() => {
    if (!isAuthenticated) return;

    // Bỏ qua toàn bộ push logic nếu đang chạy trong Expo Go
    if (_isExpoGo || !Notifications) {
      console.log('[Push] Bỏ qua push listeners trong Expo Go');
      return;
    }

    let isMounted = true;

    registerForPushNotificationsAsync().then((token) => {
      if (token && isMounted) {
        // Gửi token lên backend
        dispatch(registerPushTokenThunk(token));
      }
    });

    // Lắng nghe notification khi app đang mở (foreground)
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log('[Push] Notification received (foreground):', notification);
      });

    // Lắng nghe khi user tap vào notification (mở app từ push)
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('[Push] Notification response:', response);
        const data = response.notification.request.content.data;

        if (data?.deepLink) {
          console.log('[Push] Deep link:', data.deepLink);
        }
      });

    return () => {
      isMounted = false;
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [isAuthenticated, dispatch, registerForPushNotificationsAsync]);

  return {
    registerForPushNotificationsAsync,
  };
}

export default usePushNotification;
