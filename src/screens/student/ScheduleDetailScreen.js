import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const ScheduleDetailScreen = ({ navigation, route }) => {
  const { schedule } = route.params;
  const [attendanceStats, setAttendanceStats] = useState({
    present: 8,
    absent: 2,
    excused: 1,
    total: 11,
  });

  const {
    id,
    courseName = 'Tên môn học',
    courseCode = 'MH001',
    room = 'A101',
    startTime = '07:00',
    endTime = '09:00',
    teacherName = 'Giảng viên',
    teacherEmail = 'teacher@example.com',
    date,
    dayOfWeek,
    hasQR = false,
    credits = 3,
  } = schedule || {};

  // xử lý khi nhấn vào nút QR                 
  const handleQRPress = () => {
    console.log('QR pressed:', schedule);
    navigation.navigate('QRScan', {
      scheduleId: schedule.id,
      courseName: schedule.courseName,
      courseCode: schedule.courseCode,
      room: schedule.room,
    });
  };

  // xử lý khi nhấn vào nút xem yêu cầu nghỉ phép
  const handleViewLeaveRequests = () => {
    navigation.navigate('LeaveRequestList', {
      schedule: schedule,
    });
  };

  // xử lý khi nhấn vào nút tạo yêu cầu nghỉ phép
  const handleCreateLeaveRequest = () => {
    // navigation.navigate('LeaveRequest', {
    //   preSelectedSchedule: schedule,
    // });
    Alert.alert(
      'Tính năng sắp ra mắt',
      'Chức năng xin nghỉ phép sẽ được ra mắt trong thời gian tới. Vui lòng cập nhật ứng dụng để sử dụng tính năng này.',
      [{ text: 'OK' }]
    );
  };

  const attendanceRate = ((attendanceStats.present / attendanceStats.total) * 100).toFixed(1);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      {/* Header */}
      <LinearGradient
        colors={['#2563eb', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 py-4"
      >
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">Chi tiết lịch học</Text>
          <View style={{ width: width*0.05 }} />
        </View>

        <View className="items-center mb-2">
          <View className="bg-white/20 px-4 py-2 rounded-full mb-3">
            <Text className="text-white font-bold text-base">{courseCode}</Text>
          </View>
          <Text className="text-white text-2xl font-bold text-center mb-1">
            {courseName}
          </Text>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6 pb-4">
          <Text className="text-gray-900 font-bold text-lg mb-3">Thao tác nhanh</Text>
          
          {/* QR Scan Button */}
          {hasQR ? (
            <TouchableOpacity
              onPress={handleQRPress}
              className="bg-blue-600 rounded-xl py-4 mb-3 flex-row items-center justify-center"
              style={{
                shadowColor: '#2563eb',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <Ionicons name="qr-code" size={24} color="white" />
              <Text className="text-white font-bold text-base ml-2">Quét mã điểm danh</Text>
            </TouchableOpacity>
          ) : (
            <View className="bg-gray-200 rounded-xl py-4 mb-3 flex-row items-center justify-center">
              <Ionicons name="lock-closed-outline" size={20} color="#6b7280" />
              <Text className="text-gray-500 text-base ml-2">Chưa đến giờ điểm danh</Text>
            </View>
          )}

          {/* Leave Request Actions */}
          <View className="flex-row space-x-3 mb-3">
            <TouchableOpacity
              onPress={handleCreateLeaveRequest}
              className="flex-1 bg-white rounded-xl py-4 flex-row items-center justify-center border-2 border-blue-500"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              <Ionicons name="add-circle" size={20} color="#2563eb" />
              <Text className="text-blue-600 font-semibold text-sm ml-2">Xin nghỉ phép</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleViewLeaveRequests}
              className="flex-1 bg-white rounded-xl py-4 flex-row items-center justify-center border border-gray-300"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              <Ionicons name="document-text-outline" size={20} color="#6b7280" />
              <Text className="text-gray-700 font-semibold text-sm text-center ml-2 w-24">Xem yêu cầu nghỉ phép</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Schedule Information */}
        <View className="px-6 pb-4">
          <Text className="text-gray-900 font-bold text-lg mb-3">Thông tin lịch học</Text>
          
          <View className="bg-white rounded-2xl p-4" style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            {/* Date & Time */}
            <View className="flex-row items-center mb-4 pb-4 border-b border-gray-100">
              <View className="w-12 h-12 bg-blue-50 rounded-xl items-center justify-center mr-3">
                <Ionicons name="calendar" size={24} color="#2563eb" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-xs mb-1">Thời gian</Text>
                <Text className="text-gray-900 font-bold text-base">
                  {dayOfWeek}, {date}
                </Text>
                <Text className="text-gray-600 text-sm">
                  {startTime} - {endTime}
                </Text>
              </View>
            </View>

            {/* Room */}
            <View className="flex-row items-center mb-4 pb-4 border-b border-gray-100">
              <View className="w-12 h-12 bg-green-50 rounded-xl items-center justify-center mr-3">
                <Ionicons name="location" size={24} color="#10b981" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-xs mb-1">Phòng học</Text>
                <Text className="text-gray-900 font-bold text-base">{room}</Text>
              </View>
            </View>

            {/* Teacher */}
            <View className="flex-row items-center mb-4 pb-4 border-b border-gray-100">
              <View className="w-12 h-12 bg-purple-50 rounded-xl items-center justify-center mr-3">
                <Ionicons name="person" size={24} color="#8b5cf6" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-xs mb-1">Giảng viên</Text>
                <Text className="text-gray-900 font-bold text-base">{teacherName}</Text>
                {teacherEmail && (
                  <Text className="text-gray-600 text-sm">{teacherEmail}</Text>
                )}
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-orange-50 rounded-xl items-center justify-center mr-3">
                <Ionicons name="bookmark" size={24} color="#f59e0b" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-xs mb-1">Số tín chỉ</Text>
                <Text className="text-gray-900 font-bold text-base">{credits} tín chỉ</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Attendance Statistics */}
        <View className="px-6 pb-6">
          <Text className="text-gray-900 font-bold text-lg mb-3">Thống kê điểm danh</Text>
          
          <View className="bg-white rounded-2xl p-4" style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            {/* Attendance Rate Circle */}
            <View className="items-center mb-4">
              <View className="w-32 h-32 rounded-full bg-blue-50 items-center justify-center mb-2"
                style={{
                  borderWidth: 8,
                  borderColor: attendanceRate >= 80 ? '#10b981' : attendanceRate >= 50 ? '#f59e0b' : '#ef4444',
                }}
              >
                <Text className={`text-3xl font-bold ${
                  attendanceRate >= 80 ? 'text-green-600' : attendanceRate >= 50 ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {attendanceRate}%
                </Text>
                <Text className="text-gray-500 text-xs">Tỷ lệ tham gia</Text>
              </View>
            </View>

            {/* Stats Grid */}
            <View className="flex-row flex-wrap">
              <View className="w-1/2 p-2">
                <View className="bg-green-50 rounded-xl p-3 items-center">
                  <Ionicons name="checkmark-circle" size={32} color="#10b981" />
                  <Text className="text-green-700 text-2xl font-bold mt-1">
                    {attendanceStats.present}
                  </Text>
                  <Text className="text-gray-600 text-xs">Có mặt</Text>
                </View>
              </View>
              
              <View className="w-1/2 p-2">
                <View className="bg-red-50 rounded-xl p-3 items-center">
                  <Ionicons name="close-circle" size={32} color="#ef4444" />
                  <Text className="text-red-700 text-2xl font-bold mt-1">
                    {attendanceStats.absent}
                  </Text>
                  <Text className="text-gray-600 text-xs">Vắng</Text>
                </View>
              </View>
              
              <View className="w-1/2 p-2">
                <View className="bg-blue-50 rounded-xl p-3 items-center">
                  <Ionicons name="document-text" size={32} color="#3b82f6" />
                  <Text className="text-blue-700 text-2xl font-bold mt-1">
                    {attendanceStats.excused}
                  </Text>
                  <Text className="text-gray-600 text-xs">Vắng có phép</Text>
                </View>
              </View>
              
              <View className="w-1/2 p-2">
                <View className="bg-gray-50 rounded-xl p-3 items-center">
                  <Ionicons name="calendar-outline" size={32} color="#6b7280" />
                  <Text className="text-gray-700 text-2xl font-bold mt-1">
                    {attendanceStats.total}
                  </Text>
                  <Text className="text-gray-600 text-xs">Tổng buổi</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Warning*/}
        {attendanceRate < 80 && (
          <View className="px-6 pb-6">
            <View className="bg-orange-50 rounded-xl p-4 flex-row items-start border-l-4 border-orange-500">
              <Ionicons name="warning" size={24} color="#f59e0b" className="mr-3" />
              <View className="flex-1 ml-3">
                <Text className="text-orange-900 font-bold mb-1">Cảnh báo điểm danh</Text>
                <Text className="text-orange-700 text-sm">
                  Tỷ lệ điểm danh của bạn đang thấp hơn 80%. Vui lòng tham gia đầy đủ các buổi học để đảm bảo đủ điều kiện dự thi.
                </Text>
              </View>
            </View>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ScheduleDetailScreen;
