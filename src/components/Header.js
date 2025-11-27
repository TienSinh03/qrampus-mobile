import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Header = ({ userName, avatarUri, onNotificationPress }) => {
  return (
    <View className="flex-row items-center justify-between px-6 pt-4 pb-3">
      {/* Avatar and User Info */}
      <View className="flex-row items-center flex-1">
        <View 
          className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center mr-3"
          style={{
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
          <Text className="text-gray-600 text-xs">Xin chào,</Text>
          <Text className="text-gray-900 text-base font-bold" numberOfLines={1}>
            {userName || 'Sinh viên'}
          </Text>
        </View>
      </View>

      {/* Notification Button */}
      <TouchableOpacity
        onPress={onNotificationPress}
        className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <Ionicons name="notifications-outline" size={22} color="#2563eb" />
        {/* Badge for unread notifications */}
        <View className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
      </TouchableOpacity>
    </View>
  );
};

export default Header;
