import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const StudentDetailModal = ({ 
  visible, 
  onClose, 
  student 
}) => {
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '80%' }}>
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-900 text-xl font-bold">Thông tin sinh viên</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {student && (
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Basic Info */}
              <View className="bg-gray-50 rounded-xl p-4 mb-4">
                <Text className="text-gray-900 text-lg font-bold mb-3">
                  {student.name}
                </Text>
                <View className="flex-row items-center mb-2">
                  <Ionicons name="school-outline" size={16} color="#6b7280" />
                  <Text className="text-gray-600 ml-2">MSSV: {student.student_id}</Text>
                </View>
                <View className="flex-row items-center mb-2">
                  <Ionicons name="people-outline" size={16} color="#6b7280" />
                  <Text className="text-gray-600 ml-2">Lớp: {student.class}</Text>
                </View>
                <View className="flex-row items-center mb-2">
                  <Ionicons name="mail-outline" size={16} color="#6b7280" />
                  <Text className="text-gray-600 ml-2">{student.email}</Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="call-outline" size={16} color="#6b7280" />
                  <Text className="text-gray-600 ml-2">{student.phone}</Text>
                </View>
              </View>

              {/* Enrollment Info */}
              <View className="bg-gray-50 rounded-xl p-4 mb-4">
                <Text className="text-gray-900 font-bold mb-3">Thông tin đăng ký</Text>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-600">Loại đăng ký</Text>
                  <Text className="text-gray-900 font-semibold">
                    {student.enrollment_type === 'theory' ? 'Lý thuyết' : 'Thực hành'}
                  </Text>
                </View>
                {student.practice_group && (
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-600">Nhóm thực hành</Text>
                    <Text className="text-gray-900 font-semibold">
                      {student.practice_group}
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
                      {student.attended_sessions}
                    </Text>
                    <Text className="text-gray-500 text-xs">Có mặt</Text>
                  </View>
                  <View className="flex-1 items-center">
                    <Text className="text-2xl font-bold text-red-600">
                      {student.absent_sessions}
                    </Text>
                    <Text className="text-gray-500 text-xs">Vắng</Text>
                  </View>
                  <View className="flex-1 items-center">
                    <Text className="text-2xl font-bold text-purple-600">
                      {student.total_sessions}
                    </Text>
                    <Text className="text-gray-500 text-xs">Tổng</Text>
                  </View>
                </View>
                <View
                  className={`rounded-lg p-3 ${getAttendanceBgColor(
                    student.attendance_rate
                  )}`}
                >
                  <Text
                    className={`text-center font-bold text-lg ${getAttendanceColor(
                      student.attendance_rate
                    )}`}
                  >
                    Tỷ lệ điểm danh: {student.attendance_rate.toFixed(1)}%
                  </Text>
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default StudentDetailModal;
