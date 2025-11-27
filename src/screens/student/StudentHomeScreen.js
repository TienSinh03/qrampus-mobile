import React, { useState } from 'react';
import { View, Text, ScrollView, RefreshControl,StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar';
import Header from '../../components/Header';
import ScheduleCard from '../../components/ScheduleCard';

const StudentHomeScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  
  // thay bằng API call
  const [todaySchedules, setTodaySchedules] = useState([
    {
      id: '1',
      courseName: 'Lập trình Di động',
      courseCode: 'IT4788',
      room: 'D3-201',
      startTime: '07:00',
      endTime: '09:00',
      teacherName: 'TS. Nguyễn Văn A',
      hasQR: true,
    },
    {
      id: '2',
      courseName: 'Trí tuệ Nhân tạo',
      courseCode: 'IT4868',
      room: 'D5-302',
      startTime: '09:15',
      endTime: '11:15',
      teacherName: 'PGS.TS. Trần Thị B',
      hasQR: false,
    },
  ]);

  const userData = {
    name: 'Nguyễn Văn Nam',
    avatarUri: null,
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notification');
  };

  const handleSchedulePress = (schedule) => {
    // Navigate to schedule detail
    console.log('Schedule pressed:', schedule);
  };

  const handleQRPress = (schedule) => {
    console.log('QR pressed:', schedule);
  };

  const getCurrentDate = () => {
    const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    const today = new Date();
    const dayName = days[today.getDay()];
    const date = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    return `${dayName}, ${date}/${month}/${year}`;
  };

  return (
    <SafeAreaView style={styles.container}  edges={['top']}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <Header
        userName={userData.name}
        avatarUri={userData.avatarUri}
        onNotificationPress={handleNotificationPress}
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

        {/* Today's Schedule */}
        <View className="px-6 pb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-900 text-lg font-bold">Lịch học hôm nay</Text>
            <Text className="text-blue-600 text-sm font-semibold">
              {todaySchedules.length} tiết học
            </Text>
          </View>

          {todaySchedules.length > 0 ? (
            todaySchedules.map((schedule) => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                onPress={() => handleSchedulePress(schedule)}
                onQRPress={() => handleQRPress(schedule)}
              />
            ))
          ) : (
            <View className="bg-white rounded-2xl p-8 items-center justify-center">
              <Text className="text-6xl mb-3">📅</Text>
              <Text className="text-gray-900 font-bold text-lg mb-1">Không có lịch học</Text>
              <Text className="text-gray-500 text-sm text-center">Bạn không có tiết học nào hôm nay</Text>
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

export default StudentHomeScreen;
