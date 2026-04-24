import React from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useSelector } from 'react-redux';
import Header from './Header';
import StatsCard from './StatsCard';
import { Ionicons } from '@expo/vector-icons';
import QuickActions from './QuickActions';
import ScheduleCarousel from './ScheduleCarousel';
import { selectUnreadCount } from '../features/notification/notificationSlice';
import FaceCameraModal from './modal/FaceCameraModal';

const BaseHomeScreen = ({
  navigation,
  userRole = 'student',
  userData,
  todaySchedules = [],
  stats = null,
  urgentAlerts = [],
  refreshing = false,
  onRefresh,
  renderScheduleCard,
  customSections = null, // Additional custom sections
  isLoading = false,
  quickActions = [], // Array of { id, icon, label, onPress }
}) => {
  const roleColor = userRole === 'teacher' ? '#0171a5' : '#2563eb';
  const roleBgColor = userRole === 'teacher' ? '#f5f3ff' : '#eff6ff';
  const roleLabel = userRole === 'teacher' ? 'Giảng viên' : 'Sinh viên';
  const unreadCount = useSelector(selectUnreadCount);
  const currentSchedule = todaySchedules[0] ?? null;

  const useCarousel = todaySchedules.length >= 2;

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
        userName={userData?.full_name || 'Người dùng'}
        avatarUri={userData?.avatar_url}
        onNotificationPress={onNotificationPress}
        roleColor={roleColor}
        unreadCount={unreadCount}
        navigation={navigation}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/20 z-10 justify-center items-center">
          <View className="bg-white rounded-2xl p-6 shadow-lg">
            <ActivityIndicator size="large" color={roleColor} />
            <Text className="text-gray-600 mt-3 text-center">Đang tải lịch học...</Text>
          </View>
        </View>
      )}

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Date Section */}
        <View className="px-6 py-4 flex-row items-center gap-2 justify-between">
          <Text className="text-gray-500 text-sm">Hôm nay</Text>

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

        {/* Quick Actions */}
        <QuickActions
          actions={quickActions}
          roleColor={roleColor}
          roleBgColor={roleBgColor}
          userRole={userRole}
        />

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
              {todaySchedules.length || 0} tiết {userRole === 'teacher' ? 'dạy' : 'học'}
            </Text>
          </View>

          {todaySchedules.length > 0 ? (
            useCarousel ? (
              <ScheduleCarousel
                data={todaySchedules}
                renderCard={renderScheduleCard}
                accentColor={roleColor}
              />
            ) : (
              todaySchedules.map((schedule) => renderScheduleCard(schedule))
            )
          ) : (
            <View className="bg-white rounded-2xl p-8 items-center justify-center">
              <Image source={require('../../assets/images/calendar.png')} className="w-16 h-16" />
              <Text className="text-gray-900 font-bold text-lg mb-1">
                Không có lịch {userRole === 'teacher' ? 'giảng' : 'học'}
              </Text>
              <Text className="text-gray-500 text-sm text-center">
                Bạn không có tiết {userRole === 'teacher' ? 'dạy' : 'học'} nào hôm nay
              </Text>
            </View>
          )}
        </View>


        {/* Face verification */}
        <View className="px-6 pb-6">
          <Text className="text-gray-900 text-lg font-bold mb-4">Check khuôn mặt</Text>
          <FaceCameraModal
            schedule={currentSchedule}
            userRole={userRole}
            onCapture={(photo) => console.log('Captured:', photo?.uri)}
          />
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
