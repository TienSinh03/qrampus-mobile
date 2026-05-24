import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Header = ({ 
  userName, 
  avatarUri, 
  onNotificationPress, 
  greeting = 'Xin chào',
  roleColor = '#2563eb', // blue for student, purple for teacher
  unreadCount = 0,
  navigation
}) => {
  const getGreeting = () => {
    if (greeting !== 'Xin chào') return greeting;
    
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  return (
    <View className="flex-row items-center justify-between px-6 pt-4 pb-3">
      {/* Avatar and User Info */}
      <TouchableOpacity className="flex-row items-center flex-1"
        onPress={() => navigation.navigate('ProfileDetail')}      
      >
        <View 
          className="w-12 h-12 rounded-full items-center justify-center mr-3"
          style={{
            backgroundColor: roleColor,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
          }}
        >
          {avatarUri ? (
            <Image 
              source={{ uri: avatarUri }} 
              className="w-full h-full rounded-full"
            />
          ) : (
            <Text className="text-white text-xl font-bold">
              {userName?.charAt(0)?.toUpperCase() || 'U'}
            </Text>
          )}
        </View>
        <View className="flex-1">
          <Text className="text-gray-600 text-xs">{getGreeting()},</Text>
          <Text className="text-gray-900 text-base font-bold" numberOfLines={1}>
            {userName || 'Người dùng'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Notification Button */}
      <TouchableOpacity
        onPress={onNotificationPress}
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{
          backgroundColor: roleColor === '#2563eb' ? '#eff6ff' : '#faf5ff', // blue-50 or purple-50
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <Ionicons name="notifications-outline" size={22} color={roleColor} />
        {/* Badge for unread notifications */}
        {unreadCount > 0 && (
          <View className="absolute -top-1 -right-1 bg-red-500 rounded-full min-w-[18px] h-[18px] items-center justify-center px-1">
            <Text className="text-white text-[10px] font-bold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )} 
      </TouchableOpacity>
    </View>
  );
};

export default Header;
