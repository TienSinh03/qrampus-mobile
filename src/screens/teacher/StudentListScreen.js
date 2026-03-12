import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { getStudentsByClassSessionThunk } from '../../features/classSession/classSessionThunks';
import {
  selectStudents,
  selectTotalStudents,
  selectPracticeGroupBreakdown,
  selectApiPracticeGroup,
  selectStudentsLoading,
  selectLoadedForSessionId,
} from '../../features/classSession/classSessionSlice';
import StudentDetailModal from '../../components/modal/StudentDetailModal';

const StudentListScreen = ({ navigation, route }) => {
  const { schedule } = route.params;

  const dispatch = useDispatch();
  const students = useSelector(selectStudents);
  const totalStudents = useSelector(selectTotalStudents);
  const practiceGroupBreakdown = useSelector(selectPracticeGroupBreakdown);
  const apiPracticeGroup = useSelector(selectApiPracticeGroup);
  const loading = useSelector(selectStudentsLoading);
  const loadedForSessionId = useSelector(selectLoadedForSessionId);

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (loadedForSessionId !== schedule.id) {
      dispatch(getStudentsByClassSessionThunk(schedule.id));
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await dispatch(getStudentsByClassSessionThunk(schedule.id));
    setRefreshing(false);
  };

  const filteredStudents = useMemo(() => {
    if (!searchQuery) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(
      s =>
        s.fullName?.toLowerCase().includes(q) ||
        s.studentCode?.includes(searchQuery) ||
        s.email?.toLowerCase().includes(q)
    );
  }, [searchQuery, students]);

  const handleStudentPress = (student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  const isPracticeSchedule = schedule.isPractice;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient
        colors={isPracticeSchedule ? ['#0891b2', '#06b6d4'] : ['#7c3aed', '#8b5cf6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 py-4"
      >
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-white text-lg font-bold">{schedule.courseName}</Text>
            <Text className="text-white/80 text-sm">
              {schedule.courseCode} • {schedule.room}
            </Text>
          </View>
        </View>

        {/* Search Bar */}
        <View className="bg-white/20 rounded-xl px-4 py-2 flex-row items-center mb-3">
          <Ionicons name="search" size={20} color="white" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Tìm theo tên, MSSV, email..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            className="flex-1 ml-2 text-white"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>

        {/* Schedule type + student count info */}
        <View className="bg-white/20 rounded-xl px-4 py-2 mb-2">
          <Text className="text-white text-center font-semibold">
            {isPracticeSchedule
              ? `Thực hành${apiPracticeGroup ? ` - ${apiPracticeGroup.group_name}` : ''} • ${totalStudents} sinh viên`
              : `Lý thuyết • ${totalStudents} sinh viên`}
          </Text>
        </View>

        {/* Practice Group Breakdown (chỉ hiện cho lý thuyết) */}
        {/* {!isPracticeSchedule && practiceGroupBreakdown && practiceGroupBreakdown.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row mt-1"
          >
            {practiceGroupBreakdown.map((group, idx) => (
              <View
                key={group.practiceGroupId || `no-group-${idx}`}
                className="bg-white/20 px-3 py-1.5 rounded-lg mr-2"
              >
                <Text className="text-white text-xs font-semibold">
                  {group.groupName} ({group.count})
                </Text>
              </View>
            ))}
          </ScrollView>
        )} */}
      </LinearGradient>

      {/* Student List */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text className="text-gray-500 mt-3">Đang tải danh sách...</Text>
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-6 pt-4"
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {filteredStudents.length === 0 ? (
            <View className="bg-white rounded-2xl p-8 items-center justify-center">
              <Text className="text-6xl mb-3">👥</Text>
              <Text className="text-gray-900 font-bold text-lg mb-1">Không tìm thấy sinh viên</Text>
              <Text className="text-gray-500 text-sm text-center">
                {searchQuery
                  ? 'Thử tìm kiếm với từ khóa khác'
                  : 'Chưa có sinh viên đăng ký học phần này'}
              </Text>
            </View>
          ) : (
            filteredStudents.map((student, index) => (
              <TouchableOpacity
                key={`${student.studentId}-${index}`}
                onPress={() => handleStudentPress(student)}
                className="bg-white rounded-2xl p-4 mb-3"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-1 mr-2">
                    <Text className="text-gray-900 font-bold text-base">{student.fullName}</Text>
                    <Text className="text-gray-600 text-sm">
                      {student.studentCode} • {student.className}
                    </Text>
                  </View>
                  {student.practiceGroup ? (
                    <View className="px-3 py-1 rounded-full bg-purple-100">
                      <Text className="text-xs font-semibold text-purple-700">
                        {student.practiceGroup.groupName}
                      </Text>
                    </View>
                  ) : (
                    <View className="px-3 py-1 rounded-full bg-blue-100">
                      <Text className="text-xs font-semibold text-blue-700">Lý thuyết</Text>
                    </View>
                  )}
                </View>

                <View className="flex-row items-center">
                  <Ionicons name="mail-outline" size={14} color="#6b7280" />
                  <Text className="text-gray-600 text-xs ml-1">{student.email}</Text>
                </View>

                {student.phone && (
                  <View className="flex-row items-center mt-1">
                    <Ionicons name="call-outline" size={14} color="#6b7280" />
                    <Text className="text-gray-600 text-xs ml-1">{student.phone}</Text>
                  </View>
                )}

                {student.major && (
                  <View className="mt-2 pt-2 border-t border-gray-100 flex-row items-center">
                    <Ionicons name="school-outline" size={14} color="#6b7280" />
                    <Text className="text-gray-600 text-xs ml-1">{student.major}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}

          <View className="h-6" />
        </ScrollView>
      )}

      {/* Student Detail Modal */}
      <StudentDetailModal
        visible={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        student={selectedStudent}
      />
    </SafeAreaView>
  );
};

export default StudentListScreen;
