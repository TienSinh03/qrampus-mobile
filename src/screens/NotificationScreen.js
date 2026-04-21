import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SvgUri } from 'react-native-svg';
import { useSelector, useDispatch } from 'react-redux';
import NotificationItem from '../components/NotificationItem';
import {
  selectNotifications,
  selectUnreadCount,
  selectNotificationLoading,
  selectNotificationTotal,
} from '../features/notification/notificationSlice';
import {
  fetchNotificationsThunk,
  markAsReadThunk,
  markAllAsReadThunk,
} from '../features/notification/notificationThunks';
import { selectLoginRole } from '../features/auth/authSlice';

const PAGE_SIZE = 20;

const messageSentSvgUri = Image.resolveAssetSource(
  require('../../assets/undraw_message-sent_iyz6.svg')
).uri;

const decodeHtmlEntities = (text = '') => {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
};

const htmlToReadableText = (html = '') => {
  if (!html || typeof html !== 'string') return '';

  return decodeHtmlEntities(
    html
      .replace(/<\s*br\s*\/?\s*>/gi, '\n')
      .replace(/<\s*\/\s*(p|div|li|h[1-6])\s*>/gi, '\n')
      .replace(/<\s*li\b[^>]*>/gi, '- ')
      .replace(/<[^>]*>/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  );
};

const getNotificationPreviewMessage = (notification = {}) => {
  const htmlMessage =
    notification.message_html ||
    notification.html ||
    notification.content_html ||
    '';

  const plainMessage = notification.message || '';
  const hasHtmlTags =
    typeof plainMessage === 'string' &&
    /<\/?[a-z][\s\S]*>/i.test(plainMessage);

  const messageHtmlSource =
    (typeof htmlMessage === 'string' && htmlMessage.trim()) ||
    (hasHtmlTags ? plainMessage : '');

  return messageHtmlSource
    ? htmlToReadableText(messageHtmlSource)
    : plainMessage;
};

const NotificationScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const userRole = useSelector(selectLoginRole) || 'student';
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const isLoading = useSelector(selectNotificationLoading);
  const total = useSelector(selectNotificationTotal);

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'

  // Config theo role
  const roleConfig = {
    student: {
      headerBg: 'bg-blue-600',
      headerText: 'text-blue-100',
      unreadBg: 'bg-blue-50',
      unreadText: 'text-blue-900',
      buttonBg: 'bg-blue-600',
      tagBg: 'bg-blue-100',
      tagText: 'text-blue-700',
      dot: 'bg-blue-600',
    },
    teacher: {
      headerBg: 'bg-sky-600',
      headerText: 'text-sky-100',
      unreadBg: 'bg-sky-50',
      unreadText: 'text-sky-900',
      buttonBg: 'bg-sky-600',
      tagBg: 'bg-sky-100',
      tagText: 'text-sky-700',
      dot: 'bg-sky-600',
    },
  };

  const configRole = roleConfig[userRole] || roleConfig.student;

  // Fetch notifications khi mở màn hình
  useEffect(() => {
    dispatch(fetchNotificationsThunk({ limit: PAGE_SIZE, offset: 0 }));
  }, [dispatch]);

  // Lọc thông báo theo trạng thái
  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.is_read;
    if (filter === 'read') return notif.is_read;
    return true;
  });

  const normalizedNotifications = filteredNotifications.map((item) => ({
    ...item,
    messagePreview: getNotificationPreviewMessage(item),
  }));

  // Pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await dispatch(fetchNotificationsThunk({ limit: PAGE_SIZE, offset: 0 }));
    setRefreshing(false);
  }, [dispatch]);

  // Load more (infinite scroll)
  const onEndReached = useCallback(() => {
    if (isLoading || notifications.length >= total) return;
    dispatch(fetchNotificationsThunk({ limit: PAGE_SIZE, offset: notifications.length }));
  }, [dispatch, isLoading, notifications.length, total]);

  // Nhấn vào thông báo → đánh dấu đã đọc + xử lý action
  const handleNotificationPress = useCallback((notification) => {
    if (!notification.is_read) {
      dispatch(markAsReadThunk(notification.id));
    }

    navigation.navigate('NotificationDetail', {
      notification,
      userRole,
    });
  }, [dispatch, navigation]);

  // Đánh dấu tất cả đã đọc
  const handleMarkAllAsRead = useCallback(() => {
    if (unreadCount > 0) {
      dispatch(markAllAsReadThunk());
    }
  }, [dispatch, unreadCount]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View className={`${configRole.headerBg} px-5 pt-4 pb-6 overflow-hidden`}>
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            right: 0,
            bottom: 0,
            width: 110,
            height: 160,
            opacity: 0.2,
          }}
        >
          <SvgUri
            uri={messageSentSvgUri}
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid meet"
          />
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              className="mr-3"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View>
              <Text className="text-white text-xl font-bold">
                Thông báo
              </Text>
              {unreadCount > 0 && (
                <Text className={`${configRole.headerText} text-xs mt-0.5`}>
                  {unreadCount} thông báo chưa đọc
                </Text>
              )}
            </View>
          </View>
          <TouchableOpacity onPress={handleMarkAllAsRead}>
            <Ionicons name="checkmark-done" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="bg-white px-4 py-3 flex-row border-b border-gray-200">
        <TouchableOpacity
          onPress={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg mr-2 ${
            filter === 'all' ? configRole.buttonBg : 'bg-white'
          }`}
        >
          <Text
            className={`font-semibold ${
              filter === 'all' ? 'text-white' : 'text-gray-600'
            }`}
          >
            Tất cả
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg mr-2 ${
            filter === 'unread' ? configRole.buttonBg : 'bg-white'
          }`}
        >
          <Text
            className={`font-semibold ${
              filter === 'unread' ? 'text-white' : 'text-gray-600'
            }`}
          >
            Chưa đọc {unreadCount > 0 && `(${unreadCount})`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilter('read')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'read' ? configRole.buttonBg : 'bg-white'
          }`}
        >
          <Text
            className={`font-semibold ${
              filter === 'read' ? 'text-white' : 'text-gray-600'
            }`}
          >
            Đã đọc
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading state */}
      {isLoading && notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={userRole === 'teacher' ? '#0ea5e9' : '#2563eb'} />
          <Text className="text-gray-400 text-sm mt-3">Đang tải thông báo...</Text>
        </View>
      ) : (
        <FlatList
          data={normalizedNotifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          renderItem={({ item }) => (
            <NotificationItem
              notification={item}
              configRole={configRole}
              onPress={handleNotificationPress}
              userRole={userRole}
            />
          )}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Ionicons name="notifications-off-outline" size={64} color="#dbd1d5" />
              <Text className="text-gray-400 text-base mt-4">
                {filter === 'unread' ? 'Không có thông báo chưa đọc' : 
                 filter === 'read' ? 'Không có thông báo đã đọc' :
                 'Chưa có thông báo nào'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default NotificationScreen;
