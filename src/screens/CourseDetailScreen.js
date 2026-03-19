import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const CourseDetailScreen = ({ navigation, route }) => {
  // Lấy thông tin từ route params
  const course = route?.params?.course || {};
  const userRole = route?.params?.userRole || 'student';

  const {
    courseCode = 'CS101',
    courseName = 'Tên khóa học',
    semester = 'HK1 2024-2025',
    credits = 3,
    description = 'Mô tả khóa học...',
    status = 'active',
    teacherName = 'Giảng viên',
    studentCount = 0,
    classSessions = [],
  } = course;

  // Màu sắc dựa theo role
  const isTeacher = userRole === 'teacher';
  const gradientColors = isTeacher 
    ? ['#7c3aed', '#8b5cf6'] 
    : ['#2563eb', '#3b82f6'];
  const accentColor = isTeacher ? '#7c3aed' : '#2563eb';

  // Status badge
  const getStatusBadge = () => {
    switch (status) {
      case 'active':
        return { label: 'Đang học', bgColor: 'bg-green-500', textColor: 'text-white' };
      case 'completed':
        return { label: 'Hoàn thành', bgColor: 'bg-gray-500', textColor: 'text-white' };
      case 'upcoming':
        return { label: 'Sắp tới', bgColor: 'bg-yellow-500', textColor: 'text-white' };
      default:
        return { label: 'Đang học', bgColor: 'bg-green-500', textColor: 'text-white' };
    }
  };

  const statusBadge = getStatusBadge();

  // Mock statistics - có thể thay bằng dữ liệu thật sau
  const stats = {
    totalSessions: 15,
    completedSessions: 8,
    attendanceRate: 85,
    upcomingSessions: 7,
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pt-4 pb-6"
      >
        {/* Navigation Bar */}
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">Chi tiết khóa học</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Course Header Info */}
        <View className="items-center">
          <View className="bg-white/20 px-4 py-2 rounded-full mb-3">
            <Text className="text-white font-bold text-base">{courseCode}</Text>
          </View>
          <Text className="text-white text-2xl font-bold text-center mb-2" numberOfLines={2}>
            {courseName}
          </Text>
          <View className="flex-row items-center">
            <View className={`${statusBadge.bgColor} px-3 py-1 rounded-full mr-2`}>
              <Text className={`${statusBadge.textColor} text-xs font-semibold`}>
                {statusBadge.label}
              </Text>
            </View>
            <Text className="text-white/80 text-sm">{semester}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false}
      >
        {/* Statistics Cards */}
        <View className="px-6 py-4">
          <Text className="text-gray-900 font-bold text-lg mb-3">Thống kê</Text>
          
          <View className="flex-row flex-wrap justify-between">
            {/* Total Sessions */}
            <View 
              className="bg-white rounded-2xl p-4 mb-3"
              style={{
                width: (width - 48 - 12) / 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View 
                className="w-10 h-10 rounded-full items-center justify-center mb-2"
                style={{ backgroundColor: isTeacher ? '#f3e8ff' : '#dbeafe' }}
              >
                <Ionicons name="calendar" size={20} color={accentColor} />
              </View>
              <Text className="text-2xl font-bold text-gray-900">{classSessions.length}</Text>
              <Text className="text-gray-500 text-xs">Tổng số buổi</Text>
            </View>

            {/* Completed Sessions */}
            <View 
              className="bg-white rounded-2xl p-4 mb-3"
              style={{
                width: (width - 48 - 12) / 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View className="w-10 h-10 rounded-full items-center justify-center mb-2 bg-green-100">
                <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              </View>
              <Text className="text-2xl font-bold text-gray-900">{classSessions.filter(session => session.status === 'completed').length}</Text>
              <Text className="text-gray-500 text-xs">Đã hoàn thành</Text>
            </View>

            {/* Attendance Rate */}
            <View 
              className="bg-white rounded-2xl p-4 mb-3"
              style={{
                width: (width - 48 - 12) / 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View className="w-10 h-10 rounded-full items-center justify-center mb-2 bg-orange-100">
                <Ionicons name="stats-chart" size={20} color="#f59e0b" />
              </View>
              <Text className="text-2xl font-bold text-gray-900">{stats.attendanceRate}%</Text>
              <Text className="text-gray-500 text-xs">
                {isTeacher ? 'Tỷ lệ ĐD TB' : 'Tỷ lệ điểm danh'}
              </Text>
            </View>

            {/* Upcoming Sessions / Student Count */}
            <View 
              className="bg-white rounded-2xl p-4 mb-3"
              style={{
                width: (width - 48 - 12) / 2,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View 
                className="w-10 h-10 rounded-full items-center justify-center mb-2"
                style={{ backgroundColor: isTeacher ? '#fce7f3' : '#e0e7ff' }}
              >
                <Ionicons 
                  name={isTeacher ? 'people' : 'time'} 
                  size={20} 
                  color={isTeacher ? '#ec4899' : '#6366f1'} 
                />
              </View>
              <Text className="text-2xl font-bold text-gray-900">
                {isTeacher ? studentCount : classSessions.filter(session => session.status === 'scheduled').length}
              </Text>
              <Text className="text-gray-500 text-xs">
                {isTeacher ? 'Sinh viên' : 'Buổi sắp tới'}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        {/* <View className="px-6 pb-4">
          <Text className="text-gray-900 font-bold text-lg mb-3">Thao tác nhanh</Text>
          <TouchableOpacity
            className="rounded-xl py-4 flex-row items-center justify-center"
            style={{
              backgroundColor: accentColor,
              shadowColor: accentColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
            onPress={() => navigation.navigate('Schedule')}
          >
            <Ionicons name="calendar" size={24} color="white" />
            <Text className="text-white font-bold text-base ml-2">
              Xem lịch {isTeacher ? 'giảng' : 'học'}
            </Text>
          </TouchableOpacity>
        </View> */}

        {/* Course Information */}
        <View className="px-6 pb-4">
          <Text className="text-gray-900 font-bold text-lg mb-3">Thông tin khóa học</Text>
          
          <View className="bg-white rounded-2xl p-4" style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            {/* Semester */}
            <View className="flex-row items-center mb-4 pb-4 border-b border-gray-100">
              <View 
                className="w-12 h-12 rounded-xl items-center justify-center mr-3"
                style={{ backgroundColor: isTeacher ? '#f3e8ff' : '#dbeafe' }}
              >
                <Ionicons name="calendar" size={24} color={accentColor} />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-xs mb-1">Học kỳ</Text>
                <Text className="text-gray-900 font-bold text-base">{semester}</Text>
              </View>
            </View>

            {/* Credits */}
            <View className="flex-row items-center mb-4 pb-4 border-b border-gray-100">
              <View className="w-12 h-12 bg-orange-50 rounded-xl items-center justify-center mr-3">
                <Ionicons name="school" size={24} color="#f59e0b" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-xs mb-1">Số tín chỉ</Text>
                <Text className="text-gray-900 font-bold text-base">{credits} tín chỉ</Text>
              </View>
            </View>

            {/* Teacher Info - Only for students */}
            {!isTeacher && teacherName && (
              <View className="flex-row items-center mb-4 pb-4 border-b border-gray-100">
                <View className="w-12 h-12 bg-purple-50 rounded-xl items-center justify-center mr-3">
                  <Ionicons name="person" size={24} color="#8b5cf6" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-500 text-xs mb-1">Giảng viên</Text>
                  <Text className="text-gray-900 font-bold text-base">{teacherName}</Text>
                </View>
              </View>
            )}

            {/* Student Count - Only for teachers */}
            {isTeacher && studentCount > 0 && (
              <View className="flex-row items-center mb-4 pb-4 border-b border-gray-100">
                <View className="w-12 h-12 bg-pink-50 rounded-xl items-center justify-center mr-3">
                  <Ionicons name="people" size={24} color="#ec4899" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-500 text-xs mb-1">Số lượng sinh viên</Text>
                  <Text className="text-gray-900 font-bold text-base">{studentCount} sinh viên</Text>
                </View>
              </View>
            )}

            {/* Description */}
            {description && (
              <View className="flex-row items-start">
                <View className="w-12 h-12 bg-green-50 rounded-xl items-center justify-center mr-3">
                  <Ionicons name="document-text" size={24} color="#10b981" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-500 text-xs mb-1">Mô tả</Text>
                  <Text className="text-gray-700 text-sm leading-5">{description}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Schedule Info */}
        <View className="px-6 pb-6">
          <Text className="text-gray-900 font-bold text-lg mb-3">
            {isTeacher ? 'Lịch giảng dạy' : 'Lịch học'}
          </Text>
          <View className="bg-white rounded-2xl p-6 items-center"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text className="text-4xl mb-2">📅</Text>
            <Text className="text-gray-700 font-semibold text-base mb-1">
              {stats.totalSessions} buổi học
            </Text>
            <Text className="text-gray-500 text-sm text-center">
              Xem chi tiết trong mục Lịch {isTeacher ? 'giảng' : 'học'}
            </Text>
          </View>
        </View>

        {/* Bottom spacing */}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default CourseDetailScreen;
