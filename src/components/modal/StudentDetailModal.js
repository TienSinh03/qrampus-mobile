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
                  {student.fullName}
                </Text>
                <View className="flex-row items-center mb-2">
                  <Ionicons name="school-outline" size={16} color="#6b7280" />
                  <Text className="text-gray-600 ml-2">MSSV: {student.studentCode}</Text>
                </View>
                <View className="flex-row items-center mb-2">
                  <Ionicons name="people-outline" size={16} color="#6b7280" />
                  <Text className="text-gray-600 ml-2">Lớp: {student.className}</Text>
                </View>
                {student.major && (
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="library-outline" size={16} color="#6b7280" />
                    <Text className="text-gray-600 ml-2">{student.major}</Text>
                  </View>
                )}
                <View className="flex-row items-center mb-2">
                  <Ionicons name="mail-outline" size={16} color="#6b7280" />
                  <Text className="text-gray-600 ml-2">{student.email}</Text>
                </View>
                {student.phone && (
                  <View className="flex-row items-center">
                    <Ionicons name="call-outline" size={16} color="#6b7280" />
                    <Text className="text-gray-600 ml-2">{student.phone}</Text>
                  </View>
                )}
              </View>

              {/* Enrollment Info */}
              <View className="bg-gray-50 rounded-xl p-4 mb-4">
                <Text className="text-gray-900 font-bold mb-3">Thông tin đăng ký</Text>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-600">Trạng thái</Text>
                  <View className={`px-3 py-1 rounded-full ${student.enrollmentStatus === 'active' ? 'bg-green-100' : 'bg-red-100'}`}>
                    <Text className={`text-xs font-semibold ${student.enrollmentStatus === 'active' ? 'text-green-700' : 'text-red-700'}`}>
                      {student.enrollmentStatus === 'active' ? 'Đang học' : 'Đã rút'}
                    </Text>
                  </View>
                </View>
                {student.practiceGroup && (
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-gray-600">Nhóm thực hành</Text>
                    <Text className="text-gray-900 font-semibold">
                      {student.practiceGroup.groupName}
                    </Text>
                  </View>
                )}
                {student.enrolledAt && (
                  <View className="flex-row items-center justify-between">
                    <Text className="text-gray-600">Ngày đăng ký</Text>
                    <Text className="text-gray-900 font-semibold">
                      {new Date(student.enrolledAt).toLocaleDateString('vi-VN')}
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default StudentDetailModal;
