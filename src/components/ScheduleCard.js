import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';

const ScheduleCard = ({ schedule, navigation }) => {
  const {
    id,
    courseName = 'Tên môn học',
    courseCode = 'MH001',
    room = 'A101',
    startHour = '07:00',
    endHour = '09:00',
    teacherName = 'Giảng viên',
    hasQR: hasQRProp = false,
    isAttended: isAttendedProp = false,
    isTheory = false,
    isPractice = false,
    sessionStatus = '',
  } = schedule || {};

  // Lắng nghe realtime từ Redux khi GV tạo phiên
  const realtimeHasQR = useSelector(state => {
    const all = [
      ...(state.student?.schedules || []),
      ...(state.student?.schedulesToday || []),
    ];
    const found = all.find(s => s.id === id);
    return found ? found.hasQR : false;
  });

  const realtimeIsAttended = useSelector(state => {
    const all = [
      ...(state.student?.schedules || []),
      ...(state.student?.schedulesToday || []),
    ];
    const found = all.find(s => s.id === id);
    return found ? !!found.isAttended : false;
  });

  const hasQR = hasQRProp || realtimeHasQR;
  const isAttended = isAttendedProp || realtimeIsAttended;
  console.log('ScheduleCard render - hasQR:', hasQR, 'for schedule ID:', id);
  const isCompleted = sessionStatus === 'completed';
  const isPracticeSchedule = isPractice && !isTheory;
  const gradientColors = isPracticeSchedule ? ['#059669', '#10b981'] : ['#2563eb', '#3b82f6'];
  const shadowColor = isPracticeSchedule ? '#059669' : '#2563eb';
  const accentColor = isPracticeSchedule ? '#059669' : '#2563eb';
  const scheduleTypeLabel = isPracticeSchedule ? 'Thực hành' : 'Lý thuyết';
  const scheduleTypeIcon = isPracticeSchedule ? 'construct-outline' : 'book-outline';
  
  const [isClassTime, setIsClassTime] = useState(false);

  useEffect(() => {
    const checkClassTime = () => {

      const now = new Date();
      const [startH, startM] = startHour.split(':').map(Number);
      const [endH, endM] = endHour.split(':').map(Number);

      const classStart = new Date();
      classStart.setHours(startH, startM, 0, 0);

      const classEnd = new Date();
      classEnd.setHours(endH, endM, 0, 0);

      setIsClassTime(now >= classStart && now <= classEnd);
    };
    checkClassTime();
    const interval = setInterval(checkClassTime, 30000);
    return () => clearInterval(interval);
  }, [startHour, endHour]);


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
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-2xl p-4"
        style={{
          shadowColor: shadowColor,
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

        {/* Schedule Type Badge */}
        <View className="flex-row items-center mb-2">
          <View
            style={{ backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, flexDirection: 'row', alignItems: 'center' }}
          >
            <Ionicons name={scheduleTypeIcon} size={13} color="white" />
            <Text style={{ color: 'white', fontSize: 12, fontWeight: '700', marginLeft: 4 }}>
              {scheduleTypeLabel}
            </Text>
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
        {isAttended && (
          <View className="bg-emerald-500/20 border border-emerald-300/50 rounded-xl py-3 px-3 flex-row items-center justify-center">
            <Ionicons name="checkmark-circle" size={18} color="#d1fae5" />
            <Text className="text-emerald-100 text-sm font-semibold ml-2">
              Bạn đã điểm danh buổi học này
            </Text>
          </View>
        )}

        {!isAttended && hasQR && (
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
            <Ionicons name="qr-code" size={20} color={accentColor} />
            <Text style={{ color: accentColor, fontWeight: 'bold', fontSize: 16, marginLeft: 8 }}>
              Quét mã điểm danh
            </Text>
          </TouchableOpacity>
        )}

        {/* Trong giờ học nhưng GV chưa mở phiên */}
        {!isAttended && !hasQR && isClassTime && !isCompleted && (
          <View className="bg-white/10 rounded-xl py-3 flex-row items-center justify-center">
            <Ionicons name="hourglass-outline" size={18} color="white" />
            <Text className="text-white/70 text-sm ml-2">
              Giảng viên chưa mở phiên điểm danh
            </Text>
          </View>
        )}

        {/* Chưa đến giờ học */}
        {!isAttended && !hasQR && !isClassTime && !isCompleted && (
          <View className="bg-white/10 rounded-xl py-3 flex-row items-center justify-center">
            <Ionicons name="lock-closed-outline" size={18} color="white" />
            <Text className="text-white/70 text-sm ml-2">
              Chưa đến giờ điểm danh
            </Text>
          </View>
        )}

        {/* Buổi học đã kết thúc */}
        {isCompleted && (
          <View className="bg-white/10 rounded-xl py-3 flex-row items-center justify-center">
            <Ionicons name="checkmark-done-circle-outline" size={18} color="white" />
            <Text className="text-white/70 text-sm ml-2">
              Buổi học đã kết thúc
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default ScheduleCard;
