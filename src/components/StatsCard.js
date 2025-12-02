import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const StatsCard = ({ stats, userRole = 'teacher' }) => {
  const isTeacher = userRole === 'teacher';
  
  const {
    attendanceRate = 0,
    hoursThisWeek = 0,
    studentCount = 0,
    classesThisWeek = 0,
  } = stats || {};

  const getAttendanceColor = (rate) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const statsData = isTeacher ? [
    {
      icon: 'checkmark-circle-outline',
      label: 'Tỷ lệ điểm danh TB',
      value: `${attendanceRate.toFixed(1)}%`,
      valueColor: getAttendanceColor(attendanceRate),
    },
    {
      icon: 'time-outline',
      label: 'Số giờ đã dạy',
      value: `${hoursThisWeek}h`,
      valueColor: 'text-purple-600',
    },
    {
      icon: 'people-outline',
      label: 'Tổng sinh viên',
      value: studentCount,
      valueColor: 'text-blue-600',
    },
  ] : [
    {
      icon: 'checkmark-circle-outline',
      label: 'Tỷ lệ điểm danh',
      value: `${attendanceRate.toFixed(1)}%`,
      valueColor: getAttendanceColor(attendanceRate),
    },
    {
      icon: 'calendar-outline',
      label: 'Lớp tuần này',
      value: `${classesThisWeek} tiết`,
      valueColor: 'text-blue-600',
    },
    {
      icon: 'time-outline',
      label: 'Giờ học',
      value: `${hoursThisWeek}h`,
      valueColor: 'text-indigo-600',
    },
  ];

  return (
    <View className="px-6 mb-4">
      <Text className="text-gray-900 text-base font-bold mb-3">
        Thống kê tuần này
      </Text>
      
      <View className="bg-white rounded-2xl p-4" style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}>
        <View className="flex-row justify-between">
          {statsData.map((stat, index) => (
            <View key={index} className="flex-1 items-center">
              <View 
                className={`w-12 h-12 rounded-full items-center justify-center mb-2`}
                style={{ backgroundColor: isTeacher ? '#faf5ff' : '#eff6ff' }}
              >
                <Ionicons 
                  name={stat.icon} 
                  size={24} 
                  color={isTeacher ? '#7c3aed' : '#2563eb'} 
                />
              </View>
              <Text className={`text-2xl font-bold ${stat.valueColor} mb-1`}>
                {stat.value}
              </Text>
              <Text className="text-gray-500 text-xs text-center" numberOfLines={2}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default StatsCard;
