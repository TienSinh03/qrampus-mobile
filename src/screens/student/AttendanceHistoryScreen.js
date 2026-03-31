import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Modal,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { getAttendanceHistoryThunk } from '../../features/student/attendanceHistoryThunks';
import {
  selectAttendanceRecords,
  selectAttendanceSummary,
  selectAttendanceFilters,
  selectAttendancePagination,
  selectAvailableSemesters,
  selectAttendanceHistoryLoading,
  selectAttendanceHistoryRefreshing,
  selectAttendanceHistoryLoadingMore,
  selectAttendanceHistoryError,
  clearAttendanceFilters,
} from '../../features/student/attendanceHistorySlice';
import { STATUS_CONFIG, STATUS_FILTER_OPTIONS, ATTENDANCE_STATUS  } from '../../constants/attendance.history.constant';

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const formatTime = (timeString) => {
  if (!timeString) return '';
  return timeString.slice(0, 5);
};

const formatScanTime = (scanTime) => {
  if (!scanTime) return '';
  const date = new Date(scanTime);
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Components
const SummaryCard = ({ summary }) => {
  const { totalSessions, presentCount, absentCount, excusedCount, attendanceRate } = summary;

  return (
    <View className="mx-4 mb-4">
      <LinearGradient
        colors={['#3b82f6', '#1d4ed8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-2xl p-4"
      >
        {/* Attendance Rate */}
        <View className="items-center mb-4">
          <Text className="text-white/80 text-sm mb-1">Tỷ lệ điểm danh</Text>
          <Text className="text-white text-4xl font-bold">{attendanceRate}%</Text>
        </View>

        {/* Stats Row */}
        <View className="flex-row justify-between">
          <View className="items-center flex-1">
            <View className="bg-white/20 rounded-full w-10 h-10 items-center justify-center mb-1">
              <Text className="text-white font-bold">{totalSessions}</Text>
            </View>
            <Text className="text-white/80 text-xs">Tổng buổi</Text>
          </View>

          <View className="items-center flex-1">
            <View className="bg-emerald-400/30 rounded-full w-10 h-10 items-center justify-center mb-1">
              <Text className="text-emerald-300 font-bold">{presentCount}</Text>
            </View>
            <Text className="text-white/80 text-xs">Có mặt</Text>
          </View>

          <View className="items-center flex-1">
            <View className="bg-red-400/30 rounded-full w-10 h-10 items-center justify-center mb-1">
              <Text className="text-red-300 font-bold">{absentCount}</Text>
            </View>
            <Text className="text-white/80 text-xs">Vắng</Text>
          </View>

          <View className="items-center flex-1">
            <View className="bg-amber-400/30 rounded-full w-10 h-10 items-center justify-center mb-1">
              <Text className="text-amber-300 font-bold">{excusedCount}</Text>
            </View>
            <Text className="text-white/80 text-xs">Có phép</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const FilterChip = ({ label, isSelected, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className={`px-4 py-2 rounded-full mr-2 ${
      isSelected ? 'bg-blue-600' : 'bg-gray-100'
    }`}
  >
    <Text className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-700'}`}>
      {label}
    </Text>
  </TouchableOpacity>
);

const AttendanceRecordItem = ({ record, onPress }) => {
  const statusConfig = STATUS_CONFIG[record.attendanceStatus] || STATUS_CONFIG[ATTENDANCE_STATUS.NOT_YET];

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white mx-4 mb-3 rounded-xl overflow-hidden shadow-sm border border-gray-100"
      activeOpacity={0.7}
    >
      {/* Header with date and status */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-50">
        <View className="flex-row items-center">
          <View className="bg-blue-50 rounded-lg p-2 mr-3">
            <Ionicons name="calendar-outline" size={18} color="#3b82f6" />
          </View>
          <View>
            <Text className="text-gray-900 font-semibold text-sm">
              {formatDate(record.classDate)}
            </Text>
            <Text className="text-gray-500 text-xs">
              {formatTime(record.startHour)} - {formatTime(record.endHour)}
            </Text>
          </View>
        </View>

        {/* Status badge */}
        <View
          className="flex-row items-center px-3 py-1.5 rounded-full"
          style={{ backgroundColor: statusConfig.bgColor }}
        >
          <Ionicons name={statusConfig.icon} size={14} color={statusConfig.color} />
          <Text className="ml-1 text-xs font-medium" style={{ color: statusConfig.color }}>
            {statusConfig.label}
          </Text>
        </View>
      </View>

      {/* Course info */}
      <View className="px-4 py-3">
        <Text className="text-gray-900 font-semibold text-base mb-1" numberOfLines={1}>
          {record.courseName}
        </Text>
        <View className="flex-row items-center flex-wrap">
          <View className="flex-row items-center mr-4 mb-1">
            <Ionicons name="code-outline" size={14} color="#6b7280" />
            <Text className="text-gray-500 text-xs ml-1">{record.courseCode}</Text>
          </View>
          {record.roomCode && (
            <View className="flex-row items-center mr-4 mb-1">
              <Ionicons name="location-outline" size={14} color="#6b7280" />
              <Text className="text-gray-500 text-xs ml-1">{record.roomCode}</Text>
            </View>
          )}
          {record.scheduleType === 'practice' && record.practiceGroup && (
            <View className="flex-row items-center mb-1">
              <Ionicons name="people-outline" size={14} color="#6b7280" />
              <Text className="text-gray-500 text-xs ml-1">
                Nhóm {record.practiceGroup.numberGroup}
              </Text>
            </View>
          )}
        </View>

        {/* Scan time for present */}
        {record.attendanceStatus === ATTENDANCE_STATUS.PRESENT && record.scanTime && (
          <View className="flex-row items-center mt-2 bg-emerald-50 px-3 py-1.5 rounded-lg self-start">
            <Ionicons name="time-outline" size={14} color="#10b981" />
            <Text className="text-emerald-700 text-xs ml-1.5">
              Điểm danh lúc {formatScanTime(record.scanTime)}
            </Text>
          </View>
        )}

        {/* Leave request info for excused */}
        {record.attendanceStatus === ATTENDANCE_STATUS.EXCUSED && record.leaveRequest && (
          <View className="flex-row items-center mt-2 bg-amber-50 px-3 py-1.5 rounded-lg self-start">
            <Ionicons name="document-text-outline" size={14} color="#f59e0b" />
            <Text className="text-amber-700 text-xs ml-1.5">
              Đơn xin phép đã duyệt
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const FilterModal = ({
  visible,
  onClose,
  semesters,
  selectedSemester,
  onSelectSemester,
  selectedStatus,
  onSelectStatus,
  onApply,
  onReset,
}) => {
  const [tempSemester, setTempSemester] = useState(selectedSemester);
  const [tempStatus, setTempStatus] = useState(selectedStatus);

  useEffect(() => {
    setTempSemester(selectedSemester);
    setTempStatus(selectedStatus);
  }, [selectedSemester, selectedStatus, visible]);

  const handleApply = () => {
    onSelectSemester(tempSemester);
    onSelectStatus(tempStatus);
    onApply(tempSemester, tempStatus);
    onClose();
  };

  const handleReset = () => {
    setTempSemester(null);
    setTempStatus(null);
    onReset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl">
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
            <Text className="text-lg font-bold text-gray-900">Bộ lọc</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView className="px-5 py-4" style={{ maxHeight: 400 }}>
            {/* Semester filter */}
            <View className="mb-6">
              <Text className="text-gray-700 font-semibold mb-3">Học kỳ</Text>
              <View className="flex-row flex-wrap">
                <TouchableOpacity
                  onPress={() => setTempSemester(null)}
                  className={`px-4 py-2 rounded-full mr-2 mb-2 ${
                    !tempSemester ? 'bg-blue-600' : 'bg-gray-100'
                  }`}
                >
                  <Text className={`text-sm ${!tempSemester ? 'text-white' : 'text-gray-700'}`}>
                    Tất cả
                  </Text>
                </TouchableOpacity>
                {semesters.map((sem) => (
                  <TouchableOpacity
                    key={sem}
                    onPress={() => setTempSemester(sem)}
                    className={`px-4 py-2 rounded-full mr-2 mb-2 ${
                      tempSemester === sem ? 'bg-blue-600' : 'bg-gray-100'
                    }`}
                  >
                    <Text className={`text-sm ${tempSemester === sem ? 'text-white' : 'text-gray-700'}`}>
                      {sem}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Status filter */}
            <View className="mb-6">
              <Text className="text-gray-700 font-semibold mb-3">Trạng thái</Text>
              <View className="flex-row flex-wrap">
                {STATUS_FILTER_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value || 'all'}
                    onPress={() => setTempStatus(option.value)}
                    className={`px-4 py-2 rounded-full mr-2 mb-2 ${
                      tempStatus === option.value ? 'bg-blue-600' : 'bg-gray-100'
                    }`}
                  >
                    <Text className={`text-sm ${tempStatus === option.value ? 'text-white' : 'text-gray-700'}`}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Action buttons */}
          <View className="flex-row px-5 py-4 border-t border-gray-100">
            <TouchableOpacity
              onPress={handleReset}
              className="flex-1 py-3 mr-2 rounded-xl border border-gray-300"
            >
              <Text className="text-gray-700 text-center font-semibold">Đặt lại</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleApply}
              className="flex-1 py-3 ml-2 rounded-xl bg-blue-600"
            >
              <Text className="text-white text-center font-semibold">Áp dụng</Text>
            </TouchableOpacity>
          </View>

          {/* Safe area bottom */}
          <View className="h-6" />
        </View>
      </View>
    </Modal>
  );
};

const EmptyState = ({ hasFilters, onClearFilters }) => (
  <View className="flex-1 items-center justify-center py-20">
    <View className="bg-gray-100 rounded-full p-6 mb-4">
      <Ionicons name="document-text-outline" size={48} color="#9ca3af" />
    </View>
    <Text className="text-gray-900 font-semibold text-lg mb-2">
      {hasFilters ? 'Không tìm thấy kết quả' : 'Chưa có dữ liệu điểm danh'}
    </Text>
    <Text className="text-gray-500 text-center px-8">
      {hasFilters
        ? 'Thử thay đổi bộ lọc để xem kết quả khác'
        : 'Dữ liệu điểm danh sẽ hiển thị khi bạn tham gia các buổi học'}
    </Text>
    {hasFilters && (
      <TouchableOpacity
        onPress={onClearFilters}
        className="mt-4 px-6 py-2 bg-blue-600 rounded-full"
      >
        <Text className="text-white font-medium">Xóa bộ lọc</Text>
      </TouchableOpacity>
    )}
  </View>
);

const AttendanceHistoryScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  // Redux state
  const records = useSelector(selectAttendanceRecords);
  const summary = useSelector(selectAttendanceSummary);
  const filters = useSelector(selectAttendanceFilters);
  const pagination = useSelector(selectAttendancePagination);
  const semesters = useSelector(selectAvailableSemesters);
  const isLoading = useSelector(selectAttendanceHistoryLoading);
  const isRefreshing = useSelector(selectAttendanceHistoryRefreshing);
  const isLoadingMore = useSelector(selectAttendanceHistoryLoadingMore);
  const error = useSelector(selectAttendanceHistoryError);

  // Local state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  // Check if any filters are applied
  const hasFilters = useMemo(() => {
    return selectedSemester || selectedStatus;
  }, [selectedSemester, selectedStatus]);

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedSemester) count++;
    if (selectedStatus) count++;
    return count;
  }, [selectedSemester, selectedStatus]);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = useCallback((params = {}) => {
    dispatch(getAttendanceHistoryThunk({
      semester: selectedSemester,
      status: selectedStatus,
      page: 1,
      limit: 20,
      ...params,
    }));
  }, [dispatch, selectedSemester, selectedStatus]);

  const handleRefresh = useCallback(() => {
    dispatch(getAttendanceHistoryThunk({
      semester: selectedSemester,
      status: selectedStatus,
      page: 1,
      limit: 20,
      isRefresh: true,
    }));
  }, [dispatch, selectedSemester, selectedStatus]);

  const handleLoadMore = useCallback(() => {
    if (isLoadingMore || pagination.page >= pagination.totalPages) return;

    dispatch(getAttendanceHistoryThunk({
      semester: selectedSemester,
      status: selectedStatus,
      page: pagination.page + 1,
      limit: pagination.limit,
      isLoadMore: true,
    }));
  }, [dispatch, isLoadingMore, pagination, selectedSemester, selectedStatus]);

  const handleApplyFilters = useCallback((selectedSemester, selectedStatus) => {
    fetchData({
      semester: selectedSemester,
      status: selectedStatus,
    });
  }, [fetchData, selectedSemester, selectedStatus]);

  const handleClearFilters = useCallback(() => {
    setSelectedSemester(null);
    setSelectedStatus(null);
    dispatch(clearAttendanceFilters());
    fetchData({
      semester: null,
      status: null,
    });
  }, [dispatch, fetchData]);

  const handleRecordPress = useCallback((record) => {
    // Navigate to schedule detail if needed
    if (record.classSessionId) {
      navigation.navigate('ScheduleDetail', {
        schedule: record.classSession,
      });
    }
  }, [navigation]);

  const renderItem = useCallback(({ item }) => (
    <AttendanceRecordItem
      record={item}
      onPress={() => handleRecordPress(item)}
    />
  ), [handleRecordPress]);

  const renderHeader = useCallback(() => (
    <>
      {/* Summary card */}
      <SummaryCard summary={summary} />

      {/* Quick status filters */}
      <View className="px-4 mb-4">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {STATUS_FILTER_OPTIONS.map((option) => (
            <FilterChip
              key={option.value || 'all'}
              label={option.label}
              isSelected={selectedStatus === option.value}
              onPress={() => {
                setSelectedStatus(option.value);
                fetchData({ status: option.value, semester: selectedSemester });
              }}
            />
          ))}
        </ScrollView>
      </View>

      {/* Results count */}
      <View className="px-4 mb-3 flex-row items-center justify-between">
        <Text className="text-gray-500 text-sm">
          {pagination.total} kết quả
        </Text>
        {hasFilters && (
          <TouchableOpacity onPress={handleClearFilters}>
            <Text className="text-blue-600 text-sm font-medium">Xóa bộ lọc</Text>
          </TouchableOpacity>
        )}
      </View>
    </>
  ), [summary, selectedStatus, selectedSemester, pagination.total, hasFilters, fetchData, handleClearFilters]);

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#3b82f6" />
      </View>
    );
  }, [isLoadingMore]);

  const renderEmpty = useCallback(() => (
    <EmptyState hasFilters={hasFilters} onClearFilters={handleClearFilters} />
  ), [hasFilters, handleClearFilters]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 items-center justify-center rounded-full bg-gray-100 mr-3"
          >
            <Ionicons name="arrow-back" size={22} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Lịch sử điểm danh</Text>
        </View>

        {/* Filter button */}
        <TouchableOpacity
          onPress={() => setShowFilterModal(true)}
          className="flex-row items-center px-4 py-2 bg-gray-100 rounded-full"
        >
          <Ionicons name="filter" size={18} color="#374151" />
          <Text className="text-gray-700 ml-1.5 font-medium">Lọc</Text>
          {activeFilterCount > 0 && (
            <View className="bg-blue-600 rounded-full w-5 h-5 items-center justify-center ml-2">
              <Text className="text-white text-xs font-bold">{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      {isLoading && !isRefreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-gray-500 mt-3">Đang tải dữ liệu...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="warning-outline" size={48} color="#ef4444" />
          <Text className="text-gray-900 font-semibold text-lg mt-4 text-center">{error}</Text>
          <TouchableOpacity
            onPress={() => fetchData()}
            className="mt-4 px-6 py-2 bg-blue-600 rounded-full"
          >
            <Text className="text-white font-medium">Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item, index) => `${item.classSessionId}-${index}`}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#3b82f6']}
              tintColor="#3b82f6"
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 16, flexGrow: 1 }}
        />
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        semesters={semesters}
        selectedSemester={selectedSemester}
        onSelectSemester={setSelectedSemester}
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
        onApply={handleApplyFilters}
        onReset={handleClearFilters}
      />
    </SafeAreaView>
  );
};

export default AttendanceHistoryScreen;
