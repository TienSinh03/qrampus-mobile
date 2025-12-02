import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NotificationItem = ({ 
  notification, 
  configRole, 
  onPress, 
  getTimeAgo, 
  getPriorityBorder,
  userRole
}) => {
  return (
    <TouchableOpacity
      onPress={() => onPress(notification)}
      className={`mx-4 mb-3 rounded-xl overflow-hidden ${
        notification.isRead ? 'bg-white' : configRole.unreadBg
      } ${getPriorityBorder(notification.priority)}`}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      <View className="flex-row p-4">
        {/* Icon */}
        <View 
          className="w-12 h-12 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: `${notification.iconColor}20` }}
        >
          <Ionicons 
            name={notification.icon} 
            size={24} 
            color={notification.iconColor} 
          />
        </View>

        {/* Content */}
        <View className="flex-1">
          <View className="flex-row items-start justify-between mb-1">
            <Text className={`text-base font-bold flex-1 ${
              notification.isRead ? 'text-gray-900' : configRole.unreadText
            }`}>
              {notification.title}
            </Text>
            {!notification.isRead && (
              <View className={`w-2 h-2 rounded-full ${configRole.dot} ml-2 mt-1`} />
            )}
          </View>

          <Text className="text-gray-600 text-sm mb-2 leading-5">
            {notification.message}
          </Text>

          <View className="flex-row items-center flex-wrap mb-2">
            {notification.courseCode && (
              <View className={`${configRole.tagBg} px-2 py-1 rounded mr-2 mb-1`}>
                <Text className={`${configRole.tagText} text-xs font-semibold`}>
                  {notification.courseCode}
                </Text>
              </View>
            )}
            {notification.room && (
              <View className="bg-gray-100 px-2 py-1 rounded mr-2 mb-1 flex-row items-center">
                <Ionicons name="location-outline" size={14} color="#6b7280" />
                <Text className="text-gray-700 text-xs font-semibold ml-1">
                  {notification.room}
                </Text>
              </View>
            )}
            {notification.startTime && (
              <View className="bg-purple-100 px-2 py-1 rounded mr-2 mb-1 flex-row items-center">
                <Ionicons name="time-outline" size={14} color="#6b7280" />
                <Text className={`${configRole.tagText} text-xs font-semibold ml-1`}>
                  {notification.startTime}
                </Text>
              </View>
            )}
            {notification.attendanceRate && (
              <View className="bg-green-100 px-2 py-1 rounded mb-1 flex-row items-center">
                <Ionicons name="people-outline" size={14} color="#6b7280" />
                <Text className="text-green-700 text-xs font-semibold ml-1">
                  {notification.attendanceRate}
                </Text>
              </View>
            )}
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-gray-400 text-xs">
              {getTimeAgo(notification.time)}
            </Text>
            {notification.action === 'create_qr' && (
              <View className={`${configRole.buttonBg} px-3 py-1 rounded-full`}>
                <Text className="text-white text-xs font-semibold">
                  Tạo mã QR
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default NotificationItem;
