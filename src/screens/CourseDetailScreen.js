import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SvgUri } from 'react-native-svg';
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import axiosInstance from '../api/axiosInstance';

const { width } = Dimensions.get('window');
const audiobookSvgUri = Image.resolveAssetSource(
  require('../../assets/undraw_audiobook.svg')
).uri;

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
    ? ['#0171a5', '#30b2ea'] 
    : ['#2563eb', '#3b82f6'];
  const accentColor = isTeacher ? '#0171a5' : '#2563eb';
  const [courseSurveyEnrollments, setCourseSurveyEnrollments] = useState([]);
  const [surveyLoading, setSurveyLoading] = useState(false);
  const [surveyError, setSurveyError] = useState('');

  const [teacherSurveyStats, setTeacherSurveyStats] = useState(null);
  const [teacherSurveyLoading, setTeacherSurveyLoading] = useState(false);
  const [teacherSurveyError, setTeacherSurveyError] = useState('');

  const courseSectionId = course?.courseId || course?.courseSectionId || course?.id || null;

  const fetchTeacherSurveyStats = useCallback(async () => {
    if (!isTeacher || !courseSectionId) return;
    setTeacherSurveyLoading(true);
    setTeacherSurveyError('');
    try {
      const res = await axiosInstance.get(
        `/survey/teacher/course-section/${courseSectionId}/statistics`
      );
      setTeacherSurveyStats(res?.data?.data || null);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 403) {
        setTeacherSurveyStats({ surveys: [] });
      } else {
        setTeacherSurveyError(
          err?.response?.data?.message || 'Không thể tải thống kê khảo sát'
        );
      }
    } finally {
      setTeacherSurveyLoading(false);
    }
  }, [isTeacher, courseSectionId]);

  const fetchStudentCourseSurveys = useCallback(async () => {
    if (isTeacher || !courseSectionId) {
      setCourseSurveyEnrollments([]);
      return;
    }

    setSurveyLoading(true);
    setSurveyError('');

    try {
      const res = await axiosInstance.get(
        `/survey/my-surveys/course-section/${courseSectionId}`
      );
      setCourseSurveyEnrollments(res?.data?.data || []);
    } catch (err) {
      setCourseSurveyEnrollments([]);
      setSurveyError(
        err?.response?.data?.message || 'Không thể tải danh sách khảo sát'
      );
    } finally {
      setSurveyLoading(false);
    }
  }, [isTeacher, courseSectionId]);

  const courseSurveyItems = useMemo(() => {
    return (courseSurveyEnrollments || []).map((enrollment) => {
      const {
        id,
        learning_type,
        practice_group_id,
        practiceGroup,
        courseSection,
      } = enrollment;

      const surveys = courseSection?.surveys || [];

      const validSurveys = surveys.filter((survey) => {
        if (learning_type === 'theory') {
          return survey.practice_group_id === null;
        }
        if (learning_type === 'practice') {
          return survey.practice_group_id === practice_group_id;
        }
        return false;
      });

      return {
        enrollmentId: id,
        courseCode: courseSection?.code,
        courseName: courseSection?.name,
        semester: courseSection?.semester,
        learningType: learning_type,
        practiceGroupName: practiceGroup?.group_name,
        practiceGroupNumber: practiceGroup?.number_group,
        hasSurvey: validSurveys.length > 0,
        surveys: validSurveys,
      };
    });
  }, [courseSurveyEnrollments]);

  const surveyEntries = useMemo(() => {
    return courseSurveyItems.flatMap((item) => {
      if (!item.hasSurvey || !item.surveys?.length) {
        return [{ item, survey: null }];
      }
      return item.surveys.map((survey) => ({ item, survey }));
    });
  }, [courseSurveyItems]);

  const sortedSurveyEntries = useMemo(() => {
    const now = new Date();

    return [...surveyEntries]
      .sort((a, b) => {
        const aPractice = a.item?.learningType === 'practice';
        const bPractice = b.item?.learningType === 'practice';
        if (aPractice !== bPractice) return aPractice ? 1 : -1;

        const aGroup = Number(a.item?.practiceGroupNumber || 0);
        const bGroup = Number(b.item?.practiceGroupNumber || 0);
        if (aGroup !== bGroup) return aGroup - bGroup;

        const aClose = a.survey?.closes_at ? new Date(a.survey.closes_at).getTime() : Number.MAX_SAFE_INTEGER;
        const bClose = b.survey?.closes_at ? new Date(b.survey.closes_at).getTime() : Number.MAX_SAFE_INTEGER;
        return aClose - bClose;
      });
  }, [surveyEntries]);

  const formatSurveyDate = (dateValue) => {
    if (!dateValue) return 'Chưa cập nhật';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return 'Chưa cập nhật';
    return date.toLocaleDateString('vi-VN');
  };

  const getSurveyTheme = (status) => {
    if (status === 'completed') {
      return {
        cardBg: '#ecfdf5',
        borderColor: '#a7f3d0',
        statusBg: '#bbf7d0',
        statusText: '#166534',
        statusLabel: 'Đã hoàn thành',
      };
    }

    if (status === 'pending') {
      return {
        cardBg: '#eff6ff',
        borderColor: '#bfdbfe',
        statusBg: '#bfdbfe',
        statusText: '#1d4ed8',
        statusLabel: 'Chưa hoàn thành',
      };
    }

    if (status === 'closed') {
      return {
        cardBg: '#f8fafc',
        borderColor: '#cbd5e1',
        statusBg: '#f1f5f9',
        statusText: '#64748b',
        statusLabel: 'Đã kết thúc',
      };
    }

    if (status === 'missed') {
      return {
        cardBg: '#fff7ed',
        borderColor: '#fed7aa',
        statusBg: '#ffedd5',
        statusText: '#c2410c',
        statusLabel: 'Không hoàn thành',
      };
    }

    return {
      cardBg: '#f8fafc',
      borderColor: '#e2e8f0',
      statusBg: '#e2e8f0',
      statusText: '#475569',
      statusLabel: 'Chưa có',
    };
  };

  const handleOpenSurvey = (entry) => {
    if (!entry?.survey?.id) {
      return;
    }

    navigation.navigate('SurveyQuestion', {
      surveyId: entry.survey.id,
      courseName: entry.item.courseName || courseName,
      courseCode: entry.item.courseCode || courseCode,
      semester: entry.item.semester || semester,
      learningType: entry.item.learningType,
      practiceGroupName: entry.item.practiceGroupName,
      practiceGroupNumber: entry.item.practiceGroupNumber,
    });
  };

  useEffect(() => {
    fetchStudentCourseSurveys();
  }, [fetchStudentCourseSurveys]);

  useEffect(() => {
    fetchTeacherSurveyStats();
  }, [fetchTeacherSurveyStats]);

  useFocusEffect(
    useCallback(() => {
      if (isTeacher) {
        fetchTeacherSurveyStats();
        return;
      }
      fetchStudentCourseSurveys();
    }, [isTeacher, fetchStudentCourseSurveys, fetchTeacherSurveyStats])
  );


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
        style={{ overflow: 'hidden' }}
      >
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
            uri={audiobookSvgUri}
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid meet"
          />
        </View>

        {/* Navigation Bar */}
        <View className="flex-row items-center justify-between">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">
              {courseCode} - {semester}
          </Text>
          <View style={{ width: 20 }} />
        </View>

        {/* Course Header Info */}
        <View className="mt-1">
          <View className="flex-row items-center justify-between">
            {/* Left side */}
            <View className="flex-row items-center flex-1">
              {/* Course code */}
              <View className="px-4 py-2 mr-3">
                <Text className="text-white font-bold text-sm tracking-wider ">
                  {courseName}
                </Text>
              </View>
            </View>

            {/* Status */}
            <View className={`${statusBadge.bgColor} px-3 py-1 rounded-full ml-3`}>
              <Text className={`${statusBadge.textColor} text-xs font-semibold`}>
                {statusBadge.label}
              </Text>
            </View>
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

        {/* khảo sát */}
        <View className="px-6 pb-6">
          <Text className="text-gray-900 font-bold text-lg mb-3">
            {isTeacher ? 'Khảo sát của sinh viên' : 'Khảo sát của bạn'}
          </Text>

          {!isTeacher ? (
            <View>
              {surveyLoading && sortedSurveyEntries.length === 0 && (
                <View className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm mb-3">
                  <ActivityIndicator size="small" color="#2563eb" />
                </View>
              )}

              {!!surveyError && !surveyLoading && (
                <View className="bg-red-50 rounded-2xl p-4 border border-red-200 shadow-sm mb-3">
                  <Text className="text-red-600 text-sm">{surveyError}</Text>
                </View>
              )}

              {!surveyLoading && !surveyError && sortedSurveyEntries.length === 0 && (
                <View className="bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-sm mb-3">
                  <Text className="text-slate-600 text-sm">
                    Chưa có khảo sát cho học phần này.
                  </Text>
                </View>
              )}

              {sortedSurveyEntries.map((entry, index) => {
                const surveyId = entry.survey?.id || null;
                const now = new Date();
                const isActive = entry.survey?.is_active === true;
                const isExpired = entry.survey?.closes_at
                  ? new Date(entry.survey.closes_at) < now
                  : false;
                const canDo = isActive && !isExpired;
                const isCompleted = entry.survey?.questions?.some(
                  (q) => q.responses?.length > 0
                ) ?? false;
                const status = !surveyId ? 'none'
                  : isCompleted ? 'completed'
                  : canDo ? 'pending'
                  : 'missed';
                const theme = getSurveyTheme(status);

                return (
                  <View
                    key={`${entry.item.enrollmentId}-${surveyId || 'none'}-${index}`}
                    className="rounded-b-xl border shadow-sm mb-3 overflow-hidden"
                    style={{
                      backgroundColor: theme.cardBg,
                      borderColor: theme.borderColor,
                    }}
                  >
                    {/* Strip màu trên cùng theo trạng thái */}
                    <View
                      style={{
                        height: 4,
                        backgroundColor:
                          status === 'completed' ? '#10b981'
                          : status === 'pending' ? '#3b82f6'
                          : status === 'missed' ? '#f97316'
                          : '#e2e8f0',
                      }}
                    />

                    <View className="p-4">
                      {/* Tiêu đề + badge trạng thái */}
                      <View className="flex-row items-start justify-between mb-1">
                        <Text
                          className="text-base font-bold text-gray-900 flex-1 mr-2"
                          numberOfLines={2}
                        >
                          {entry.survey?.title || 'Khảo sát chất lượng môn học'}
                        </Text>
                        <View
                          className="px-2 py-1 rounded-full"
                          style={{ backgroundColor: theme.statusBg }}
                        >
                          <Text
                            className="text-xs font-bold"
                            style={{ color: theme.statusText }}
                          >
                            {theme.statusLabel}
                          </Text>
                        </View>
                      </View>

                      {/* Hạn cuối */}
                      {entry.survey?.closes_at && (
                        <Text className="text-xs text-gray-400 mb-3">
                          Hạn cuối: {formatSurveyDate(entry.survey.closes_at)}
                        </Text>
                      )}

                      {/* Badges loại học */}
                      <View className="flex-row flex-wrap" style={{ gap: 6 }}>
                        {entry.item?.learningType === 'practice' ? (
                          <View className="bg-cyan-100 px-2.5 py-0.5 rounded-full">
                            <Text className="text-cyan-700 text-xs font-semibold">
                              Thực hành
                            </Text>
                          </View>
                        ) : (
                          <View className="bg-blue-100 px-2.5 py-0.5 rounded-full">
                            <Text className="text-blue-700 text-xs font-semibold">
                              Lý thuyết
                            </Text>
                          </View>
                        )}
                        {entry.item?.learningType === 'practice' &&
                          entry.item?.practiceGroupNumber && (
                            <View className="bg-purple-100 px-2.5 py-0.5 rounded-full">
                              <Text className="text-purple-700 text-xs font-semibold">
                                Nhóm TH{String(entry.item.practiceGroupNumber).padStart(2, '0')}
                              </Text>
                            </View>
                          )}
                      </View>

                      {/* Thông báo không hoàn thành */}
                      {!!surveyId && status === 'missed' && (
                        <View className="mt-3 flex-row items-center">
                          <Ionicons name="alert-circle-outline" size={15} color="#f97316" />
                          <Text className="ml-1.5 text-xs text-orange-500 font-medium">
                            Bạn không hoàn thành khảo sát này
                          </Text>
                        </View>
                      )}

                      {/* Button */}
                      {!!surveyId && (canDo || isCompleted) && (
                        <TouchableOpacity
                          className="mt-3 rounded-xl px-4 py-2.5 flex-row items-center justify-center"
                          activeOpacity={0.85}
                          onPress={() => handleOpenSurvey(entry)}
                          style={
                            isCompleted || !canDo
                              ? { backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0' }
                              : { backgroundColor: '#2563eb' }
                          }
                        >
                          <Ionicons
                            name={isCompleted ? 'checkmark-circle-outline' : 'document-text-outline'}
                            size={16}
                            color={isCompleted || !canDo ? '#64748b' : '#fff'}
                          />
                          <Text
                            className="font-semibold ml-2"
                            style={{ color: isCompleted || !canDo ? '#64748b' : '#fff' }}
                          >
                            {isCompleted ? 'Xem lại khảo sát' : 'Làm khảo sát ngay'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View>
              {teacherSurveyLoading && (
                <View className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm items-center">
                  <ActivityIndicator size="small" color="#0171a5" />
                  <Text className="text-gray-400 text-sm mt-2">Đang tải thống kê...</Text>
                </View>
              )}

              {!!teacherSurveyError && !teacherSurveyLoading && (
                <View className="bg-red-50 rounded-2xl p-4 border border-red-200 shadow-sm">
                  <Text className="text-red-600 text-sm">{teacherSurveyError}</Text>
                </View>
              )}

              {!teacherSurveyLoading && !teacherSurveyError && teacherSurveyStats?.surveys?.length === 0 && (
                <View className="bg-slate-50 rounded-2xl p-4 border border-slate-200 shadow-sm flex-row items-center">
                  <Ionicons name="document-text-outline" size={22} color="#64748b" />

                  <View className="flex-1">
                    <Text className="text-slate-700 font-medium text-sm">
                      Chưa có khảo sát nào
                    </Text>
                    <Text className="text-slate-500 text-xs mt-1">
                      Học phần này hiện chưa được tạo khảo sát.
                    </Text>
                  </View>
                </View>
              )}

              {!teacherSurveyLoading && !teacherSurveyError &&
                (teacherSurveyStats?.surveys || []).map((survey, index) => {
                  const overview = survey.overview || {};
                  const isPractice = survey.class_type === 'THỰC HÀNH';
                  const groupNum = survey.practice_group?.number_group;

                  return (
                    <View
                      key={survey.survey_id || index}
                      className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm mb-3"
                    >
                      {/* Tiêu đề + badge loại */}
                      <View className="flex-row items-start justify-between mb-2">
                        <Text className="text-base font-bold text-gray-900 flex-1 mr-2" numberOfLines={2}>
                          {survey.survey_title || 'Khảo sát chất lượng môn học'}
                        </Text>
                        <View
                          className="px-2 py-1 rounded-full"
                          style={{ backgroundColor: isPractice ? '#e0f2fe' : '#ede9fe' }}
                        >
                          <Text
                            className="text-xs font-semibold"
                            style={{ color: isPractice ? '#0369a1' : '#6d28d9' }}
                          >
                            {isPractice
                              ? `TH${groupNum != null ? String(groupNum).padStart(2, '0') : ''}`
                              : 'Lý thuyết'}
                          </Text>
                        </View>
                      </View>

                      {/* Hạn cuối */}
                      <Text className="text-sm text-gray-500 mb-3">
                        Hạn cuối:{' '}
                        {survey.closes_at
                          ? new Date(survey.closes_at).toLocaleDateString('vi-VN')
                          : 'Chưa cập nhật'}
                      </Text>

                      <View className="h-px bg-gray-100 mb-3" />

                      {/* Sinh viên đã khảo sát */}
                      <View className="flex-row justify-between mb-2">
                        <Text className="text-sm text-gray-500">Sinh viên đã khảo sát</Text>
                        <Text className="text-sm font-bold text-gray-900">
                          {overview.total_students_responded ?? 0}
                          {' / '}
                          {overview.total_students_enrolled ?? 0}
                        </Text>
                      </View>

                      {/* Tỷ lệ hoàn thành */}
                      <View className="flex-row justify-between mb-2">
                        <Text className="text-sm text-gray-500">Tỷ lệ tham gia</Text>
                        <Text className="text-sm font-bold text-blue-600">
                          {overview.completion_rate != null
                            ? `${overview.completion_rate}%`
                            : '—'}
                        </Text>
                      </View>

                      {/* Đánh giá trung bình */}
                      <View className="flex-row justify-between items-center">
                        <Text className="text-sm text-gray-500">Đánh giá trung bình</Text>
                        {overview.avg_rating > 0 ? (
                          <Text className="text-yellow-500 font-bold text-base">
                            ⭐ {Number(overview.avg_rating).toFixed(1)}
                          </Text>
                        ) : (
                          <Text className="text-sm text-gray-400">Chưa có</Text>
                        )}
                      </View>
                    </View>
                  );
                })}
            </View>
          )}
        </View>

        {/* Bottom spacing */}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default CourseDetailScreen;
