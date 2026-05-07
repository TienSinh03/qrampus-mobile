import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { getTeacherWorkloadThunk } from '../../features/teacher/teacherThunks';
import {
  selectTeacherWorkload,
  selectWorkloadLoading,
} from '../../features/teacher/teacherSlice';

const TODAY = new Date().toISOString().slice(0, 10);

const deriveCourseEntries = (workload) => {
  const map = new Map();
  const allDays = workload?.data || [];

  allDays.forEach((day) => {
    day.sessions.forEach((session) => {
      const pgId = session.practice_group?.id || null;
      const key = `${session.course_section?.id}-${pgId ?? 'theory'}`;

      if (!map.has(key)) {
        map.set(key, {
          key,
          courseSectionId: session.course_section?.id,
          courseCode: session.course_section?.code || '',
          courseName: session.course_section?.name || '',
          semester: session.course_section?.semester || '',
          scheduleType: session.schedule_type,
          practiceGroup: session.practice_group || null,
          totalSessions: 0,
          createdSessions: 0,
          todayClassId: null,
          todayStartHour: '00:00',
          todayEndHour: '00:00',
          todayRoom: null,
          hasActiveSession: false,
        });
      }

      const entry = map.get(key);
      entry.totalSessions += 1;
      if (session.has_attendance_session) entry.createdSessions += 1;

      if (day.date === TODAY) {
        entry.todayClassId = session.id;
        entry.todayStartHour = session.start_hour?.slice(0, 5) || '00:00';
        entry.todayEndHour = session.end_hour?.slice(0, 5) || '00:00';
        entry.todayRoom = session.room;
        entry.hasActiveSession =
          session.latest_attendance_session?.status === 'active' || false;
      }
    });
  });

  return Array.from(map.values()).sort((a, b) =>
    a.courseName.localeCompare(b.courseName, 'vi')
  );
};

const toSchedule = (entry) => ({
  id: entry.todayClassId,
  courseSectionId: entry.courseSectionId,
  practiceGroup: entry.practiceGroup,
  courseName: entry.courseName,
  courseCode: entry.courseCode,
  semester: entry.semester,
  scheduleType: entry.scheduleType,
  startHour: entry.todayStartHour,
  endHour: entry.todayEndHour,
  room: entry.todayRoom?.room_code || entry.todayRoom?.room_name || '',
  roomId: entry.todayRoom?.id || '',
  roomName: entry.todayRoom?.room_name || '',
  roomCoordinates: [],
  hasActiveSession: entry.hasActiveSession,
  isTheory: entry.scheduleType === 'theory',
  isPractice: entry.scheduleType === 'practice',
});

const TeacherMyClassesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const workload = useSelector(selectTeacherWorkload);
  const isLoading = useSelector(selectWorkloadLoading);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [showSemesterPicker, setShowSemesterPicker] = useState(false);

  const fetchData = useCallback(() => {
    dispatch(getTeacherWorkloadThunk());
  }, [dispatch]);

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(getTeacherWorkloadThunk()).unwrap().catch(() => {});
    setRefreshing(false);
  };

  const semesters = useMemo(() => {
    const allDays = workload?.data || [];
    const set = new Set();
    allDays.forEach((day) =>
      day.sessions.forEach((s) => {
        if (s.course_section?.semester) set.add(s.course_section.semester);
      })
    );
    return Array.from(set).sort((a, b) =>
      b.localeCompare(a, undefined, { numeric: true })
    );
  }, [workload]);

  useEffect(() => {
    if (semesters.length > 0 && selectedSemester === null) {
      setSelectedSemester(semesters[0]);
    }
  }, [semesters]);

  const allEntries = deriveCourseEntries(workload);
  const entries = selectedSemester ? allEntries.filter((e) => e.semester === selectedSemester) : allEntries;

  const overview = workload?.overview || {};

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      {/* Header */}
      <LinearGradient
        colors={['#0171a5', '#30b2ea']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 pt-4 pb-5"
      >
        <View className="flex-row items-center mb-4">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-white text-xl font-bold">Phiên điểm danh</Text>
            <Text className="text-white/70 text-xs">Chọn môn học để xem danh sách phiên</Text>
          </View>
        </View>

        {/* Overview stats */}
        <View className="flex-row gap-3">
          <View className="flex-1 bg-white/15 rounded-xl p-3 items-center">
            <Text className="text-white text-xl font-bold">
              {overview.total_sessions ?? '—'}
            </Text>
            <Text className="text-white/80 text-xs text-center">Tổng buổi</Text>
          </View>
          <View className="flex-1 bg-white/15 rounded-xl p-3 items-center">
            <Text className="text-white text-xl font-bold">
              {overview.total_created ?? '—'}
            </Text>
            <Text className="text-white/80 text-xs text-center">Đã tạo QR</Text>
          </View>
          <View className="flex-1 bg-white/15 rounded-xl p-3 items-center">
            <Text className="text-white text-xl font-bold">{entries.length}</Text>
            <Text className="text-white/80 text-xs text-center">Môn học</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Semester selector bar */}
      {semesters.length > 0 && (
        <View className="bg-white border-b border-gray-100 px-4 py-2.5">
          <TouchableOpacity
            onPress={() => setShowSemesterPicker(true)}
            className="flex-row items-center self-start"
            activeOpacity={0.7}
          >
            <Ionicons name="school-outline" size={15} color="#6b7280" />
            <Text className="text-gray-500 text-xs ml-1.5 mr-1">Học kỳ:</Text>
            <Text className="text-sky-600 text-sm font-bold mr-1">
              {selectedSemester ?? '—'}
            </Text>
            <Ionicons name="chevron-down" size={14} color="#0284c7" />
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      {isLoading && !workload ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0171a5" />
          <Text className="text-gray-500 text-sm mt-3">Đang tải danh sách môn học...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4 pt-4"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {entries.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center mt-4">
              <Ionicons name="calendar-outline" size={48} color="#d1d5db" />
              <Text className="text-gray-800 font-bold text-base mt-3">
                Chưa có môn học nào
              </Text>
              <Text className="text-gray-400 text-sm text-center mt-1">
                Không có môn học nào trong học kỳ này
              </Text>
            </View>
          ) : (
            entries.map((entry) => {
              const isTheory = entry.scheduleType === 'theory';
              const hasClassToday = entry.todayClassId !== null;
              const progressPercent =
                entry.totalSessions > 0
                  ? Math.round((entry.createdSessions / entry.totalSessions) * 100)
                  : 0;

              return (
                <TouchableOpacity
                  key={entry.key}
                  onPress={() =>
                    navigation.navigate('SessionList', {
                      schedule: toSchedule(entry),
                    })
                  }
                  className="bg-white rounded-2xl mb-3 overflow-hidden"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.08,
                    shadowRadius: 3,
                    elevation: 2,
                  }}
                  activeOpacity={0.75}
                >
                  <View className="p-4">
                    {/* Row 1: badges + today indicator */}
                    <View className="flex-row items-center mb-2 flex-wrap gap-1.5">
                      <View
                        className={`px-2.5 py-0.5 rounded-full ${
                          isTheory ? 'bg-sky-100' : 'bg-cyan-100'
                        }`}
                      >
                        <Text
                          className={`text-xs font-semibold ${
                            isTheory ? 'text-sky-700' : 'text-cyan-700'
                          }`}
                        >
                          {isTheory ? 'Lý thuyết' : 'Thực hành'}
                        </Text>
                      </View>

                      {entry.practiceGroup && (
                        <View className="bg-purple-100 px-2.5 py-0.5 rounded-full">
                          <Text className="text-purple-700 text-xs font-semibold">
                            {entry.practiceGroup.group_name}
                          </Text>
                        </View>
                      )}

                      <View className="flex-1" />

                      {entry.hasActiveSession ? (
                        <View className="flex-row items-center bg-green-100 px-2 py-0.5 rounded-full">
                          <View className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1" />
                          <Text className="text-green-700 text-xs font-semibold">
                            Đang hoạt động
                          </Text>
                        </View>
                      ) : hasClassToday ? (
                        <View className="flex-row items-center bg-orange-100 px-2 py-0.5 rounded-full">
                          <Ionicons name="today-outline" size={11} color="#c2410c" />
                          <Text className="text-orange-700 text-xs font-semibold ml-1">
                            Hôm nay {entry.todayStartHour}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Row 2: course name */}
                    <Text
                      className="text-gray-900 font-bold text-base mb-0.5"
                      numberOfLines={2}
                    >
                      {entry.courseName}
                    </Text>

                    {/* Row 3: code */}
                    <Text className="text-gray-400 text-xs mb-3">{entry.courseCode}</Text>

                    {/* Row 4: progress */}
                    <View className="flex-row items-center">
                      <View className="flex-1 h-1.5 bg-gray-100 rounded-full mr-3">
                        <View
                          className={`h-1.5 rounded-full ${
                            progressPercent >= 80 ? 'bg-green-400'
                              : progressPercent >= 50 ? 'bg-sky-400'
                              : 'bg-orange-300'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </View>
                      <Text className="text-gray-500 text-xs">
                        {entry.createdSessions}/{entry.totalSessions} phiên
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color="#d1d5db"
                        style={{ marginLeft: 8 }}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
          <View className="h-6" />
        </ScrollView>
      )}

      {/* Semester picker popup */}
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
                {/* Handle bar */}
                <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-4" />

                <Text className="text-gray-900 text-base font-bold mb-4">
                  Chọn học kỳ
                </Text>

                {semesters.map((sem, index) => {
                  const isSelected = sem === selectedSemester;
                  return (
                    <TouchableOpacity
                      key={sem}
                      onPress={() => {
                        setSelectedSemester(sem);
                        setShowSemesterPicker(false);
                      }}
                      className={`flex-row items-center py-3.5 ${
                        index < semesters.length - 1 ? 'border-b border-gray-100' : ''
                      }`}
                      activeOpacity={0.6}
                    >
                      <Text
                        className={`flex-1 text-sm ${
                          isSelected ? 'text-sky-600 font-bold' : 'text-gray-700 font-medium'
                        }`}
                      >
                        {sem}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark" size={20} color="#0284c7" />
                      )}
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

export default TeacherMyClassesScreen;
