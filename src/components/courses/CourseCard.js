import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const CourseCard = ({ course, onPress, userRole = 'student' }) => {
  const {
    courseCode = 'CS101',
    courseName = 'Tên khóa học',
    semester = 'HK1 2024-2025',
    credits = 3,
    status = 'active',
    teacherName = '',
    studentCount = 0,
    classSessions = [],
  } = course || {};

  // Màu sắc dựa theo role
  const isTeacher = userRole === 'teacher';
  const gradientColors = isTeacher 
    ? ['#0171a5', '#0171a5'] // Blue for teacher
    : ['#2563eb', '#3b82f6']; // Blue for student

  const accentColor = isTeacher ? '#0171a5' : '#2563eb';
  // Status badge
  const getStatusBadge = () => {
    switch (status) {
      case 'active':
        return { label: 'Đang học', bgColor: 'bg-green-500/50', textColor: 'text-green-100' };
      case 'completed':
        return { label: 'Hoàn thành', bgColor: 'bg-gray-500/50', textColor: 'text-gray-200' };
      case 'upcoming':
        return { label: 'Sắp tới', bgColor: 'bg-yellow-500/50', textColor: 'text-yellow-100' };
      default:
        return { label: 'Đang học', bgColor: 'bg-green-500/50', textColor: 'text-green-100' };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <TouchableOpacity
      onPress={() => onPress?.(course)}
      activeOpacity={0.7}
      className="mb-4"
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-2xl p-4"
        style={{
          shadowColor: accentColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 5,
        }}
      >
        {/* Header - Course Code and Status */}
        <View className="flex-row justify-between items-center mb-3">
          <View className="bg-white/20 px-3 py-1 rounded-full">
            <Text className="text-white text-sm font-bold">{courseCode}</Text>
          </View>
          <View className={`${statusBadge.bgColor} px-3 py-1 rounded-full`}>
            <Text className={`${statusBadge.textColor} text-xs font-semibold`}>
              {statusBadge.label}
            </Text>
          </View>
        </View>

        {/* Course Name */}
        <Text className="text-white text-lg font-bold mb-3" numberOfLines={2}>
          {courseName}
        </Text>

        {/* Course Details */}
        <View className="flex-row flex-wrap items-center">
          {/* Semester */}
          <View className="flex-row items-center mr-4 mb-2">
            <Ionicons name="calendar-outline" size={16} color="white" />
            <Text className="text-white/90 text-sm ml-1">{semester}</Text>
          </View>

          {/* Credits */}
          <View className="flex-row items-center mr-4 mb-2">
            <Ionicons name="school-outline" size={16} color="white" />
            <Text className="text-white/90 text-sm ml-1">{credits} tín chỉ</Text>
          </View>

          {/* Teacher name for students */}
          {!isTeacher && teacherName && (
            <View className="flex-row items-center mr-4 mb-2">
              <Ionicons name="person-outline" size={16} color="white" />
              <Text className="text-white/90 text-sm ml-1" numberOfLines={1}>
                {teacherName}
              </Text>
            </View>
          )}

          {/* Student count for teachers */}
          {isTeacher && studentCount > 0 && (
            <View className="flex-row items-center mr-4 mb-2">
              <Ionicons name="people-outline" size={16} color="white" />
              <Text className="text-white/90 text-sm ml-1">
                {studentCount} sinh viên
              </Text>
            </View>
          )}
        </View>

        {/* View Details Button */}
        <View className="flex-row justify-end mt-2">
          <View className="flex-row items-center">
            <Text className="text-white/80 text-sm mr-1">Chi tiết</Text>
            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.8)" />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default CourseCard;
