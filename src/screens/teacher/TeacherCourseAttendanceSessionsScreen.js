import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectCourseSessionsList,
  selectCourseSessionsSummary,
  selectCourseSessionsPagination,
  selectCourseSessionsLoading,
  selectCourseSessionsLoadingMore,
} from '../../features/teacher/teacherSlice';
import { getTeacherCourseSessionsThunk } from '../../features/teacher/teacherThunks';

const PAGE_SIZE = 10;

const STATUS_CONFIG = {
  on_time: {
    label: "Đúng giờ",
    bg: "bg-green-100",
    text: "text-green-700",
    icon: "checkmark-circle",
  },

  late: {
    label: "Đi trễ",
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    icon: "time",
  },

  absent: {
    label: "Vắng mặt",
    bg: "bg-red-100",
    text: "text-red-700",
    icon: "close-circle",
  },

  manual_override: {
    label: "Thủ công",
    bg: "bg-blue-100",
    text: "text-blue-700",
    icon: "create-outline",
  },
};

const DAY_LABELS = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return `${DAY_LABELS[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const formatTime = (val) => {
  if (!val) return null;
  const d = new Date(val);
  if (isNaN(d.getTime())) return null;
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const formatHour = (s) => (s ? s.slice(0, 5) : '—');

const SessionCard = ({ item }) => {
  const statusCfg = STATUS_CONFIG[item.lecturerAttendanceStatus];
  const qrTime = formatTime(item.qrCreatedAt);

  return (
    <View
      className="bg-white rounded-2xl mb-3 p-4"
      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 3, elevation: 2 }}
    >
      {/* Top row: date + status badge */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center gap-2">
          <View className="bg-sky-50 rounded-lg px-2.5 py-1">
            <Text className="text-sky-700 text-sm font-bold">{formatDate(item.classDate)}</Text>
          </View>
          {item.practiceGroupName && (
            <View className="bg-purple-100 rounded-full px-2 py-0.5">
              <Text className="text-purple-700 text-xs">{item.practiceGroupName}</Text>
            </View>
          )}
        </View>

        {statusCfg ? (
          <View className={`flex-row items-center px-2.5 py-0.5 rounded-full gap-1 ${statusCfg.bg}`}>
            <Text className={`text-xs font-semibold ${statusCfg.text}`}>{statusCfg.label}</Text>
          </View>
        ) : (
          <View className="bg-gray-100 px-2.5 py-0.5 rounded-full">
            <Text className="text-gray-500 text-xs">Chưa tạo QR</Text>
          </View>
        )}
      </View>

      {/* Info row */}
      <View className="flex-row flex-wrap gap-x-4 gap-y-1 mt-1">
        <View className="flex-row items-center gap-1">
          <Ionicons name="time-outline" size={13} color="#6b7280" />
          <Text className="text-gray-500 text-xs">
            {formatHour(item.startHour)} – {formatHour(item.endHour)}
          </Text>
        </View>
        {(item.roomCode || item.roomName) && (
          <View className="flex-row items-center gap-1">
            <Ionicons name="location-outline" size={13} color="#6b7280" />
            <Text className="text-gray-500 text-xs">{item.roomCode || item.roomName}</Text>
          </View>
        )}
        <View className="flex-row items-center gap-1">
          <Ionicons name="qr-code-outline" size={13} color="#6b7280" />
          <Text className="text-gray-500 text-xs">
            {qrTime ? `Tạo lúc ${qrTime}` : 'Chưa tạo'}
          </Text>
        </View>
      </View>

      {/* Late notice */}
      {item.lecturerAttendanceStatus === 'late' && item.lateMinutes > 0 && (
        <View className="mt-2 flex-row items-center gap-1">
          <Ionicons name="alert-circle-outline" size={13} color="#ca8a04" />
          <Text className="text-yellow-700 text-xs">Trễ {item.lateMinutes} phút</Text>
        </View>
      )}
    </View>
  );
};

const TeacherCourseAttendanceSessionsScreen = ({ navigation, route }) => {

  const { courseId, courseName, courseCode, practiceGroupId, semester } = route.params || {};

  const dispatch = useDispatch();

  const sessions = useSelector(selectCourseSessionsList);
  const summary = useSelector(selectCourseSessionsSummary);
  const pagination = useSelector(selectCourseSessionsPagination);
  const isLoading = useSelector(selectCourseSessionsLoading);
  const loadingMore = useSelector(selectCourseSessionsLoadingMore);

  const [refreshing, setRefreshing] = useState(false);
  const currentPage = useRef(1);

  const fetchPage = useCallback((page = 1) => {
    currentPage.current = page;

    dispatch(getTeacherCourseSessionsThunk({ courseId, semester, practiceGroupId, page, pageSize: PAGE_SIZE }));
  }, [dispatch, courseId, semester, practiceGroupId]);

  useEffect(() => { fetchPage(1); }, []);

  const onRefresh = async () => {
    setRefreshing(true);

    await dispatch(getTeacherCourseSessionsThunk({ courseId, semester, practiceGroupId, page: 1, pageSize: PAGE_SIZE })).unwrap().catch(() => {});
   
    currentPage.current = 1;
    setRefreshing(false);
  };

  const onEndReached = useCallback(() => {
    if (loadingMore || !pagination) return;
    if (pagination.page >= pagination.totalPages) return;

    fetchPage(pagination.page + 1);

  }, [loadingMore, pagination, fetchPage]);

  const hasMore = pagination ? pagination.page < pagination.totalPages : false;

  const ListFooter = loadingMore ? (
    <View className="items-center py-4">
      <ActivityIndicator size="small" color="#0171a5" />
    </View>
  ) : <View className="h-6" />;

  const ListEmpty = !isLoading ? (
    <View className="bg-white rounded-2xl p-8 items-center mt-4">
      <Ionicons name="calendar-outline" size={48} color="#d1d5db" />
      <Text className="text-gray-700 font-bold text-base mt-3">Chưa có buổi học</Text>
      <Text className="text-gray-400 text-sm text-center mt-1">Không tìm thấy buổi học nào</Text>
    </View>
  ) : null;

  const summaryData = summary || {};

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient
        colors={['#0171a5', '#30b2ea']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-5 pt-4 pb-5"
      >
        <View className="flex-row items-center mb-3">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-1">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-1">

            <Text className="text-white text-base font-bold" numberOfLines={1}>
              {courseName || 'Chi tiết chấm công'}
            </Text>

            <Text className="text-white/70 text-xs">
              {courseCode}{semester ? ` · ${semester}` : ''}
            </Text>
          </View>
        </View>

        {/* Summary stats */}
        <View className="flex-row gap-2">
          <View className="flex-1 bg-white/15 rounded-xl p-3 items-center">
            <Text className="text-white text-lg font-bold">{summaryData.totalTeachingSessions ?? '—'}</Text>
            <Text className="text-white/75 text-xs">Tổng buổi</Text>
          </View>

          <View className="flex-1 bg-white/15 rounded-xl p-3 items-center">
            <Text className="text-white text-lg font-bold">
              {summaryData.onTimeCheckins != null
                ? summaryData.onTimeCheckins + (summaryData.lateCheckins ?? 0)
                : '—'}
            </Text>
            <Text className="text-white/75 text-xs">Đã chấm</Text>
          </View>

          <View className="flex-1 bg-white/15 rounded-xl p-3 items-center">
            <Text className="text-white text-lg font-bold">{summaryData.absentCheckins ?? '—'}</Text>
            <Text className="text-white/75 text-xs">Vắng mặt</Text>
          </View>
          
          <View className="flex-1 bg-white/15 rounded-xl p-3 items-center">
            <Text className="text-white text-lg font-bold">
              {summaryData.attendanceRate != null ? `${Math.round(summaryData.attendanceRate)}%` : '—'}
            </Text>
            <Text className="text-white/75 text-xs">Tỷ lệ</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Full-screen loading on first page */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0171a5" />
          <Text className="text-gray-400 text-sm mt-3">Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id || item.classSessionId}
          renderItem={({ item }) => <SessionCard item={item} />}
          ListEmptyComponent={ListEmpty}
          ListFooterComponent={ListFooter}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
          showsVerticalScrollIndicator={false}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          onRefresh={onRefresh}
          refreshing={refreshing}
        />
      )}
    </SafeAreaView>
  );
};

export default TeacherCourseAttendanceSessionsScreen;
