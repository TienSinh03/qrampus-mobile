import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Animated,
  RefreshControl,
} from 'react-native';
import useCollapsibleHeader from '../../hooks/useCollapsibleHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { fetchScheduleDetailThunk } from '../../features/student/studentThunks';
import { selectScheduleDetail } from '../../features/student/studentSlice';
import { formatDate } from '../../utils/date.helper';

const { width } = Dimensions.get('window');
const ScheduleDetailScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { animatedHeight, animatedOpacity, animatedTranslateY, handleScroll, handleMomentumScrollBegin } = useCollapsibleHeader(width * 0.25);
  const [refreshing, setRefreshing] = useState(false);

  const { schedule: initialSchedule } = route.params;
  const scheduleDetail = useSelector(selectScheduleDetail);
  const schedule = useMemo(() => {
    if (scheduleDetail?.id === initialSchedule?.id) {
      return scheduleDetail;
    }
    return initialSchedule || {};
  }, [scheduleDetail, initialSchedule]);

  const attendanceStats = useMemo(() => {
    const stats = schedule?.attendanceStats || {};

    const total = Number(stats.total ?? 0);
    const present = Number(stats.present ?? 0);
    const excused = Number(stats.excused ?? 0);
    const absent =
      stats.absent !== undefined && stats.absent !== null
        ? Number(stats.absent)
        : Math.max(total - present - excused, 0);

    return {
      present: Number.isFinite(present) ? present : 0,
      absent: Number.isFinite(absent) ? absent : 0,
      excused: Number.isFinite(excused) ? excused : 0,
      total: Number.isFinite(total) ? total : 0,
    };
  }, [schedule]);

  const [showSurvey, setShowSurvey] = useState(false);
  const [hasCompletedSurvey, setHasCompletedSurvey] = useState(false);

  const {
    id,
    courseName = 'Tên môn học',
    courseCode = 'MH001',
    room = 'A101',
    startHour = '07:00',
    endHour = '09:00',
    teacherName = 'Giảng viên',
    teacherEmail = 'teacher@example.com',
    date,
    dayOfWeek,
    hasQR: hasQRProp = false,
    credits = 3,
    isAttended: isAttendedProp = false,
    isTheory = false,
    isPractice = false,
    sessionStatus = '',
  } = schedule || {};

  // Lắng nghe realtime từ Redux khi GV mở/đóng phiên hoặc SV đã điểm danh
  const realtimeHasQR = useSelector(state => {
    const all = [
      ...(state.student?.schedules || []),
      ...(state.student?.schedulesToday || []),
    ];
    const found = all.find(s => s.id === schedule.id);
    return found ? !!found.hasQR : false;
  });

  const realtimeIsAttended = useSelector(state => {
    const all = [
      ...(state.student?.schedules || []),
      ...(state.student?.schedulesToday || []),
    ];
    const found = all.find(s => s.id === schedule.id);
    return found ? !!found.isAttended : false;
  });

  const hasQR = hasQRProp || realtimeHasQR;
  const isAttended = isAttendedProp || realtimeIsAttended;

  const isPracticeSchedule = isPractice && !isTheory;


  // Load trạng thái khảo sát từ API khi vào trang
  useEffect(() => {
    const fetchSurveyStatus = async () => {
      try {
        // Gọi API để check xem sinh viên đã hoàn thành khảo sát cho buổi học này chưa

        // setHasCompletedSurvey(data.hasCompleted);
        
        // Giả sử buổi học courseCode=IT4788 đã hoàn thành khảo sát
        if (schedule.courseCode === 'IT4788') {
          setHasCompletedSurvey(true);
        }
      } catch (error) {
        console.error('Error fetching survey status:', error);
      }
    };

    fetchSurveyStatus();
  }, [schedule.id]);

  // Kiểm tra xem có nên hiển thị khảo sát không (10 phút trước đến 10 phút sau khi kết thúc)
  useEffect(() => {
    const checkSurveyTime = () => {
      const now = new Date();
      const [endHourNum, endMinute] = endHour.split(':').map(Number);
      
      const classEndTime = new Date();
      classEndTime.setHours(endHourNum, endMinute, 0, 0);
      
      // Thời gian bắt đầu có thể làm khảo sát (10 phút trước khi kết thúc)
      const surveyStartTime = new Date(classEndTime.getTime() - 10 * 60 * 1000);
      // Thời gian kết thúc làm khảo sát (10 phút sau khi kết thúc)
      const surveyEndTime = new Date(classEndTime.getTime() + 10 * 60 * 1000);
      
      // Hiển thị khảo sát nếu:
      // 1. Đang trong khoảng thời gian (10 phút trước đến 10 phút sau khi kết thúc)
      // 2. Chưa hoàn thành khảo sát
      const shouldShow = now >= surveyStartTime && now <= surveyEndTime && !hasCompletedSurvey;
      setShowSurvey(shouldShow);
    };

    checkSurveyTime();
    const interval = setInterval(checkSurveyTime, 30000); // Check mỗi 30 giây
    
    return () => clearInterval(interval);
  }, [endHour, hasCompletedSurvey]);

  const onRefresh = async () => {
    if (!schedule?.id) {
      return;
    }

    setRefreshing(true);
    try {
      await dispatch(fetchScheduleDetailThunk(schedule.id)).unwrap();
    } catch (error) {
      Alert.alert('Không thể làm mới', error || 'Có lỗi xảy ra khi tải chi tiết lịch học');
    } finally {
      setRefreshing(false);
    }
  };

  // xử lý khi nhấn vào nút QR                 
  const handleQRPress = () => {
    console.log('QR pressed:', schedule);
    navigation.navigate('QRScan', {
      scheduleId: schedule.id,
      courseName: schedule.courseName,
      courseCode: schedule.courseCode,
      room: schedule.room,
    });
  };

  // xử lý khi nhấn vào nút xem yêu cầu nghỉ phép
  const handleViewLeaveRequests = () => {
    navigation.navigate('LeaveRequestList', {
      schedule: schedule,
    });
  };

  // xử lý khi nhấn vào nút tạo yêu cầu nghỉ phép
  const handleCreateLeaveRequest = () => {
    navigation.navigate('LeaveRequest', {
      preSelectedSchedule: schedule,
    });
  };

  // xử lý khi nhấn vào nút khảo sát
  const handleSurveyPress = () => {
    navigation.navigate('Survey', {
      schedule: schedule,
      attendanceId: schedule.id, // ID của bản ghi điểm danh
      onSubmitSuccess: () => {
        // Callback khi submit khảo sát thành công
        setHasCompletedSurvey(true);
      },
    });
  };

  // xử lý khi nhấn vào nút xem lại khảo sát
  const handleViewSurvey = () => {
    navigation.navigate('Survey', {
      schedule: schedule,
      attendanceId: schedule.id,
      viewMode: true, // Chế độ xem lại, không cho chỉnh sửa
    });
  };

  const attendanceRateValue = attendanceStats.total > 0 ? (attendanceStats.present / attendanceStats.total) * 100 : 0;
  const attendanceRate = attendanceRateValue.toFixed(1);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      {/* Header */}
      <LinearGradient
        colors={isPracticeSchedule ? ['#059669', '#10b981'] : ['#2563eb', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 py-4"
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">Chi tiết lịch học</Text>
          <View style={{ width: width*0.05 }} />
        </View>

          <Animated.View
            style={{
              height: animatedHeight,
              opacity: animatedOpacity,
              transform: [{ translateY: animatedTranslateY }],
              overflow: 'hidden',
              alignItems: 'center',
            }}
          >
            <View className="bg-white/20 px-4 py-2 rounded-full mt-3 mb-3">
              <Text className="text-white font-bold text-base">{courseCode}</Text>
            </View>
            <Text className="text-white text-2xl font-bold text-center mb-1">
              {courseName}
            </Text>
          </Animated.View>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        onMomentumScrollBegin={handleMomentumScrollBegin}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="px-6 pt-6 pb-4">
          {/** View notification small */}
          {isAttended && (
            <View className=" rounded-xl mb-3 flex-row items-center justify-center">
                <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                <Text className="text-emerald-800 text-sm font-semibold ml-2">
                  Bạn đã điểm danh buổi học này
                </Text>
            </View>
          )}

          <Text className="text-gray-900 font-bold text-lg mb-3">Thao tác nhanh</Text>
          
          {/* QR Scan Button */}
          {hasQR && (
            <TouchableOpacity
              onPress={handleQRPress}
              className={`${isAttended ? 'bg-gray-400' : 'bg-blue-600'} rounded-xl py-4 mb-3 flex-row items-center justify-center`}
              style={{
                shadowColor: '#2563eb',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5,
              }}
              disabled={isAttended}
            >
              <Ionicons name="qr-code" size={24} color="white" />
              <Text className="text-white font-bold text-base ml-2">Quét mã điểm danh</Text>
            </TouchableOpacity>
          )}

          {/* Survey Button - Show when near end time */}
          {showSurvey && !hasCompletedSurvey && (
            <TouchableOpacity
              onPress={handleSurveyPress}
              activeOpacity={0.8}
              className="rounded-2xl overflow-hidden mb-3"
              style={{
                shadowColor: '#f59e0b',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <LinearGradient
                colors={['#f59e0b', '#f97316']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="p-3"
              >
                <View className="flex-row items-center">
                  <View className="w-14 h-14 bg-white/20 rounded-2xl items-center justify-center mr-4">
                    <Ionicons name="star" size={28} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-base mb-1">Đánh giá buổi học</Text>
                    <Text className="text-white/80 text-xs">Chia sẻ ý kiến của bạn về buổi học</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="white" />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {hasCompletedSurvey && (
            <TouchableOpacity
              onPress={handleViewSurvey}
              activeOpacity={0.7}
              className="bg-green-50 rounded-2xl p-3 mb-3 border border-green-200"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }}
            >
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-green-100 rounded-xl items-center justify-center mr-3">
                  <Ionicons name="checkmark-circle" size={28} color="#10b981" />
                </View>
                <View className="flex-1">
                  <Text className="text-green-700 font-bold text-base mb-0.5">Đã hoàn thành khảo sát</Text>
                  <Text className="text-green-600 text-xs">Nhấn để xem lại đánh giá của bạn</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#10b981" />
              </View>
            </TouchableOpacity>
          )}

          {/* Leave Request Actions */}
          <View className="flex-row space-x-3 mb-3">
            <TouchableOpacity
              onPress={handleCreateLeaveRequest}
              className="flex-1 bg-white rounded-xl py-4 flex-row items-center justify-center border-2 border-blue-500"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              <Ionicons name="add-circle" size={20} color="#2563eb" />
              <Text className="text-blue-600 font-semibold text-sm ml-2">Xin nghỉ phép</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleViewLeaveRequests}
              className="flex-1 bg-white rounded-xl py-4 flex-row items-center justify-center border border-gray-300"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 2,
              }}
            >
              <Ionicons name="document-text-outline" size={20} color="#6b7280" />
              <Text className="text-gray-700 font-semibold text-sm text-center ml-2 w-24">Xem yêu cầu nghỉ phép</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Schedule Information */}
        <View className="px-6 pb-4">
          <Text className="text-gray-900 font-bold text-lg mb-3">Thông tin lịch học</Text>
          
          <View className="bg-white rounded-2xl p-4" style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            {/* Date & Time */}
            <View className="flex-row items-center mb-4 pb-4 border-b border-gray-100">
              <View className="w-12 h-12 bg-blue-50 rounded-xl items-center justify-center mr-3">
                <Ionicons name="calendar" size={24} color="#2563eb" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-xs mb-1">Thời gian</Text>
                <Text className="text-gray-900 font-bold text-base">
                  {dayOfWeek}, {formatDate(date || schedule?.classDate)}
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
                <Text className="text-gray-900 font-bold text-base">{room}</Text>
              </View>
            </View>

            {/* Teacher */}
            <View className="flex-row items-center mb-4 pb-4 border-b border-gray-100">
              <View className="w-12 h-12 bg-purple-50 rounded-xl items-center justify-center mr-3">
                <Ionicons name="person" size={24} color="#8b5cf6" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-500 text-xs mb-1">Giảng viên</Text>
                <Text className="text-gray-900 font-bold text-base">{teacherName}</Text>
                {teacherEmail && (
                  <Text className="text-gray-600 text-sm">{teacherEmail}</Text>
                )}
              </View>
            </View>

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
        <View className="px-6 pb-6">
          <Text className="text-gray-900 font-bold text-lg mb-3">Thống kê điểm danh</Text>
          
          <View className="bg-white rounded-2xl p-4" style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}>
            {/* Attendance Rate Circle */}
            <View className="items-center mb-4">
              <View className="w-32 h-32 rounded-full bg-blue-50 items-center justify-center mb-2"
                style={{
                  borderWidth: 8,
                  borderColor: attendanceRateValue >= 80 ? '#10b981' : attendanceRateValue >= 50 ? '#f59e0b' : '#ef4444',
                }}
              >
                <Text className={`text-3xl font-bold ${
                  attendanceRateValue >= 80 ? 'text-green-600' : attendanceRateValue >= 50 ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {attendanceRate}%
                </Text>
                <Text className="text-gray-500 text-xs">Tỷ lệ tham gia</Text>
              </View>
            </View>

            {/* Stats Grid */}
            <View className="flex-row flex-wrap">
              <View className="w-1/2 p-2">
                <View className="bg-green-50 rounded-xl p-3 items-center">
                  <Ionicons name="checkmark-circle" size={32} color="#10b981" />
                  <Text className="text-green-700 text-2xl font-bold mt-1">
                    {attendanceStats.present}
                  </Text>
                  <Text className="text-gray-600 text-xs">Có mặt</Text>
                </View>
              </View>
              
              <View className="w-1/2 p-2">
                <View className="bg-red-50 rounded-xl p-3 items-center">
                  <Ionicons name="close-circle" size={32} color="#ef4444" />
                  <Text className="text-red-700 text-2xl font-bold mt-1">
                    {attendanceStats.absent}
                  </Text>
                  <Text className="text-gray-600 text-xs">Vắng</Text>
                </View>
              </View>
              
              <View className="w-1/2 p-2">
                <View className="bg-blue-50 rounded-xl p-3 items-center">
                  <Ionicons name="document-text" size={32} color="#3b82f6" />
                  <Text className="text-blue-700 text-2xl font-bold mt-1">
                    {attendanceStats.excused}
                  </Text>
                  <Text className="text-gray-600 text-xs">Vắng có phép</Text>
                </View>
              </View>
              
              <View className="w-1/2 p-2">
                <View className="bg-gray-50 rounded-xl p-3 items-center">
                  <Ionicons name="calendar-outline" size={32} color="#6b7280" />
                  <Text className="text-gray-700 text-2xl font-bold mt-1">
                    {attendanceStats.total}
                  </Text>
                  <Text className="text-gray-600 text-xs">Tổng buổi</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Warning*/}
        {attendanceRateValue < 80 && (
          <View className="px-6 pb-6">
            <View className="bg-orange-50 rounded-xl p-4 flex-row items-start border-l-4 border-orange-500">
              <Ionicons name="warning" size={24} color="#f59e0b" className="mr-3" />
              <View className="flex-1 ml-3">
                <Text className="text-orange-900 font-bold mb-1">Cảnh báo điểm danh</Text>
                <Text className="text-orange-700 text-sm">
                  Tỷ lệ điểm danh của bạn đang thấp hơn 80%. Vui lòng tham gia đầy đủ các buổi học để đảm bảo đủ điều kiện dự thi.
                </Text>
              </View>
            </View>
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default ScheduleDetailScreen;
