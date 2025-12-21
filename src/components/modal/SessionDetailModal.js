import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SessionDetailModal = ({ 
  visible, 
  onClose, 
  session 
}) => {
  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'expired':
        return 'bg-gray-100 text-gray-700';
      case 'invalid':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Đang hoạt động';
      case 'expired':
        return 'Đã kết thúc';
      case 'invalid':
        return 'Không hợp lệ';
      default:
        return status;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '85%' }}>
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-900 text-xl font-bold">Chi tiết phiên điểm danh</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {session && (
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Session Info */}
              <View className="bg-gray-50 rounded-xl p-4 mb-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-600 text-sm">Thời gian tạo</Text>
                  <Text className="text-gray-900 font-semibold">
                    {formatDateTime(session.created_at)}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-600 text-sm">Giảng viên tạo</Text>
                  <Text className="text-gray-900 font-semibold">
                    {session.created_by_name}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-600 text-sm">Thời lượng</Text>
                  <Text className="text-gray-900 font-semibold">
                    {session.session_duration_minutes} phút
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-600 text-sm">Trạng thái</Text>
                  <View className={`px-3 py-1 rounded-full ${getStatusColor(session.status)}`}>
                    <Text className="text-xs font-semibold">
                      {getStatusText(session.status)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Statistics */}
              <View className="bg-white rounded-xl p-4 mb-4" style={{ elevation: 2 }}>
                <Text className="text-gray-900 font-bold mb-3">Thống kê</Text>
                <View className="flex-row justify-between mb-3">
                  <View className="flex-1 items-center">
                    <Text className="text-2xl font-bold text-purple-600">
                      {session.total_attended}
                    </Text>
                    <Text className="text-gray-500 text-xs">Đã điểm danh</Text>
                  </View>
                  <View className="flex-1 items-center">
                    <Text className="text-2xl font-bold text-gray-400">
                      {session.total_students - session.total_attended}
                    </Text>
                    <Text className="text-gray-500 text-xs">Vắng</Text>
                  </View>
                  <View className="flex-1 items-center">
                    <Text className="text-2xl font-bold text-blue-600">
                      {session.attendance_rate.toFixed(1)}%
                    </Text>
                    <Text className="text-gray-500 text-xs">Tỷ lệ</Text>
                  </View>
                </View>

                <View
                  className={`rounded-lg p-2 flex-row items-center ${
                    session.quorum_met ? 'bg-green-50' : 'bg-orange-50'
                  }`}
                >
                  <Ionicons
                    name={session.quorum_met ? 'checkmark-circle' : 'alert-circle'}
                    size={16}
                    color={session.quorum_met ? '#10b981' : '#f59e0b'}
                  />
                  <Text
                    className={`ml-2 text-xs font-semibold ${
                      session.quorum_met ? 'text-green-700' : 'text-orange-700'
                    }`}
                  >
                    {session.quorum_met ? 'Đạt yêu cầu quorum (≥2/3)' : 'Không đạt quorum'}
                  </Text>
                </View>
              </View>

              {/* Attendance List */}
              {session.attendances && session.attendances.length > 0 && (
                <View>
                  <Text className="text-gray-900 font-bold mb-3">
                    Danh sách điểm danh ({session.attendances.length})
                  </Text>
                  <View className="bg-white rounded-xl p-4" style={{ elevation: 2 }}>
                    {session.attendances.map((attendance, index) => (
                      <View
                        key={attendance.id}
                        className={`flex-row items-center py-3 ${
                          index !== 0 ? 'border-t border-gray-100' : ''
                        }`}
                      >
                        <View
                          className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${
                            attendance.valid ? 'bg-green-100' : 'bg-red-100'
                          }`}
                        >
                          <Ionicons
                            name={attendance.valid ? 'checkmark' : 'close'}
                            size={20}
                            color={attendance.valid ? '#10b981' : '#ef4444'}
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="text-gray-900 font-semibold">
                            {attendance.student_name}
                          </Text>
                          <Text className="text-gray-500 text-xs">
                            {attendance.student_id}
                          </Text>
                        </View>
                        <Text className="text-gray-400 text-xs">
                          {new Date(attendance.scan_time).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default SessionDetailModal;
