import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectAttendanceDashboard,
  selectAttendanceDashboardLoading,
} from '../../features/teacher/teacherSlice';
import { getTeacherAttendanceDashboardThunk } from '../../features/teacher/teacherThunks';

const PAGE_SIZE = 10;

const CourseCard = ({ item, onPress }) => {
  const checkedIn = (item.onTimeCheckins ?? 0) + (item.lateCheckins ?? 0);
  const total = item.totalTeachingSessions ?? 0;
  const rate = total > 0 ? Math.round((checkedIn / total) * 100) : 0;
  const isPractice = !!item.practiceGroupName;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-white rounded-2xl mb-3 p-4"
      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3, elevation: 2 }}
      activeOpacity={0.75}
    >
      {/* Badges */}
      <View className="flex-row items-center mb-2 gap-1.5">
        <View className={`px-2.5 py-0.5 rounded-full ${isPractice ? 'bg-cyan-100' : 'bg-sky-100'}`}>
          <Text className={`text-xs font-semibold ${isPractice ? 'text-cyan-700' : 'text-sky-700'}`}>
            {isPractice ? `Thực hành - ${item.practiceGroupName}` : 'Lý thuyết'}
          </Text>
        </View>
        <View className="flex-1" />
        <Text className="text-gray-400 text-xs">{item.semester}</Text>
      </View>

      {/* Course name & code */}
      <Text className="text-gray-900 font-bold text-base mb-0.5" numberOfLines={2}>
        {item.courseName || '—'}
      </Text>
      <Text className="text-gray-400 text-xs mb-3">{item.courseCode}</Text>

      {/* Progress bar */}
      <View className="flex-row items-center mb-2">
        <View className="flex-1 h-1.5 bg-gray-100 rounded-full mr-3">
          <View
            className={`h-1.5 rounded-full ${rate >= 80 ? 'bg-green-400' : rate >= 50 ? 'bg-sky-400' : 'bg-orange-300'}`}
            style={{ width: `${rate}%` }}
          />
        </View>
        <Text className="text-gray-500 text-xs">{rate}%</Text>
      </View>

      {/* Stats row */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row gap-3">
          <View className="flex-row items-center gap-1">
            <Ionicons name="calendar-outline" size={13} color="#6b7280" />
            <Text className="text-gray-500 text-xs">{total} buổi</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <Ionicons name="checkmark-circle-outline" size={13} color="#16a34a" />
            <Text className="text-green-600 text-xs">{checkedIn}</Text>
          </View>
          {item.absentCheckins > 0 && (
            <View className="flex-row items-center gap-1">
              <Ionicons name="close-circle-outline" size={13} color="#dc2626" />
              <Text className="text-red-600 text-xs">{item.absentCheckins}</Text>
            </View>
          )}
        </View>
        <Ionicons name="chevron-forward" size={16} color="#d1d5db" />
      </View>
    </TouchableOpacity>
  );
};

const TeacherAttendanceHistoryScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const dashboard = useSelector(selectAttendanceDashboard);
  const isLoading = useSelector(selectAttendanceDashboardLoading);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [showSemesterPicker, setShowSemesterPicker] = useState(false);
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

  const fetch = useCallback((semester) => {
    dispatch(getTeacherAttendanceDashboardThunk(semester ? { semester } : {}));
  }, [dispatch]);

  useEffect(() => { fetch(); }, []);

  useEffect(() => {
    if (dashboard?.availableSemesters?.length > 0 && selectedSemester === null) {
      setSelectedSemester(dashboard.availableSemesters[0]);
    }
  }, [dashboard]);

  const onRefresh = async () => {
    setRefreshing(true);

    setDisplayCount(PAGE_SIZE);

    await dispatch(getTeacherAttendanceDashboardThunk(selectedSemester ? { semester: selectedSemester } : {})).unwrap().catch(() => {});
    setRefreshing(false);
  };

  const onSemesterSelect = (sem) => {
    setSelectedSemester(sem);
    setShowSemesterPicker(false);
    setDisplayCount(PAGE_SIZE);
    fetch(sem);
  };

  const semesters = dashboard?.availableSemesters || [];
  const summary = dashboard?.summary || {};

  const courseProgress = useMemo(() => {
    const list = dashboard?.courseProgress || [];
    return selectedSemester ? list.filter((c) => c.semester === selectedSemester) : list;
  }, [dashboard, selectedSemester]);

  const displayedItems = useMemo(() => courseProgress.slice(0, displayCount), [courseProgress, displayCount]);
  const hasMore = displayCount < courseProgress.length;

  const onEndReached = useCallback(() => {
    if (hasMore) setDisplayCount((n) => n + PAGE_SIZE);
  }, [hasMore]);

  const ListHeader = (
    <View>
      {semesters.length > 0 && (
        <TouchableOpacity
          onPress={() => setShowSemesterPicker(true)}
          className="flex-row items-center self-start mb-4"
          activeOpacity={0.7}
        >
          <Ionicons name="school-outline" size={15} color="#6b7280" />
          <Text className="text-gray-500 text-xs ml-1.5 mr-1">Học kỳ:</Text>
          <Text className="text-sky-600 text-sm font-bold mr-1">{selectedSemester ?? '—'}</Text>
          <Ionicons name="chevron-down" size={14} color="#0284c7" />
        </TouchableOpacity>
      )}
    </View>
  );

  const ListEmpty = (
    <View className="bg-white rounded-2xl p-8 items-center mt-4">
      <Ionicons name="document-text-outline" size={48} color="#d1d5db" />
      <Text className="text-gray-700 font-bold text-base mt-3">Chưa có dữ liệu</Text>
      <Text className="text-gray-400 text-sm text-center mt-1">
        Không có buổi chấm công nào trong học kỳ này
      </Text>
    </View>
  );

  const ListFooter = hasMore ? (
    <View className="items-center py-4">
      <ActivityIndicator size="small" color="#0171a5" />
    </View>
  ) : <View className="h-6" />;

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
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3 p-1">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-white text-xl font-bold">Lịch sử chấm công</Text>
            <Text className="text-white/70 text-xs">Thống kê theo môn học</Text>
          </View>
        </View>

        {/* Summary stats */}
        <View className="flex-row gap-2">
          <View className="flex-1 bg-white/15 rounded-xl p-3 items-center">
            <Text className="text-white text-lg font-bold">{summary.totalTeachingSessions ?? '—'}</Text>
            <Text className="text-white/75 text-xs text-center">Tổng buổi</Text>
          </View>

          <View className="flex-1 bg-white/15 rounded-xl p-3 items-center">
            <Text className="text-white text-lg font-bold">
              {summary.onTimeCheckins != null ? summary.onTimeCheckins + (summary.lateCheckins ?? 0) : '—'}
            </Text>
            <Text className="text-white/75 text-xs text-center">Đã chấm</Text>
          </View>

          <View className="flex-1 bg-white/15 rounded-xl p-3 items-center">
            <Text className="text-white text-lg font-bold">{summary.absentCheckins ?? '—'}</Text>
            <Text className="text-white/75 text-xs text-center">Vắng mặt</Text>
          </View>

          <View className="flex-1 bg-white/15 rounded-xl p-3 items-center">
            <Text className="text-white text-lg font-bold">
              {summary.attendanceRate != null ? `${Math.round(summary.attendanceRate)}%` : '—'}
            </Text>
            <Text className="text-white/75 text-xs text-center">Tỷ lệ</Text>
          </View>

        </View>
      </LinearGradient>

      {/* Full-screen loading */}
      {isLoading && !dashboard ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0171a5" />
          <Text className="text-gray-400 text-sm mt-3">Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          data={displayedItems}
          keyExtractor={(item, idx) => `${item.courseSectionId}-${item.practiceGroupId ?? 'theory'}-${idx}`}
          
          renderItem={({ item }) => (
            <CourseCard
              item={item}
              onPress={() =>
                navigation.navigate('TeacherCourseAttendanceSessions', {
                  courseId: item.courseSectionId,
                  courseName: item.courseName,
                  courseCode: item.courseCode,
                  practiceGroupId: item.practiceGroupId,
                  semester: selectedSemester,
                })
              }
            />
          )}

          ListHeaderComponent={ListHeader}
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

      {/* Semester picker modal */}
      <Modal
        visible={showSemesterPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSemesterPicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowSemesterPicker(false)}>
          <View className="flex-1 bg-black/40 justify-end">
            <TouchableWithoutFeedback>
              <View className="bg-white rounded-t-3xl px-5 pt-3 pb-8">
                <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-4" />
                <Text className="text-gray-900 text-base font-bold mb-4">Chọn học kỳ</Text>
                {semesters.map((sem, index) => {
                  const isSelected = sem === selectedSemester;
                  return (
                    <TouchableOpacity
                      key={sem}
                      onPress={() => onSemesterSelect(sem)}
                      className={`flex-row items-center py-3.5 ${index < semesters.length - 1 ? 'border-b border-gray-100' : ''}`}
                      activeOpacity={0.6}
                    >
                      <Text className={`flex-1 text-sm ${isSelected ? 'text-sky-600 font-bold' : 'text-gray-700 font-medium'}`}>
                        {sem}
                      </Text>
                      {isSelected && <Ionicons name="checkmark" size={20} color="#0284c7" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

export default TeacherAttendanceHistoryScreen;
