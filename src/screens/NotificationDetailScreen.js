import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import {
  getNotificationTypeConfig,
  getNotificationAction,
  getTimeAgo,
} from '../utils/notificationHelper';

const roleConfig = {
  student: {
    headerColors: ['#2563eb', '#60a5fa'],
    badgeBg: '#dbeafe',
    badgeText: '#1d4ed8',
    cardBg: '#eff6ff',
  },
  teacher: {
    headerColors: ['#0284c7', '#38bdf8'],
    badgeBg: '#e0f2fe',
    badgeText: '#0369a1',
    cardBg: '#ecfeff',
  },
};

const fieldLabels = {
  sender_name: 'Người gửi',
  sender_role: 'Vai trò người gửi',
  target_mode: 'Chế độ gửi',
  courseCode: 'Mã học phần',
  room: 'Phòng học',
  startTime: 'Thời gian bắt đầu',
  attendanceRate: 'Tỷ lệ điểm danh',
  course_section_id: 'ID học phần',
  class_session_id: 'ID buổi học',
};

const formatAbsoluteDateTime = (dateString) => {
  if (!dateString) return '--';

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return '--';

  return date.toLocaleString('vi-VN');
};

const formatMetaValue = (value) => {
  if (value === null || value === undefined || value === '') return '--';

  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  return String(value);
};

const NotificationDetailScreen = ({ navigation, route }) => {
  const notification = route?.params?.notification;
  const userRole = route?.params?.userRole || 'student';

  const configRole =
    roleConfig[userRole] || roleConfig.student;

  if (!notification) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <StatusBar style="dark" />

        <Ionicons
          name="alert-circle-outline"
          size={50}
          color="#9ca3af"
        />

        <Text className="text-gray-500 mt-3 text-base">
          Không tìm thấy dữ liệu thông báo
        </Text>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mt-4 px-4 py-2 rounded-xl bg-gray-100"
        >
          <Text className="font-semibold text-gray-700">
            Quay lại
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const meta = notification.metadata || {};
  const { icon, iconColor } =
    getNotificationTypeConfig(notification.type);

  const action =
    getNotificationAction(notification.type);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="light" />

      {/* HEADER */}
      <LinearGradient
        colors={configRole.headerColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-4 pt-4 pb-6"
      >
        {/* top bar */}
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: '#ffffff25' }}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color="white"
            />
          </TouchableOpacity>

          <Text className="text-white text-lg font-bold">
            Chi tiết thông báo
          </Text>

          <View style={{ width: 40 }} />
        </View>

        {/* banner */}
        <View className="px-4 flex-row items-center justify-between">

        {/* text */}
        <View className="flex-1 pr-3 justify-center">

            <Text className="text-white text-sm font-bold uppercase mb-1">
            {notification.title || 'Thông báo'}
            </Text>

            <Text className="text-blue-100 text-sm leading-5">
            {getTimeAgo(notification?.sent_at)} •{' '}
            {formatAbsoluteDateTime(notification?.sent_at)}
            </Text>

        </View>

        {/* image right */}
        <Image
            source={require('../../assets/images/headr_notification.png')}
            className="w-28 h-28"
            resizeMode="contain"
        />

        </View>
      </LinearGradient>

      {/* CONTENT */}
      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{
          paddingBottom: 24,
        }}
      >
        {/* status */}
        <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
          <Text className="text-gray-900 font-bold text-base mb-3">
            Trạng thái và loại
          </Text>

          <View className="flex-row flex-wrap">

            <View
              className="px-3 py-1.5 rounded-full mr-2 mb-2"
              style={{
                backgroundColor:
                  configRole.badgeBg,
              }}
            >
              <Text
                className="text-xs font-semibold"
                style={{
                  color:
                    configRole.badgeText,
                }}
              >
                {notification.is_read
                  ? 'Đã đọc'
                  : 'Chưa đọc'}
              </Text>
            </View>

            <View
              className="px-3 py-1.5 rounded-full mr-2 mb-2"
              style={{
                backgroundColor: `${iconColor}20`,
              }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: iconColor }}
              >
                {notification.type ||
                  'other'}
              </Text>
            </View>

            {notification.priority ? (
              <View className="px-3 py-1.5 rounded-full mr-2 mb-2 bg-amber-100">
                <Text className="text-xs font-semibold text-amber-700">
                  Mức độ: {notification.priority}
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* message */}
        <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
          <Text className="text-gray-900 font-bold text-base mb-2">
            Nội dung
          </Text>

          <Text className="text-gray-700 text-sm leading-6">
            {notification.message ||
              'Không có nội dung chi tiết'}
          </Text>
        </View>

        {/* metadata */}
        <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm">
          <Text className="text-gray-900 font-bold text-base mb-3">
            Thông tin bổ sung
          </Text>

          {Object.keys(meta).length === 0 ? (
            <View
              className="rounded-xl px-3 py-3"
              style={{
                backgroundColor:
                  configRole.cardBg,
              }}
            >
              <Text className="text-gray-600 text-sm">
                Không có metadata đi kèm
              </Text>
            </View>
          ) : (
            Object.entries(meta).map(
              ([key, value]) => (
                <View
                  key={key}
                  className="py-2 border-b border-gray-100"
                >
                  <Text className="text-gray-500 text-xs uppercase mb-1">
                    {fieldLabels[key] ||
                      key}
                  </Text>

                  <Text
                    className="text-gray-800 text-sm"
                    selectable
                  >
                    {formatMetaValue(
                      value
                    )}
                  </Text>
                </View>
              )
            )
          )}
        </View>

        {/* action */}
        {action === 'create_qr' ? (
          <View className="bg-white rounded-2xl p-4 shadow-sm">
            <Text className="text-gray-900 font-bold text-base mb-3">
              Hành động gợi ý
            </Text>

            <View className="rounded-xl bg-sky-50 p-3 flex-row items-center">
              <Ionicons
                name="qr-code-outline"
                size={18}
                color="#0284c7"
              />

              <Text className="text-sky-700 text-sm ml-2 flex-1">
                Thông báo này có thể liên quan tới tạo mã QR.
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationDetailScreen;