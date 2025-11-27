import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const StudentProfileScreen = ({ navigation }) => {
  const userData = {
    name: 'Nguyễn Văn Nam',
    studentId: '20200001',
    email: 'nam.nv200001@sis.hust.edu.vn',
    class: 'IT K65',
    major: 'Công nghệ thông tin',
  };

  const menuItems = [
    {
      id: '1',
      icon: 'person-outline',
      title: 'Thông tin cá nhân',
      subtitle: 'Xem và chỉnh sửa thông tin',
      onPress: () => console.log('Profile info'),
    },
    {
      id: '2',
      icon: 'document-text-outline',
      title: 'Lịch sử điểm danh',
      subtitle: 'Xem lịch sử điểm danh các môn học',
      onPress: () => console.log('Attendance history'),
    },
    {
      id: '3',
      icon: 'stats-chart-outline',
      title: 'Thống kê',
      subtitle: 'Xem thống kê điểm danh',
      onPress: () => console.log('Statistics'),
    },
    {
      id: '4',
      icon: 'settings-outline',
      title: 'Cài đặt',
      subtitle: 'Cài đặt ứng dụng',
      onPress: () => console.log('Settings'),
    },
    {
      id: '5',
      icon: 'help-circle-outline',
      title: 'Trợ giúp',
      subtitle: 'Hướng dẫn sử dụng và hỗ trợ',
      onPress: () => console.log('Help'),
    },
  ];

  // Handle logout logic
  const handleLogout = () => {
    console.log('Logout');
    navigation.reset({
      index: 0,
      routes: [{ name: 'IntroCarousel' }],
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <LinearGradient
          colors={['#2563eb', '#3b82f6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="px-6 pt-6 pb-8"
        >
          <View className="items-center">
            {/* Avatar */}
            <View 
              className="w-24 h-24 rounded-full bg-white items-center justify-center mb-4"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <Text className="text-blue-600 text-4xl font-bold">
                {userData.name.charAt(0)}
              </Text>
            </View>

            {/* User Info */}
            <Text className="text-white text-2xl font-bold mb-1">
              {userData.name}
            </Text>
            <Text className="text-white/80 text-base mb-1">
              MSSV: {userData.studentId}
            </Text>
            <Text className="text-white/80 text-sm">
              {userData.class} - {userData.major}
            </Text>
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        <View className="flex-row px-6 -mt-6 mb-4">
          <View 
            className="flex-1 bg-white rounded-2xl p-4 mr-2"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text className="text-gray-500 text-xs mb-1">Tỷ lệ điểm danh</Text>
            <Text className="text-gray-900 text-2xl font-bold">92%</Text>
          </View>
          <View 
            className="flex-1 bg-white rounded-2xl p-4"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text className="text-gray-500 text-xs mb-1">Số buổi học</Text>
            <Text className="text-gray-900 text-2xl font-bold">45</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View className="px-6 pb-6">
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              onPress={item.onPress}
              className="bg-white rounded-2xl p-4 mb-3 flex-row items-center"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <View className="w-12 h-12 rounded-full bg-blue-50 items-center justify-center mr-4">
                <Ionicons name={item.icon} size={24} color="#2563eb" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-bold text-base mb-1">
                  {item.title}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {item.subtitle}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-50 rounded-2xl p-4 mt-2 flex-row items-center justify-center"
          >
            <Ionicons name="log-out-outline" size={24} color="#dc2626" />
            <Text className="text-red-600 font-bold text-base ml-2">
              Đăng xuất
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default StudentProfileScreen;
