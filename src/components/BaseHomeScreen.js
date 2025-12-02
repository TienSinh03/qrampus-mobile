import React from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Header from './Header';
import StatsCard from './StatsCard';
import { Ionicons } from '@expo/vector-icons';

const BaseHomeScreen = ({
  navigation,
  userRole = 'student', // 'student' or 'teacher'
  userData,
  todaySchedules = [],
  stats = null,
  urgentAlerts = [],
  refreshing = false,
  onRefresh,
  renderScheduleCard,
  customSections = null, // Additional custom sections
}) => {
  const roleColor = userRole === 'teacher' ? '#7c3aed' : '#2563eb';
  const roleLabel = userRole === 'teacher' ? 'Giảng viên' : 'Sinh viên';

  const getCurrentDate = () => {
    const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    const today = new Date();
    const dayName = days[today.getDay()];
    const date = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    return `${dayName}, ${date}/${month}/${year}`;
  };

  const onNotificationPress = () => {
    navigation.navigate('Notification', { userRole });
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <Header
        userName={userData?.name}
        avatarUri={userData?.avatarUri}
        onNotificationPress={onNotificationPress}
        roleColor={roleColor}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Date Section */}
        <View className="px-6 py-4">
          <Text className="text-gray-500 text-sm mb-1">Hôm nay</Text>
          <Text className="text-gray-900 text-xl font-bold">
            {getCurrentDate()}
          </Text>
        </View>

        {/* Urgent Alerts - Only for teachers */}
        {urgentAlerts && urgentAlerts.length > 0 && (
          <View className="px-6 mb-4">
            {urgentAlerts.map((alert, index) => (
              <View
                key={index}
                className="bg-red-50 border border-red-200 rounded-xl p-3 mb-2 flex-row items-center"
              >
                <View className="w-8 h-8 bg-red-500 rounded-full items-center justify-center mr-3">
                  <Ionicons name="warning" size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-red-900 font-bold text-sm">
                    {alert.title}
                  </Text>
                  <Text className="text-red-700 text-xs mt-0.5">
                    {alert.message}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Stats Card */}
        {stats && <StatsCard stats={stats} userRole={userRole} />}

        {/* Custom Sections */}
        {customSections}

        {/* Today's Schedule */}
        <View className="px-6 pb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-900 text-lg font-bold">
              {userRole === 'teacher' ? 'Lịch giảng hôm nay' : 'Lịch học hôm nay'}
            </Text>
            <Text 
              className="text-sm font-semibold"
              style={{ color: roleColor }}
            >
              {todaySchedules.length} tiết {userRole === 'teacher' ? 'dạy' : 'học'}
            </Text>
          </View>

          {todaySchedules.length > 0 ? (
            todaySchedules.map((schedule) => renderScheduleCard(schedule))
          ) : (
            <View className="bg-white rounded-2xl p-8 items-center justify-center">
              <Text className="text-6xl mb-3">📅</Text>
              <Text className="text-gray-900 font-bold text-lg mb-1">
                Không có lịch {userRole === 'teacher' ? 'giảng' : 'học'}
              </Text>
              <Text className="text-gray-500 text-sm text-center">
                Bạn không có tiết {userRole === 'teacher' ? 'dạy' : 'học'} nào hôm nay
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
});

export default BaseHomeScreen;
