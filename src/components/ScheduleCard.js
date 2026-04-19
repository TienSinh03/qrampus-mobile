import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
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
  
  const isCompleted = sessionStatus === 'completed';
  const isPracticeSchedule = isPractice && !isTheory;
  const gradientColors = isPracticeSchedule ? ['#059669', '#10b981'] : ['#2563eb', '#3b82f6'];
  const shadowColor = isPracticeSchedule ? '#059669' : '#2563eb';
  const accentColor = isPracticeSchedule ? '#059669' : '#2563eb';
  const waveColor = isPracticeSchedule ? '#b5ddd2' : '#7f96d4';
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
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 70,
            overflow: 'hidden',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
        >
          <Svg width="100%" height="100%" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <Path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              fill={waveColor}
              opacity={0.25}
            />
            <Path
              d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
              fill={waveColor}
              opacity={0.28}
            />
          </Svg>
        </View>

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
          <View className={`bg-${isPracticeSchedule ? 'emerald' : 'blue'}-500/20 border border-${isPracticeSchedule ? 'emerald' : 'blue'}-500 rounded-xl py-3 px-3 flex-row items-center justify-center mb-1`}>
            <Ionicons name="checkmark-circle" size={18} color={isPracticeSchedule ? '#10b981' : '#2563eb'} />
            <Text className={`text-${isPracticeSchedule ? 'emerald' : 'blue'}-100 text-sm font-semibold ml-2`}>
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
