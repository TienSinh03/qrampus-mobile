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
import { useDispatch, useSelector } from 'react-redux';

import { checkSurveyCompletion } from '../features/surveyResponse/surveyResponseThunks';
import { selectCompletionStatuses } from '../features/surveyResponse/surveyResponseSlice';
import axiosInstance from '../api/axiosInstance';

const { width } = Dimensions.get('window');
const audiobookSvgUri = Image.resolveAssetSource(
  require('../../assets/undraw_audiobook.svg')
).uri;

const CourseDetailScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();

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
  const completionStatuses = useSelector(selectCompletionStatuses);
  const [courseSurveyEnrollments, setCourseSurveyEnrollments] = useState([]);
  const [surveyLoading, setSurveyLoading] = useState(false);
  const [surveyError, setSurveyError] = useState('');
  const courseSectionId = course?.courseId || course?.courseSectionId || course?.id || null;

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
    return [...surveyEntries].sort((a, b) => {
      const aPractice = a.item?.learningType === 'practice';
      const bPractice = b.item?.learningType === 'practice';
      if (aPractice !== bPractice) {
        return aPractice ? 1 : -1;
      }

      const aGroup = Number(a.item?.practiceGroupNumber || 0);
      const bGroup = Number(b.item?.practiceGroupNumber || 0);
      if (aGroup !== bGroup) {
        return aGroup - bGroup;
      }

      const aClose = a.survey?.closes_at ? new Date(a.survey.closes_at).getTime() : Number.MAX_SAFE_INTEGER;
      const bClose = b.survey?.closes_at ? new Date(b.survey.closes_at).getTime() : Number.MAX_SAFE_INTEGER;
      return aClose - bClose;
    });
  }, [surveyEntries]);

  const surveyIds = useMemo(
    () => [...new Set(surveyEntries.map((entry) => entry.survey?.id).filter(Boolean))],
    [surveyEntries]
  );

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

    return {
      cardBg: '#f8fafc',
      borderColor: '#e2e8f0',
      statusBg: '#e2e8f0',
      statusText: '#475569',
      statusLabel: 'Chưa có khảo sát',
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

  useFocusEffect(
    useCallback(() => {
      if (isTeacher) return;

      fetchStudentCourseSurveys();
    }, [isTeacher, fetchStudentCourseSurveys])
  );

  useEffect(() => {
    if (!isTeacher && surveyIds.length > 0) {
      surveyIds.forEach((id) => {
        dispatch(checkSurveyCompletion(id));
      });
    }
  }, [dispatch, isTeacher, surveyIds]);

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
            right: -24,
            bottom: -14,
            width: 200,
            height: 140,
            opacity: 0.18,
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
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">Chi tiết khóa học</Text>
          <View style={{ width: 20 }} />
        </View>

        {/* Course Header Info */}
        <View className="mt-1">
          <View className="flex-row items-center justify-between mb-4">
            {/* Left side */}
            <View className="flex-row items-center flex-1">
              {/* Course code */}
              <View className="bg-white/20 px-4 py-2 rounded-full border border-white/20 mr-3">
                <Text className="text-white font-bold text-sm tracking-wider">
                  {courseCode}
                </Text>
              </View>

              {/* Semester */}
              <Text
                numberOfLines={1}
                className="text-white/80 text-sm flex-1"
              >
                {semester}
              </Text>
            </View>

            {/* Status */}
            <View className={`${statusBadge.bgColor} px-3 py-1 rounded-full ml-3`}>
              <Text className={`${statusBadge.textColor} text-xs font-semibold`}>
                {statusBadge.label}
              </Text>
            </View>
          </View>
          {/* Tên khóa học */}
          <Text
            numberOfLines={2}
            className="text-white text-xl font-bold leading-9 mb-3"
          >
            {courseName}
          </Text>
          {/* Extra info row */}
          <View className="flex-row items-center justify-between bg-white/10 rounded-2xl px-4 py-3 border border-white/10">
            <View>
              <Text className="text-white/70 text-xs">
                Trạng thái
              </Text>
              <Text className="text-white font-semibold text-sm mt-1">
                Đang hoạt động
              </Text>
            </View>

            <View className="w-px h-8 bg-white/20" />

            <View>
              <Text className="text-white/70 text-xs">
                Loại
              </Text>
              <Text className="text-white font-semibold text-sm mt-1">
                Học phần
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
            {isTeacher ? 'Khảo sát của sinh viên' : 'Khảo sát khóa học'}
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
                const completionStatus = surveyId
                  ? completionStatuses[surveyId]
                  : null;
                const isCompleted = completionStatus?.isComplete || false;
                const status = !surveyId ? 'none' : isCompleted ? 'completed' : 'pending';
                const theme = getSurveyTheme(status);

                return (
                  <View
                    key={`${entry.item.enrollmentId}-${surveyId || 'none'}-${index}`}
                    className="rounded-2xl p-4 border shadow-sm mb-3"
                    style={{
                      backgroundColor: theme.cardBg,
                      borderColor: theme.borderColor,
                    }}
                  >
                    <Text className="text-base font-bold text-gray-900 mb-2">
                      {entry.survey?.title || 'Khảo sát chất lượng môn học'}
                    </Text>

                    <Text className="text-sm text-gray-500 mb-3">
                      Hạn cuối: {formatSurveyDate(entry.survey?.closes_at)}
                    </Text>

                    <View className="flex-row flex-wrap mb-3">
                      {entry.item?.learningType === 'practice' ? (
                        <View className="bg-cyan-100 px-3 py-1 rounded-full mr-2 mb-2">
                          <Text className="text-cyan-700 text-xs font-semibold">
                            Thực hành
                          </Text>
                        </View>
                      ) : (
                        <View className="bg-blue-100 px-3 py-1 rounded-full mr-2 mb-2">
                          <Text className="text-blue-700 text-xs font-semibold">
                            Lý thuyết
                          </Text>
                        </View>
                      )}

                      {entry.item?.learningType === 'practice' &&
                        entry.item?.practiceGroupNumber && (
                          <View className="bg-purple-100 px-3 py-1 rounded-full mr-2 mb-2">
                            <Text className="text-purple-700 text-xs font-semibold">
                              Nhóm TH{String(entry.item.practiceGroupNumber).padStart(2, '0')}
                            </Text>
                          </View>
                        )}

                      {surveyId && (
                        <View className="bg-gray-100 px-3 py-1 rounded-full mb-2">
                          <Text className="text-gray-600 text-xs font-semibold">
                            ID KS: {surveyId}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View className="h-px bg-gray-100 mb-3" />

                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm text-gray-500">Trạng thái khảo sát</Text>

                      <View
                        className="px-3 py-1 rounded-full"
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

                    {!!surveyId && (
                      <TouchableOpacity
                        className="mt-3 bg-blue-600 rounded-xl px-4 py-2.5 flex-row items-center justify-center"
                        activeOpacity={0.85}
                        onPress={() => handleOpenSurvey(entry)}
                      >
                        <Ionicons name="document-text-outline" size={16} color="#fff" />
                        <Text className="text-white font-semibold ml-2">
                          {isCompleted ? 'Xem khảo sát' : 'Làm khảo sát'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </View>
          ) : (
            <View className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
              <Text className="text-base font-bold text-gray-900 mb-2">
                Khảo sát chất lượng môn học
              </Text>

              <Text className="text-sm text-gray-500 mb-3">
                Hạn cuối: 25/04/2026
              </Text>

              <View className="h-px bg-gray-100 mb-3" />

              <View className="flex-row justify-between mb-2">
                <Text className="text-sm text-gray-500">Sinh viên đã khảo sát</Text>
                <Text className="text-sm font-bold text-gray-900">32 / 40</Text>
              </View>

              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-gray-500">Đánh giá trung bình</Text>
                <Text className="text-yellow-500 font-bold text-base">⭐ 4.8</Text>
              </View>
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
