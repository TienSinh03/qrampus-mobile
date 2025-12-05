import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const TeacherScheduleCard = ({ schedule, navigation }) => {
  const {
    id,
    courseName = 'Tên môn học',
    courseCode = 'MH001',
    room = 'A101',
    startTime = '07:00',
    endTime = '09:00',
    studentCount = 0,
    hasActiveSession = false,
    courseSectionId = 1,
  } = schedule || {};

  const [timeRemaining, setTimeRemaining] = useState('');
  const [isInActiveWindow, setIsInActiveWindow] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date();
      const [startHour, startMinute] = startTime.split(':').map(Number);
      
      const classTime = new Date();
      classTime.setHours(startHour, startMinute, 0, 0);
      
      const diffMs = classTime - now;
      const diffMinutes = Math.floor(diffMs / 60000);
      
      // Kiểm tra nếu trong khoảng thời gian tạo phiên (5 phút trước đến 30 phút sau giờ bắt đầu)
      const inWindow = diffMinutes >= -5 && diffMinutes <= 30;
      setIsInActiveWindow(inWindow);
      
      // Kiểm tra nếu trong khoảng thời gian khẩn cấp (5 phút trước đến 5 phút sau giờ bắt đầu)
      const urgent = diffMinutes >= -5 && diffMinutes <= 5;
      setIsUrgent(urgent);
      
      if (diffMinutes > 60) {
        const hours = Math.floor(diffMinutes / 60);
        const mins = diffMinutes % 60;
        setTimeRemaining(`${hours}h ${mins}p nữa`);
      } else if (diffMinutes > 0) {
        setTimeRemaining(`${diffMinutes} phút nữa`);
      } else if (diffMinutes > -30) {
        setTimeRemaining('Đang diễn ra');
      } else {
        setTimeRemaining('Đã kết thúc');
      }
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 30000); // Update every 30s
    
    return () => clearInterval(interval);
  }, [startTime]);

  const handleSchedulePress = () => {
    if (navigation) {
      navigation.navigate('SessionList', {
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
        colors={isUrgent && !hasActiveSession ? ['#dc2626', '#ef4444'] : ['#7c3aed', '#8b5cf6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-2xl p-4"
        style={{
          shadowColor: isUrgent ? '#dc2626' : '#7c3aed',
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
              {startTime} - {endTime}
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

        {/* Room and Student Count */}
        <View className="flex-row items-center mb-3">
          <View className="flex-row items-center flex-1 mr-2">
            <Ionicons name="location-outline" size={16} color="white" />
            <Text className="text-white/90 text-sm ml-1">{room}</Text>
          </View>
          <View className="flex-row items-center flex-1">
            <Ionicons name="people-outline" size={16} color="white" />
            <Text className="text-white/90 text-sm ml-1">
              {studentCount} sinh viên
            </Text>
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
            <Ionicons name="qr-code" size={22} color={isUrgent ? '#dc2626' : '#7c3aed'} />
            <Text 
              className={`font-bold text-base ml-2 ${isUrgent ? 'text-red-600' : 'text-purple-600'}`}
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
