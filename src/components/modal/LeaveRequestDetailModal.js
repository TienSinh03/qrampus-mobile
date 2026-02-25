import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  Dimensions,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { reasonTypes } from '../../utils/reason.type';
import { DAYMAPPING } from '../../utils/day.mapping';
import ImageViewerModal from './ImageViewerModal';

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('vi-VN');
  } catch (e) {
    return dateString;
  }
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleString('vi-VN');
  } catch (e) {
    return dateString;
  }
};

const getReasonLabel = (reasonType) => {
  const reason = reasonTypes.find(r => r.value === reasonType);
  return reason ? reason.label : reasonType || 'Không rõ';
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const LeaveRequestDetailModal = ({
  visible,
  onClose,
  selectedRequest,
  getStatusColor,
  getStatusIcon,
  getStatusText,
  getReasonIcon,
  onCancelRequest,
  cancelLoading = false,
}) => {
  // Helper to get class session data (handles both API and legacy structures)
  const getClassSession = () => selectedRequest?.classSession || {};
  const getCourseSection = () => getClassSession()?.courseSection || {};
  const getRoom = () => getClassSession()?.room || {};
  const getPersonnel = () => getClassSession()?.personnel || {};

  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Format day of week from date
  const getDayOfWeek = () => {
    const classDate = getClassSession()?.class_date;
    if (!classDate) return 'N/A';
    try {
      return DAYMAPPING[new Date(classDate).getDay()] || 'N/A';
    } catch (e) {
      return 'N/A';
    }
  };

  const handleViewImage = (attachment) => {
    const mimeType = attachment.mimetype || attachment.type || '';
    if (mimeType.startsWith('image/')) {
      setSelectedImage(attachment);
      setShowImageModal(true);
    } else if (mimeType.includes('pdf')) {
      Alert.alert('PDF Viewer', 'Chức năng xem PDF đang được phát triển');
    }
  }

  const handleCancelRequest = () => {
    Alert.alert(
      'Xác nhận hủy',
      'Bạn có chắc chắn muốn hủy yêu cầu nghỉ phép này không?',
      [
        {
          text: 'Không',
          style: 'cancel',
        },
        {
          text: 'Hủy yêu cầu',
          style: 'destructive',
          onPress: () => {
            if (onCancelRequest && selectedRequest?.id) {
              onCancelRequest(selectedRequest.id);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

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
                        {getCourseSection()?.name || 'Unknown Course'} - <Text className="text-blue-600 text-sm font-medium">{getCourseSection()?.code || 'N/A'}</Text>
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-start mb-2">
                    <Ionicons name="calendar-outline" size={18} color="#4b5563" />
                    <View className="ml-3 flex-1">
                      <Text className="text-gray-500 text-xs mb-1">Ngày học</Text>
                      <Text className="text-gray-900 font-semibold">
                        {getDayOfWeek()}, {formatDate(getClassSession()?.class_date)}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-start mb-2">
                    <Ionicons name="time-outline" size={18} color="#4b5563" />
                    <View className="ml-3 flex-1">
                      <Text className="text-gray-500 text-xs mb-1">Giờ học</Text>
                      <Text className="text-gray-900 font-semibold">
                        {getClassSession()?.start_hour || 'N/A'} - {getClassSession()?.end_hour || 'N/A'}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-start mb-2">
                    <Ionicons name="location-outline" size={18} color="#4b5563" />
                    <View className="ml-3 flex-1">
                      <Text className="text-gray-500 text-xs mb-1">Phòng học</Text>
                      <Text className="text-gray-900 font-semibold">
                        {getRoom()?.room_code || getRoom()?.room_name || 'N/A'}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-start">
                    <Ionicons name="person-outline" size={18} color="#4b5563" />
                    <View className="ml-3 flex-1">
                      <Text className="text-gray-500 text-xs mb-1">Giảng viên</Text>
                      <Text className="text-gray-900 font-semibold">
                        {getPersonnel()?.full_name || 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Reason Card */}
              <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-200">
                <View className="flex-row items-center mb-3">
                  <Ionicons name={getReasonIcon(selectedRequest.reason_type)} size={24} color="#2563eb" />
                  <Text className="text-gray-900 font-bold text-lg ml-2">Lý do nghỉ</Text>
                </View>
                
                <View className="bg-blue-50 rounded-xl px-4 py-2 mb-3">
                  <Text className="text-blue-700 font-semibold">{getReasonLabel(selectedRequest.reason_type)}</Text>
                </View>

                <Text className="text-gray-700 leading-6">{selectedRequest.note || 'Không có ghi chú'}</Text>
              </View>

              {/* Attachments Card */}
              <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-200">
                <View className="flex-row items-center mb-3">
                  <Ionicons name="attach" size={24} color="#2563eb" />
                  <Text className="text-gray-900 font-bold text-lg ml-2">
                    Minh chứng đính kèm ({selectedRequest.attachments?.length || 0})
                  </Text>
                </View>

                {(selectedRequest.attachments || []).map((attachment, index) => {
                  const imageUrl = attachment.url || attachment.uri;
                  const fileName = attachment.originalName || attachment.name || 'Tệp đính kèm';
                  return (
                    <TouchableOpacity
                      key={attachment.id || index}
                      className="bg-gray-50 rounded-xl p-3 mb-2 flex-row items-center"
                      onPress={() => handleViewImage(attachment)}
                    >
                      <View className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 mr-3">
                        {imageUrl ? (
                          <Image
                            source={{ uri: imageUrl }}
                            className="w-full h-full"
                            resizeMode="cover"
                          />
                        ) : (
                          <View className="w-full h-full items-center justify-center">
                            <Ionicons name="document" size={24} color="#9ca3af" />
                          </View>
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-900 font-semibold mb-1" numberOfLines={1}>
                          {fileName}
                        </Text>
                        <Text className="text-gray-500 text-xs">Nhấn để xem chi tiết</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                  );
                })}
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
                      {formatDateTime(selectedRequest.created_at)}
                    </Text>
                  </View>

                  {selectedRequest.reviewed_at && (
                    <>
                      <View className="flex-row justify-between py-2 border-b border-gray-100">
                        <Text className="text-gray-600">Ngày duyệt</Text>
                        <Text className="text-gray-900 font-semibold">
                          {formatDateTime(selectedRequest.reviewed_at)}
                        </Text>
                      </View>

                      <View className="flex-row justify-between py-2">
                        <Text className="text-gray-600">Người duyệt</Text>
                        <Text className="text-gray-900 font-semibold">
                          {getPersonnel()?.full_name || 'Giảng viên'}
                        </Text>
                      </View>
                    </>
                  )}
                </View>
              </View>

              {/* Rejection Reason (if rejected) */}
              {selectedRequest.status === 'rejected' && selectedRequest.rejected_reason && (
                <View className="bg-red-50 rounded-2xl p-4 mb-4 border border-red-200">
                  <View className="flex-row items-center mb-3">
                    <Ionicons name="close-circle" size={24} color="#dc2626" />
                    <Text className="text-red-900 font-bold text-lg ml-2">Lý do từ chối</Text>
                  </View>
                  <Text className="text-red-800 leading-6">{selectedRequest.rejected_reason}</Text>
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
                  onPress={handleCancelRequest}
                  disabled={cancelLoading}
                  className={`rounded-xl py-3 items-center flex-row justify-center ${cancelLoading ? 'bg-gray-400' : 'bg-red-500'}`}
                >
                  {cancelLoading ? (
                    <>
                      <ActivityIndicator size="small" color="white" />
                      <Text className="text-white font-bold text-base ml-2">Đang hủy...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="trash" size={20} color="white" />
                      <Text className="text-white font-bold text-base ml-2">Hủy yêu cầu</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {/* Image Viewer Modal */}
        <ImageViewerModal
          visible={showImageModal}
          onClose={() => setShowImageModal(false)}
          selectedImage={selectedImage}
          screenWidth={SCREEN_WIDTH}
        />
      </SafeAreaView>
    </Modal>
  );
};

export default LeaveRequestDetailModal;
