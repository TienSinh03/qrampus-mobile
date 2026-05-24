import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SvgUri } from 'react-native-svg';
import { useSelector } from 'react-redux';

const teacherCardSvgSource = Image.resolveAssetSource(
  require('../../assets/svg_cardteacher.svg')
);
const teacherCardSvgUri =
  teacherCardSvgSource?.uri || teacherCardSvgSource?.localUri || null;

const TeacherScheduleCard = ({ schedule, navigation }) => {
  const {
    id,
    courseName = 'Tên môn học',
    courseCode = 'MH001',
    room = 'A101',
    startHour = '07:00',
    endHour = '09:00',
    hasActiveSession: hasActiveSessionProp = false,
    courseSectionId = 1,
    isTheory = false,
    isPractice = false,
  } = schedule || {};

  // Lắng nghe realtime từ Redux khi GV tạo phiên điểm danh
  const realtimeHasActiveSession = useSelector(state => {
    const all = [
      ...(state.teacher?.schedules || []),
      ...(state.teacher?.schedulesToday || []),
    ];
    const found = all.find(s => s.id === id);
    return found ? found.hasActiveSession : false;
  });

  const hasActiveSession = hasActiveSessionProp || realtimeHasActiveSession;
  // console.log('TeacherScheduleCard render - hasActiveSession:', hasActiveSession, 'for schedule ID:', id);

  const isPracticeSchedule = isPractice && !isTheory;
  const scheduleTypeLabel = isPracticeSchedule ? 'Thực hành' : 'Lý thuyết';
  const scheduleTypeIcon = isPracticeSchedule ? 'construct-outline' : 'book-outline';

  const [timeRemaining, setTimeRemaining] = useState('');
  const [isInActiveWindow, setIsInActiveWindow] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const [startHourNum, startMinute] = startHour.split(':').map(Number);
      const [endHourNum, endMinute] = endHour.split(':').map(Number);

      const classStartTime = new Date();
      classStartTime.setHours(startHourNum, startMinute, 0, 0);

      const classEndTime = new Date();
      classEndTime.setHours(endHourNum, endMinute, 0, 0);

      const diffMs = classStartTime - now;
      const diffMinutes = Math.floor(diffMs / 60000);

      const diffEndMinutes = Math.floor((classEndTime - now) / 60000);

      // Cửa sổ tạo phiên: 5 phút trước đến 30 phút sau khi bắt đầu
      const inWindow = diffMinutes >= -30 && diffMinutes <= 5;
      setIsInActiveWindow(inWindow);

      // Khẩn cấp: 5 phút trước đến 5 phút sau khi bắt đầu
      const urgent = diffMinutes >= -5 && diffMinutes <= 5;
      setIsUrgent(urgent);

      if (diffMinutes > 60) {
        const hours = Math.floor(diffMinutes / 60);
        const mins = diffMinutes % 60;
        setTimeRemaining(`${hours}h ${mins}p nữa`);
      } else if (diffMinutes > 0) {
        setTimeRemaining(`${diffMinutes} phút nữa`);
      } else if (diffEndMinutes > 0) {
        // Lớp đã bắt đầu nhưng chưa kết thúc
        setTimeRemaining('Đang diễn ra');
      } else {
        // Đã qua giờ kết thúc thực sự
        setTimeRemaining('Đã kết thúc');
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 30000);

    return () => clearInterval(interval);
  }, [startHour, endHour]);

  const handleSchedulePress = () => {
    if (navigation) {
      navigation.navigate('TeacherScheduleDetail', {
        schedule,
      });
    }
  }
  
  const handleCreateQR = (schedule) => {
      // Navigate to QR generation screen
      console.log('Create QR for:', schedule);
       navigation.navigate('CreateQRSession', { schedule: schedule });
  };

  return (
    <TouchableOpacity
      onPress={() => handleSchedulePress(schedule)}
      activeOpacity={0.7}
      className="mb-4"
    >
      <LinearGradient
        colors={isUrgent && !hasActiveSession ? ['#dc2626', '#ef4444'] : isPracticeSchedule ? ['#0891b2', '#06b6d4'] : ['#0171a5', '#30b2ea']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-2xl p-4"
        style={{
          shadowColor: isUrgent ? '#dc2626' : isPracticeSchedule ? '#0891b2' : '#0171a5',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 5,
          overflow: 'hidden',
        }}
      >
        {!!teacherCardSvgUri && (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              right: 0,
              bottom: 0,
              width: 100,
              height: 100,
              opacity: 0.28,
            }}
          >
            <SvgUri
              uri={teacherCardSvgUri}
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid slice"
            />
          </View>
        )}

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

        {/* Room and Student Count */}
        <View className="flex-row items-center mb-3">
          <View className="flex-row items-center flex-1 mr-2">
            <Ionicons name="location-outline" size={16} color="white" />
            <Text className="text-white/90 text-sm ml-1">{room}</Text>
          </View>
        </View>

        {/* Time Remaining Badge */}
        {timeRemaining && (
          <View className="flex-row items-center mb-3">
            <View className="bg-white/20 px-3 py-1.5 rounded-full flex-row items-center">
              <Ionicons name="alarm-outline" size={14} color="white" />
              <Text className="text-white text-xs font-semibold ml-1">
                {timeRemaining}
              </Text>
            </View>
          </View>
        )}

        {/* Create QR Button */}
        {isInActiveWindow && !hasActiveSession && (
          <TouchableOpacity
            onPress={() => handleCreateQR(schedule)}
            className="bg-white rounded-xl py-3.5 flex-row items-center justify-center"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 3,
              elevation: 3,
            }}
          >
            <Ionicons name="qr-code" size={22} color={isUrgent ? '#dc2626' : isPracticeSchedule ? '#06b6d4' : '#0171a5'} />
            <Text 
              className={`font-bold text-base ml-2 ${isUrgent ? 'text-red-600' : isPracticeSchedule ? 'text-cyan-500' : 'text-sky-600'}`}
            >
              {isUrgent ? 'Tạo QR điểm danh ngay' : 'Tạo QR điểm danh'}
            </Text>
          </TouchableOpacity>
        )}

        {isInActiveWindow && hasActiveSession && (
          <View className="bg-white rounded-xl py-3 flex-row items-center justify-center">
            <View className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            <Text className="text-green-600 font-bold text-base">
              Phiên điểm danh đang hoạt động
            </Text>
          </View>
        )}

        {!isInActiveWindow && (
          <View className="bg-white/10 rounded-xl py-3 flex-row items-center justify-center">
            <Ionicons name="time-outline" size={18} color="white" />
            <Text className="text-white/70 text-sm ml-2">
              {timeRemaining === 'Đã kết thúc' ? 'Đã kết thúc' : 'Chưa đến giờ tạo phiên'}
            </Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default TeacherScheduleCard;
