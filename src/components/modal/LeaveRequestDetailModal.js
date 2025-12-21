import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const LeaveRequestDetailModal = ({
  visible,
  onClose,
  selectedRequest,
  getStatusColor,
  getStatusIcon,
  getStatusText,
  getReasonIcon,
}) => {
  return (
    <Modal
      visible={visible}
      animationType='slide'
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar style="dark" />
        {selectedRequest && (
          <>
            <View className="px-6 py-4 border-b border-gray-200">
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-900 text-xl font-bold">Chi tiết yêu cầu</Text>
                <View className={`px-3 py-1.5 rounded-full ${getStatusColor(selectedRequest?.status)}`}>
                  <View className="flex-row items-center">
                    <Ionicons name={getStatusIcon(selectedRequest?.status)} size={16} />
                    <Text className="text-sm font-semibold ml-1">{getStatusText(selectedRequest.status)}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={24} color="#6b7280"/>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
              {/* Schedule Information Card */}
              <View className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-4 mb-4">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="calendar" size={24} color="#2563eb" />
                  <Text className="text-gray-900 font-bold text-lg ml-2">Thông tin buổi học</Text>
                </View>
                
                <View>
                  <View className="flex-row items-start mb-2">
                    <Ionicons name="book" size={18} color="#4b5563" />
                    <View className="ml-3 flex-1">
                      <Text className="text-gray-500 text-xs mb-1">Môn học</Text>
                      <Text className="text-gray-900 font-semibold text-base">
                        {selectedRequest.schedule.courseName} - <Text className="text-blue-600 text-sm font-medium">{selectedRequest.schedule.courseCode}</Text>
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-start mb-2">
                    <Ionicons name="calendar-outline" size={18} color="#4b5563" />
                    <View className="ml-3 flex-1">
                      <Text className="text-gray-500 text-xs mb-1">Ngày học</Text>
                      <Text className="text-gray-900 font-semibold">
                        {selectedRequest.schedule.dayOfWeek}, {selectedRequest.schedule.date}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-start mb-2">
                    <Ionicons name="time-outline" size={18} color="#4b5563" />
                    <View className="ml-3 flex-1">
                      <Text className="text-gray-500 text-xs mb-1">Giờ học</Text>
                      <Text className="text-gray-900 font-semibold">
                        {selectedRequest.schedule.startTime} - {selectedRequest.schedule.endTime}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-start mb-2">
                    <Ionicons name="location-outline" size={18} color="#4b5563" />
                    <View className="ml-3 flex-1">
                      <Text className="text-gray-500 text-xs mb-1">Phòng học</Text>
                      <Text className="text-gray-900 font-semibold">
                        {selectedRequest.schedule.room}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-start">
                    <Ionicons name="person-outline" size={18} color="#4b5563" />
                    <View className="ml-3 flex-1">
                      <Text className="text-gray-500 text-xs mb-1">Giảng viên</Text>
                      <Text className="text-gray-900 font-semibold">
                        {selectedRequest.schedule.teacherName}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Reason Card */}
              <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-200">
                <View className="flex-row items-center mb-3">
                  <Ionicons name={getReasonIcon(selectedRequest.reasonType)} size={24} color="#2563eb" />
                  <Text className="text-gray-900 font-bold text-lg ml-2">Lý do nghỉ</Text>
                </View>
                
                <View className="bg-blue-50 rounded-xl px-4 py-2 mb-3">
                  <Text className="text-blue-700 font-semibold">{selectedRequest.reasonLabel}</Text>
                </View>

                <Text className="text-gray-700 leading-6">{selectedRequest.note}</Text>
              </View>

              {/* Attachments Card */}
              <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-200">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="attach" size={24} color="#2563eb" />
                  <Text className="text-gray-900 font-bold text-lg ml-2">
                    Minh chứng đính kèm ({selectedRequest.attachments.length})
                  </Text>
                </View>

                {selectedRequest.attachments.map((attachment) => (
                  <TouchableOpacity
                    key={attachment.id}
                    className="bg-gray-50 rounded-xl p-3 mb-2 flex-row items-center"
                  >
                    <View className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 mr-3">
                      <Image
                        source={{ uri: attachment.uri }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-900 font-semibold mb-1" numberOfLines={1}>
                        {attachment.name}
                      </Text>
                      <Text className="text-gray-500 text-xs">Nhấn để xem chi tiết</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Submission Info Card */}
              <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-200">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="information-circle" size={24} color="#2563eb" />
                  <Text className="text-gray-900 font-bold text-lg ml-2">Thông tin nộp đơn</Text>
                </View>

                <View>
                  <View className="flex-row justify-between py-2 border-b border-gray-100">
                    <Text className="text-gray-600">Ngày nộp</Text>
                    <Text className="text-gray-900 font-semibold">
                      {new Date(selectedRequest.createdAt).toLocaleString('vi-VN')}
                    </Text>
                  </View>

                  {selectedRequest.reviewedAt && (
                    <>
                      <View className="flex-row justify-between py-2 border-b border-gray-100">
                        <Text className="text-gray-600">Ngày duyệt</Text>
                        <Text className="text-gray-900 font-semibold">
                          {new Date(selectedRequest.reviewedAt).toLocaleString('vi-VN')}
                        </Text>
                      </View>

                      <View className="flex-row justify-between py-2">
                        <Text className="text-gray-600">Người duyệt</Text>
                        <Text className="text-gray-900 font-semibold">
                          {selectedRequest.reviewedBy}
                        </Text>
                      </View>
                    </>
                  )}
                </View>
              </View>

              {/* Rejection Reason (if rejected) */}
              {selectedRequest.status === 'rejected' && selectedRequest.rejectedReason && (
                <View className="bg-red-50 rounded-2xl p-4 mb-4 border border-red-200">
                  <View className="flex-row items-center mb-3">
                    <Ionicons name="close-circle" size={24} color="#dc2626" />
                    <Text className="text-red-900 font-bold text-lg ml-2">Lý do từ chối</Text>
                  </View>
                  <Text className="text-red-800 leading-6">{selectedRequest.rejectedReason}</Text>
                </View>
              )}

              {/* Approval Note (if approved) */}
              {selectedRequest.status === 'approved' && (
                <View className="bg-green-50 rounded-2xl p-4 mb-4 border border-green-200">
                  <View className="flex-row items-center">
                    <Ionicons name="checkmark-circle" size={24} color="#16a34a" />
                    <Text className="text-green-900 font-bold text-base ml-2">Yêu cầu đã được chấp thuận</Text>
                  </View>
                  <Text className="text-green-700 text-sm mt-2">Buổi vắng của bạn đã được ghi nhận là "Vắng có phép"</Text>
                </View>
              )}

              <View className="h-6" />
            </ScrollView>

            {/* Cancel Request (if pending) */}
            {selectedRequest.status === 'pending' && (
              <View className="px-6 py-4 border-t border-gray-200">
                <TouchableOpacity
                  onPress={() => {
                    //  Handle cancel request
                    onClose();
                  }}
                  className="bg-red-500 rounded-xl py-3 items-center"
                >
                  <Text className="text-white font-bold text-base">Hủy yêu cầu</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
};

export default LeaveRequestDetailModal;
