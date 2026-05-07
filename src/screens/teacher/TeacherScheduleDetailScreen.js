import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SvgUri } from 'react-native-svg';
import AttendanceStatistics from '../../components/statistics/AttendanceStatistics';
import SurveyStatistics from '../../components/statistics/SurveyStatistics';
import { useDispatch, useSelector } from 'react-redux';
import { getStudentsByClassSessionThunk, getTeacherClassSessionOverviewThunk } from '../../features/classSession/classSessionThunks';
import {
  clearStudents,
  selectStudents,
  selectTotalStudents,
  selectPracticeGroupBreakdown,
  selectApiPracticeGroup,
  selectStudentsLoading,
  selectClassSessionOverview,
  selectClassSessionOverviewLoading,
} from '../../features/classSession/classSessionSlice';

const { width } = Dimensions.get('window');
const audiobookSvgUri = Image.resolveAssetSource(
  require('../../../assets/undraw_audiobook.svg')
).uri;

const TeacherScheduleDetailScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { schedule } = route.params;
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isInActiveWindow, setIsInActiveWindow] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const studentCount = useSelector(selectTotalStudents);
  const classSessionOverview = useSelector(selectClassSessionOverview);
  const classSessionOverviewLoading = useSelector(selectClassSessionOverviewLoading);

  const [refreshing, setRefreshing] = useState(false);

  const {
    id,
    courseName = 'Tên môn học',
    courseCode = 'MH001',
    roomName = 'A101',
    startHour = '07:00',
    endHour = '09:00',
    hasActiveSession = false,
    classDate,
    dayOfWeek,
    credits = 3,
    practiceGroup = null,
    isTheory = false,
    isPractice = false,
  } = schedule || {};
  
  const isPracticeSchedule = isPractice && !isTheory;

  useEffect(() => {
    dispatch(getStudentsByClassSessionThunk(schedule.id));
    dispatch(getTeacherClassSessionOverviewThunk(schedule.id));
    return () => { dispatch(clearStudents()); };
  }, []);

  const handleRefresh = useCallback((callback) => {
    setRefreshing(true);
    Promise.all([
      dispatch(getStudentsByClassSessionThunk(schedule.id)),
      dispatch(getTeacherClassSessionOverviewThunk(schedule.id)),
    ]).finally(() => {
      setRefreshing(false);
      if (callback) callback();
    });
  }, [dispatch, schedule.id]);

  const attendanceStats = useMemo(() => {
    const newStats = {
      present: classSessionOverview?.attendanceOverview?.latestSession?.attendedCount || 0,
      absent: classSessionOverview?.attendanceOverview?.latestSession?.absentCount || 0,
      excused: classSessionOverview?.leaveEvidence?.approved || 0,
      total: studentCount,
    };
    return newStats;
  }, [classSessionOverview, studentCount]);

  // Thống kê khảo sát (sẽ lấy từ API dựa vào schedule.id)
  const [surveyStats, setSurveyStats] = useState({
    totalResponses: 35, // Số sinh viên đã đánh giá
    totalStudents: 38, // Tổng số sinh viên có mặt
    questions: [
      {
        id: 1,
        question: 'Nội dung bài giảng có rõ ràng và dễ hiểu không?',
        type: 'rating',
        averageRating: 4.6,
        ratings: { 1: 0, 2: 1, 3: 3, 4: 10, 5: 21 },
      },
      {
        id: 2,
        question: 'Giảng viên có nhiệt tình và tận tâm không?',
        type: 'rating',
        averageRating: 4.8,
        ratings: { 1: 0, 2: 0, 3: 2, 4: 5, 5: 28 },
      },
      {
        id: 3,
        question: 'Tài liệu học tập có đầy đủ và phù hợp không?',
        type: 'rating',
        averageRating: 4.4,
        ratings: { 1: 0, 2: 2, 3: 4, 4: 15, 5: 14 },
      },
      {
        id: 4,
        question: 'Thời gian bài giảng có phù hợp không?',
        type: 'rating',
        averageRating: 4.2,
        ratings: { 1: 1, 2: 2, 3: 5, 4: 17, 5: 10 },
      },
    ],
    feedbacks: [
      'Giảng viên rất nhiệt tình và bài giảng dễ hiểu. Hy vọng có thêm nhiều bài tập thực hành.',
      'Nội dung bài học rất hay, giảng viên giảng rất chi tiết.',
      'Cần thêm nhiều ví dụ thực tế hơn.',
      'Bài giảng tốt, tài liệu đầy đủ.',
    ],
  });

  useEffect(() => {
    //  Gọi API để lấy thống kê khảo sát cho buổi học này
    // const fetchSurveyStats = async () => {
    //   const response = await fetch(`/api/survey/stats/${schedule.id}`);
    //   const data = await response.json();
    //   setSurveyStats(data);
    // };
    // fetchSurveyStats();
  }, [schedule.id]);

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

  const handleCreateQR = () => {
    navigation.navigate('CreateQRSession', { schedule });
  };

  const handleViewStudentList = () => {
    navigation.navigate('StudentList', { schedule });
  };

  const handleViewSessionList = () => {
    navigation.navigate('SessionList', { schedule });
  };

  const handleViewLeaveRequests = () => {
    navigation.navigate('TeacherLeaveRequestList', { schedule });
  };

  const getStatusBadge = () => {
    if (timeRemaining === 'Đã kết thúc') {
      return { label: 'Đã kết thúc', bgColor: 'bg-red-500', textColor: 'text-white' };
    }

    if (timeRemaining === 'Đang diễn ra' || hasActiveSession) {
      return { label: 'Đang diễn ra', bgColor: 'bg-green-500', textColor: 'text-white' };
    }

    return { label: 'Sắp bắt đầu', bgColor: 'bg-amber-500', textColor: 'text-white' };
  };

  const statusBadge = getStatusBadge();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      {/* Header */}
      <LinearGradient
        colors={isUrgent && !hasActiveSession ? ['#dc2626', '#ef4444'] : isPracticeSchedule ? ['#0891b2', '#06b6d4'] : ['#0171a5', '#30b2ea']}
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

        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">Chi tiết lịch giảng dạy</Text>
          <View style={{ width: 20 }} />
        </View>

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
                {practiceGroup?.group_name ? `Nhóm ${practiceGroup.group_name}` : `${dayOfWeek || 'Lý thuyết'} ${classDate ? `• ${classDate}` : ''}`}
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
            <View className="px-3 py-1 ml-3 justify-center items-center">
              <Text className="text-white/70 text-xs">
                Trạng thái
              </Text>

              <View className={`${statusBadge.bgColor} px-2 py-0.5 rounded-full mt-1 self-start`}>
                <Text className={`${statusBadge.textColor} text-xs font-semibold`}>
                  {statusBadge.label}
                </Text>
              </View>
            </View>

            <View className="w-px h-8 bg-white/20" />

            <View>
              <Text className="text-white/70 text-xs">
                Loại
              </Text>
              <Text className="text-white font-semibold text-sm mt-1">
                {isPracticeSchedule ? 'Thực hành' : 'Lý thuyết'}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false} 
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Quick Status Card */}
        {timeRemaining && (
          <View className="px-6 pt-6 pb-2">
            <View className="bg-white rounded-2xl p-4 flex-row items-center" style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 2,
            }}>
              <View className={`w-14 h-14 rounded-2xl items-center justify-center mr-4 ${
                timeRemaining === 'Đang diễn ra' ? 'bg-green-100' : 
                timeRemaining === 'Đã kết thúc' ? 'bg-gray-100' : 'bg-sky-100'
              }`}>
                <Ionicons 
                  name={timeRemaining === 'Đang diễn ra' ? 'time' : timeRemaining === 'Đã kết thúc' ? 'checkmark-done' : 'alarm'} 
                  size={28} 
                  color={timeRemaining === 'Đang diễn ra' ? '#10b981' : timeRemaining === 'Đã kết thúc' ? '#6b7280' : '#0171a5'} 
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-xs mb-1">Trạng thái lớp học</Text>
                <Text className={`text-lg font-bold ${
                  timeRemaining === 'Đang diễn ra' ? 'text-green-600' : 
                  timeRemaining === 'Đã kết thúc' ? 'text-gray-600' : 'text-sky-600'
                }`}>
                  {timeRemaining}
                </Text>
              </View>
            </View>
          </View>
        )}

        <View className="px-6 pt-4 pb-4">
          <Text className="text-gray-900 font-bold text-lg mb-4">Điểm danh</Text>
          
          {/* Create QR or Active Session */}
          {isInActiveWindow && !hasActiveSession && (
            <TouchableOpacity
              onPress={handleCreateQR}
              activeOpacity={0.8}
              className="rounded-2xl overflow-hidden mb-4"
              style={{
                shadowColor: isUrgent ? '#dc2626' : '#0171a5',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <LinearGradient
                colors={isUrgent ? ['#dc2626', '#ef4444'] : ['#0171a5', '#30b2ea']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="p-5"
              >
                <View className="flex-row items-center">
                  <View className="w-14 h-14 bg-white/20 rounded-2xl items-center justify-center mr-4">
                    <Ionicons name="qr-code" size={28} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-lg mb-1">
                      {isUrgent ? 'Tạo QR điểm danh ngay!' : 'Tạo QR điểm danh'}
                    </Text>
                    <Text className="text-white/80 text-sm">
                      {isUrgent ? 'Lớp học đã bắt đầu' : 'Tạo phiên điểm danh mới'}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="white" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {isInActiveWindow && hasActiveSession && (
            <View 
              className="rounded-2xl overflow-hidden mb-4"
              style={{
                shadowColor: '#10b981',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              <LinearGradient
                colors={['#10b981', '#34d399']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="p-5"
              >
                <View className="flex-row items-center">
                  <View className="w-14 h-14 bg-white/20 rounded-2xl items-center justify-center mr-4">
                    <View className="w-4 h-4 bg-white rounded-full" style={{
                      shadowColor: '#fff',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.8,
                      shadowRadius: 8,
                    }} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-lg mb-1">
                      Phiên đang hoạt động
                    </Text>
                    <Text className="text-white/80 text-sm">
                      Sinh viên đang điểm danh
                    </Text>
                  </View>
                  <Ionicons name="checkmark-circle" size={32} color="white" />
                </View>
              </LinearGradient>
            </View>
          )}

          {!isInActiveWindow && (
            <View 
              className="bg-gray-100 rounded-2xl p-5 mb-4 flex-row items-center"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <View className="w-14 h-14 bg-gray-200 rounded-2xl items-center justify-center mr-4">
                <Ionicons name="lock-closed" size={24} color="#9ca3af" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-700 font-bold text-base mb-1">
                  {timeRemaining === 'Đã kết thúc' ? 'Đã kết thúc' : 'Chưa đến giờ'}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {timeRemaining === 'Đã kết thúc' ? 'Buổi học đã hoàn thành' : 'Chưa thể tạo phiên điểm danh'}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Quick Actions Dashboard */}
        <View className="px-6 pb-4">
          <Text className="text-gray-900 font-bold text-lg mb-4">Quản lý</Text>
          
          <View className="flex-row mb-3" style={{ gap: 12 }}>
            {/* Student List */}
            <TouchableOpacity
              onPress={handleViewStudentList}
              activeOpacity={0.7}
              className="flex-1 bg-white rounded-2xl overflow-hidden"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View className="p-4">
                <View className="w-12 h-12 bg-sky-50 rounded-xl items-center justify-center mb-3">
                  <Ionicons name="people" size={24} color="#0171a5" />
                </View>
                <Text className="text-gray-900 font-bold text-base mb-1">
                  Sinh viên
                </Text>
                <Text className="text-gray-500 text-xs mb-2">
                  {studentCount} sinh viên
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-blue-600 text-xs font-semibold">Xem danh sách</Text>
                  <Ionicons name="chevron-forward" size={14} color="#0171a5" style={{ marginLeft: 2 }} />
                </View>
              </View>
            </TouchableOpacity>

            {/* Session List */}
            <TouchableOpacity
              onPress={handleViewSessionList}
              activeOpacity={0.7}
              className="flex-1 bg-white rounded-2xl overflow-hidden"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View className="p-4">
                <View className="w-12 h-12 bg-blue-50 rounded-xl items-center justify-center mb-3">
                  <Ionicons name="list" size={24} color="#3b82f6" />
                </View>
                <Text className="text-gray-900 font-bold text-base mb-1">
                  Phiên
                </Text>
                <Text className="text-gray-500 text-xs mb-2">
                  Lịch sử điểm danh
                </Text>
                <View className="flex-row items-center">
                  <Text className="text-blue-600 text-xs font-semibold">Xem chi tiết</Text>
                  <Ionicons name="chevron-forward" size={14} color="#3b82f6" style={{ marginLeft: 2 }} />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* AI Photo Attendance */}
          <TouchableOpacity
            onPress={() => navigation.navigate('ImageSessionList', { schedule })}
            activeOpacity={0.7}
            className="bg-white rounded-2xl overflow-hidden mb-3"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View className="flex-row items-center p-4">
              <View className="w-12 h-12 bg-indigo-50 rounded-xl items-center justify-center mr-4">
                <Ionicons name="camera" size={24} color="#6366f1" />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Text className="text-gray-900 font-bold text-base mr-2">Phiên hình điểm danh </Text>
                </View>
                <Text className="text-gray-500 text-xs">Chụp ảnh lớp học, AI tự động đếm sinh viên</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#9ca3af" />
            </View>
          </TouchableOpacity>

          {/* Leave Requests */}
          <TouchableOpacity
            onPress={handleViewLeaveRequests}
            activeOpacity={0.7}
            className="bg-white rounded-2xl overflow-hidden"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <View className="flex-row items-center p-4">
              <View className="w-12 h-12 bg-orange-50 rounded-xl items-center justify-center mr-4">
                <Ionicons name="document-text" size={24} color="#f59e0b" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-bold text-base mb-1">
                  Yêu cầu nghỉ phép
                </Text>
                <Text className="text-gray-500 text-xs">
                  Xem và phê duyệt đơn xin nghỉ
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#9ca3af" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Schedule Information */}
        <View className="px-6 pb-4">
          <Text className="text-gray-900 font-bold text-lg mb-3">Thông tin lịch giảng dạy</Text>
          
          <View className="bg-white rounded-2xl p-4" style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            {/* Date & Time */}
            <View className="flex-row items-center mb-4 pb-4 border-b border-gray-100">
              <View className="w-12 h-12 bg-sky-50 rounded-xl items-center justify-center mr-3">
                <Ionicons name="calendar" size={24} color="#0171a5" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-xs mb-1">Thời gian</Text>
                <Text className="text-gray-900 font-bold text-base">
                  {dayOfWeek}, {classDate}
                </Text>
                <Text className="text-gray-600 text-sm">
                  {startHour} - {endHour}
                </Text>
              </View>
            </View>

            {/* Room */}
            <View className="flex-row items-center mb-4 pb-4 border-b border-gray-100">
              <View className="w-12 h-12 bg-green-50 rounded-xl items-center justify-center mr-3">
                <Ionicons name="location" size={24} color="#10b981" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-xs mb-1">Phòng học</Text>
                <Text className="text-gray-900 font-bold text-base">{roomName}</Text>
              </View>
            </View>

            {/* Student Count */}
            <View className="flex-row items-center mb-4 pb-4 border-b border-gray-100">
              <View className="w-12 h-12 bg-blue-50 rounded-xl items-center justify-center mr-3">
                <Ionicons name="people" size={24} color="#3b82f6" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-xs mb-1">Số lượng sinh viên</Text>
                <Text className="text-gray-900 font-bold text-base">{studentCount} sinh viên</Text>
              </View>
            </View>

            {/* Credits */}
            <View className="flex-row items-center">
              <View className="w-12 h-12 bg-orange-50 rounded-xl items-center justify-center mr-3">
                <Ionicons name="bookmark" size={24} color="#f59e0b" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-xs mb-1">Số tín chỉ</Text>
                <Text className="text-gray-900 font-bold text-base">{credits} tín chỉ</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Attendance Statistics */}
        <AttendanceStatistics 
          attendanceStats={attendanceStats}
          studentCount={studentCount}
        />

        {/* Survey Statistics */}
        <SurveyStatistics surveyStats={surveyStats} />

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default TeacherScheduleDetailScreen;
