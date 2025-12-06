import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const StudentListScreen = ({ navigation, route }) => {
  const { schedule } = route.params;

  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filterType, setFilterType] = useState('all'); // 'all', 'theory', 'practice'
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    // Call API to get students enrolled in this schedule
    const isTheorySchedule = schedule.practice_group_id === null;
    
    let mockStudents = [];
    
    if (isTheorySchedule) {
      // Lịch lý thuyết: hiển thị TẤT CẢ sinh viên (cả lý thuyết + các nhóm thực hành)
      mockStudents = [
        {
          id: 1,
          student_id: '20200001',
          name: 'Nguyễn Văn A',
          email: 'a.nguyen@example.com',
          phone: '0912345678',
          class: 'IT1-01',
          enrollment_type: 'theory',
          practice_group: null,
          practice_group_id: null,
          attendance_rate: 85.5,
          total_sessions: 12,
          attended_sessions: 10,
          absent_sessions: 2,
          status: 'active',
        },
        {
          id: 2,
          student_id: '20200002',
          name: 'Trần Thị B',
          email: 'b.tran@example.com',
          phone: '0923456789',
          class: 'IT1-02',
          enrollment_type: 'practice',
          practice_group: 'Group A',
          practice_group_id: 1,
          attendance_rate: 92.0,
          total_sessions: 12,
          attended_sessions: 11,
          absent_sessions: 1,
          status: 'active',
        },
        {
          id: 3,
          student_id: '20200003',
          name: 'Lê Văn C',
          email: 'c.le@example.com',
          phone: '0934567890',
          class: 'IT1-01',
          enrollment_type: 'practice',
          practice_group: 'Group B',
          practice_group_id: 2,
          attendance_rate: 66.7,
          total_sessions: 12,
          attended_sessions: 8,
          absent_sessions: 4,
          status: 'active',
        },
        ...Array.from({ length: 42 }, (_, i) => ({
          id: i + 4,
          student_id: `2020${(i + 4).toString().padStart(4, '0')}`,
          name: `Sinh viên ${String.fromCharCode(68 + i)}`,
          email: `student${i + 4}@example.com`,
          phone: `09${(12345678 + i).toString().slice(0, 8)}`,
          class: `IT1-${(i % 3) + 1}`,
          enrollment_type: i % 2 === 0 ? 'theory' : 'practice',
          practice_group: i % 2 === 0 ? null : `Group ${String.fromCharCode(65 + (i % 3))}`,
          practice_group_id: i % 2 === 0 ? null : (i % 3) + 1,
          attendance_rate: 60 + Math.random() * 40,
          total_sessions: 12,
          attended_sessions: 6 + Math.floor(Math.random() * 6),
          absent_sessions: Math.floor(Math.random() * 6),
          status: 'active',
        })),
      ];
    } else {
      // Lịch thực hành: CHỈ hiển thị sinh viên trong nhóm cụ thể
      const groupId = schedule.practice_group_id;
      const groupName = schedule.practice_group_name;
      
      mockStudents = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        student_id: `2020${(i + 1).toString().padStart(4, '0')}`,
        name: `Sinh viên ${groupName} ${i + 1}`,
        email: `student.${groupName.toLowerCase().replace(' ', '')}.${i + 1}@example.com`,
        phone: `09${(12345000 + i).toString().slice(0, 8)}`,
        class: `IT1-0${(i % 3) + 1}`,
        enrollment_type: 'practice',
        practice_group: groupName,
        practice_group_id: groupId,
        attendance_rate: 70 + Math.random() * 30,
        total_sessions: 12,
        attended_sessions: 8 + Math.floor(Math.random() * 4),
        absent_sessions: Math.floor(Math.random() * 4),
        status: 'active',
      }));
    }

    setStudents(mockStudents);
    setFilteredStudents(mockStudents);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStudents();
    setRefreshing(false);
  };

  // Lọc sinh viên theo tìm kiếm và loại
  useEffect(() => {
    let filtered = students;

    // Filter by type
    if (filterType === 'theory') {
      filtered = filtered.filter(s => s.enrollment_type === 'theory');
    } else if (filterType === 'practice') {
      filtered = filtered.filter(s => s.enrollment_type === 'practice');
      if (selectedGroup) {
        filtered = filtered.filter(s => s.practice_group_id === selectedGroup);
      }
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        s =>
          s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.student_id.includes(searchQuery) ||
          s.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredStudents(filtered);
  }, [searchQuery, students, filterType, selectedGroup]);

  const handleStudentPress = (student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  const getAttendanceColor = (rate) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getAttendanceBgColor = (rate) => {
    if (rate >= 80) return 'bg-green-50';
    if (rate >= 60) return 'bg-orange-50';
    return 'bg-red-50';
  };

  const practiceGroups = [
    { id: 1, name: 'Group A', count: students.filter(s => s.practice_group_id === 1).length },
    { id: 2, name: 'Group B', count: students.filter(s => s.practice_group_id === 2).length },
    { id: 3, name: 'Group C', count: students.filter(s => s.practice_group_id === 3).length },
  ];

  const theoryCount = students.filter(s => s.enrollment_type === 'theory').length;
  const practiceCount = students.filter(s => s.enrollment_type === 'practice').length;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient
        colors={['#7c3aed', '#8b5cf6']}
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

        {/* Filter Tabs */}
        {schedule.practice_group_id === null && (
          <View className="flex-row mb-2">
            <TouchableOpacity
              onPress={() => {
                setFilterType('all');
                setSelectedGroup(null);
              }}
              className={`flex-1 py-2 rounded-lg mr-2 ${
                filterType === 'all' ? 'bg-white' : 'bg-white/20'
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  filterType === 'all' ? 'text-purple-600' : 'text-white'
                }`}
              >
                Tất cả ({students.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setFilterType('theory');
                setSelectedGroup(null);
              }}
              className={`flex-1 py-2 rounded-lg mr-2 ${
                filterType === 'theory' ? 'bg-white' : 'bg-white/20'
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  filterType === 'theory' ? 'text-purple-600' : 'text-white'
                }`}
              >
                Lý thuyết ({theoryCount})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setFilterType('practice')}
              className={`flex-1 py-2 rounded-lg ${
                filterType === 'practice' ? 'bg-white' : 'bg-white/20'
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  filterType === 'practice' ? 'text-purple-600' : 'text-white'
                }`}
              >
                Thực hành ({practiceCount})
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Practice schedule info */}
        {schedule.practice_group_id !== null && (
          <View className="bg-white/20 rounded-xl px-4 py-2 mb-2">
            <Text className="text-white text-center font-semibold">
              Nhóm {schedule.practice_group_name} • {students.length} sinh viên
            </Text>
          </View>
        )}

        {/* Practice Group Filter */}
        {schedule.practice_group_id === null && filterType === 'practice' && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row"
          >
            <TouchableOpacity
              onPress={() => setSelectedGroup(null)}
              className={`px-4 py-2 rounded-lg mr-2 ${
                selectedGroup === null ? 'bg-white' : 'bg-white/20'
              }`}
            >
              <Text
                className={`font-semibold ${
                  selectedGroup === null ? 'text-purple-600' : 'text-white'
                }`}
              >
                Tất cả nhóm
              </Text>
            </TouchableOpacity>
            {practiceGroups.map(group => (
              <TouchableOpacity
                key={group.id}
                onPress={() => setSelectedGroup(group.id)}
                className={`px-4 py-2 rounded-lg mr-2 ${
                  selectedGroup === group.id ? 'bg-white' : 'bg-white/20'
                }`}
              >
                <Text
                  className={`font-semibold ${
                    selectedGroup === group.id ? 'text-purple-600' : 'text-white'
                  }`}
                >
                  {group.name} ({group.count})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </LinearGradient>

      {/* Student List */}
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
              key={`${student.id}-${index}`}
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
                <View className="flex-1">
                  <Text className="text-gray-900 font-bold text-base">{student.name}</Text>
                  <Text className="text-gray-600 text-sm">
                    {student.student_id} • {student.class}
                  </Text>
                </View>
                <View
                  className={`px-3 py-1 rounded-full ${
                    student.enrollment_type === 'theory' ? 'bg-blue-100' : 'bg-purple-100'
                  }`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      student.enrollment_type === 'theory' ? 'text-blue-700' : 'text-purple-700'
                    }`}
                  >
                    {student.enrollment_type === 'theory' ? 'Lý thuyết' : student.practice_group}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="mail-outline" size={14} color="#6b7280" />
                  <Text className="text-gray-600 text-xs ml-1">{student.email}</Text>
                </View>
              </View>

              <View className="mt-2 pt-2 border-t border-gray-100 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="calendar-outline" size={14} color="#6b7280" />
                  <Text className="text-gray-600 text-xs ml-1">
                    {student.attended_sessions}/{student.total_sessions} buổi
                  </Text>
                </View>
                <View
                  className={`px-2 py-1 rounded ${getAttendanceBgColor(student.attendance_rate)}`}
                >
                  <Text className={`text-xs font-bold ${getAttendanceColor(student.attendance_rate)}`}>
                    {student.attendance_rate.toFixed(1)}%
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View className="h-6" />
      </ScrollView>

      {/* Student Detail Modal */}
      <Modal
        visible={showDetailModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '80%' }}>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-900 text-xl font-bold">Thông tin sinh viên</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {selectedStudent && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Basic Info */}
                <View className="bg-gray-50 rounded-xl p-4 mb-4">
                  <Text className="text-gray-900 text-lg font-bold mb-3">
                    {selectedStudent.name}
                  </Text>
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="school-outline" size={16} color="#6b7280" />
                    <Text className="text-gray-600 ml-2">MSSV: {selectedStudent.student_id}</Text>
                  </View>
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="people-outline" size={16} color="#6b7280" />
                    <Text className="text-gray-600 ml-2">Lớp: {selectedStudent.class}</Text>
                  </View>
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="mail-outline" size={16} color="#6b7280" />
                    <Text className="text-gray-600 ml-2">{selectedStudent.email}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="call-outline" size={16} color="#6b7280" />
                    <Text className="text-gray-600 ml-2">{selectedStudent.phone}</Text>
                  </View>
                </View>

                {/* Enrollment Info */}
                <View className="bg-gray-50 rounded-xl p-4 mb-4">
                  <Text className="text-gray-900 font-bold mb-3">Thông tin đăng ký</Text>
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-gray-600">Loại đăng ký</Text>
                    <Text className="text-gray-900 font-semibold">
                      {selectedStudent.enrollment_type === 'theory' ? 'Lý thuyết' : 'Thực hành'}
                    </Text>
                  </View>
                  {selectedStudent.practice_group && (
                    <View className="flex-row items-center justify-between">
                      <Text className="text-gray-600">Nhóm thực hành</Text>
                      <Text className="text-gray-900 font-semibold">
                        {selectedStudent.practice_group}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Attendance Stats */}
                <View className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
                  <Text className="text-gray-900 font-bold mb-3">Thống kê điểm danh</Text>
                  <View className="flex-row justify-between mb-3">
                    <View className="flex-1 items-center">
                      <Text className="text-2xl font-bold text-green-600">
                        {selectedStudent.attended_sessions}
                      </Text>
                      <Text className="text-gray-500 text-xs">Có mặt</Text>
                    </View>
                    <View className="flex-1 items-center">
                      <Text className="text-2xl font-bold text-red-600">
                        {selectedStudent.absent_sessions}
                      </Text>
                      <Text className="text-gray-500 text-xs">Vắng</Text>
                    </View>
                    <View className="flex-1 items-center">
                      <Text className="text-2xl font-bold text-purple-600">
                        {selectedStudent.total_sessions}
                      </Text>
                      <Text className="text-gray-500 text-xs">Tổng</Text>
                    </View>
                  </View>
                  <View
                    className={`rounded-lg p-3 ${getAttendanceBgColor(
                      selectedStudent.attendance_rate
                    )}`}
                  >
                    <Text
                      className={`text-center font-bold text-lg ${getAttendanceColor(
                        selectedStudent.attendance_rate
                      )}`}
                    >
                      Tỷ lệ điểm danh: {selectedStudent.attendance_rate.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default StudentListScreen;
