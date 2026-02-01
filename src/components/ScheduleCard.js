import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const ScheduleCard = ({ schedule, navigation }) => {
  const {
    id,
    courseName = 'Tên môn học',
    courseCode = 'MH001',
    room = 'A101',
    startHour = '07:00',
    endHour = '09:00',
    teacherName = 'Giảng viên',
    hasQR = false,
  } = schedule || {};

  // xử lý khi nhấn vào nút QR
  const handleQRPress = (schedule) => {
      console.log('QR pressed:', schedule);
  
      navigation.navigate('QRScan', {
        scheduleId: schedule.id,
        courseName: schedule.courseName,
        courseCode: schedule.courseCode,
        room: schedule.room,
      });
  };
  const handleSchedulePress = schedule => {
    console.log('Card pressed:', schedule);
    // Navigate to schedule detail screen
    navigation.navigate('ScheduleDetail', {
      schedule: schedule,
    });
  };
  return (
    <TouchableOpacity
      onPress={() => handleSchedulePress(schedule)}
      activeOpacity={0.7}
      className="mb-4"
    >
      <LinearGradient
        colors={['#2563eb', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-2xl p-4"
        style={{
          shadowColor: '#2563eb',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        {/* Header - Time and Course Code */}
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={18} color="white" />
            <Text className="text-white font-bold text-base ml-2">
              {startHour} - {endHour}
            </Text>
          </View>
          <View className="bg-white/20 px-3 py-1 rounded-full">
            <Text className="text-white text-xs font-semibold">{courseCode}</Text>
          </View>
        </View>

        {/* Course Name */}
        <Text className="text-white text-lg font-bold mb-2" numberOfLines={2}>
          {courseName}
        </Text>

        {/* Room and Teacher */}
        <View className="flex-row items-center mb-3">
          <View className="flex-row items-center flex-1 mr-2">
            <Ionicons name="location-outline" size={16} color="white" />
            <Text className="text-white/90 text-sm ml-1">{room}</Text>
          </View>
          <View className="flex-row items-center flex-1">
            <Ionicons name="person-outline" size={16} color="white" />
            <Text className="text-white/90 text-sm ml-1" numberOfLines={1}>
              {teacherName}
            </Text>
          </View>
        </View>

        {/* QR Code Button */}
        {hasQR && (
          <TouchableOpacity
            onPress={() => handleQRPress(schedule)}
            className="bg-white rounded-xl py-3 flex-row items-center justify-center"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 3,
              elevation: 3,
            }}
          >
            <Ionicons name="qr-code" size={20} color="#2563eb" />
            <Text className="text-blue-600 font-bold text-base ml-2">
              Quét mã điểm danh
            </Text>
          </TouchableOpacity>
        )}

        {!hasQR && (
          <View className="bg-white/10 rounded-xl py-3 flex-row items-center justify-center">
            <Ionicons name="lock-closed-outline" size={18} color="white" />
            <Text className="text-white/70 text-sm ml-2">
              Chưa đến giờ điểm danh
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default ScheduleCard;
