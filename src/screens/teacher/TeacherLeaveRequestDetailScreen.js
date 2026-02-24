import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import RejectLeaveRequestModal from '../../components/modal/RejectLeaveRequestModal';
import ImageViewerModal from '../../components/modal/ImageViewerModal';
import { approveLeaveRequestThunk, rejectLeaveRequestThunk } from '../../features/leave-request/leaveRequestThunk';
import { resetActionState } from '../../features/leave-request/leaveRequestSlice';
import { reasonTypes } from '../../utils/reason.type';
import { DAYMAPPING } from '../../utils/day.mapping';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Helper function to compute hours remaining until class starts
const computeHoursRemaining = (classDate, startHour) => {
  if (!classDate || !startHour) return null;
  try {
    const [hours, minutes] = startHour.split(':').map(Number);
    const classDateTime = new Date(classDate);
    classDateTime.setHours(hours, minutes, 0, 0);
    const now = new Date();
    const diffMs = classDateTime - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    return diffHours > 0 ? diffHours : 0;
  } catch (e) {
    return null;
  }
};

// Helper function to format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('vi-VN');
  } catch (e) {
    return dateString;
  }
};

// Helper function to format datetime for display
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleString('vi-VN');
  } catch (e) {
    return dateString;
  }
};

const TeacherLeaveRequestDetailScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { actionLoading, actionError, actionSuccess } = useSelector((state) => state.leaveRequests);
  
  const { request } = route.params;
  
  // Compute hoursRemaining if not provided
  const hoursRemaining = request.hoursRemaining ?? computeHoursRemaining(
    request.classSession?.class_date,
    request.classSession?.start_hour
  );
  
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Handle action success
  useEffect(() => {
    if (actionSuccess) {
      setShowRejectModal(false);
      dispatch(resetActionState());
      navigation.goBack();
    }
  }, [actionSuccess]);

  // Handle action error
  useEffect(() => {
    if (actionError) {
      Alert.alert('Lỗi', actionError);
      setShowRejectModal(false);
      dispatch(resetActionState());
    }
  }, [actionError]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-700';
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ duyệt';
      case 'approved':
        return 'Đã duyệt';
      case 'rejected':
        return 'Đã từ chối';
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return 'time';
      case 'approved':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const getReasonType = (reasonType) => {
    const reason = reasonTypes.find(r => r.value === reasonType);
    return reason ? reason.label : reasonType || 'Không rõ lý do';
  };

  const getReasonIcon = (reasonType) => {
    const reason = reasonTypes.find(r => r.value === reasonType);
    return reason ? reason.icon : 'help-circle';
  };

  const handleApprove = async () => {
    const studentName = request.student?.full_name || 'sinh viên';
    Alert.alert(
      'Xác nhận duyệt đơn',
      `Bạn có chắc chắn muốn duyệt đơn xin nghỉ phép của ${studentName}?\n\nTrạng thái điểm danh sẽ tự động cập nhật từ "Vắng" → "Vắng có phép".`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Duyệt',
          style: 'default',
          onPress: () => {
            dispatch(approveLeaveRequestThunk({ id: request.id }));
          },
        },
      ]
    );
  };

  const handleReject = () => {
    if (rejectReason.trim().length < 10) {
      Alert.alert('Lỗi', 'Vui lòng nhập lý do từ chối (tối thiểu 10 ký tự)');
      return;
    }

    const studentName = request.student?.full_name || 'sinh viên';
    Alert.alert(
      'Xác nhận từ chối',
      `Bạn có chắc chắn muốn từ chối đơn xin nghỉ phép của ${studentName}?`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Từ chối',
          style: 'destructive',
          onPress: () => {
            dispatch(rejectLeaveRequestThunk({ id: request.id, rejectReason: rejectReason.trim() }));
          },
        },
      ]
    );
  };

  const handleViewImage = (attachment) => {
    const mimeType = attachment.mimetype || attachment.type || '';
    if (mimeType.startsWith('image/') || mimeType === 'image') {
      setSelectedImage(attachment);
      setShowImageModal(true);
    } else if (mimeType.includes('pdf')) {
      Alert.alert('PDF Viewer', 'Chức năng xem PDF đang được phát triển');
    }
  };

  const isUrgent = request.status === 'pending' && hoursRemaining != null && hoursRemaining < 12;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      {/* Header */}
      <LinearGradient
        colors={['#7c3aed', '#8b5cf6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 py-4"
      >
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold flex-1 ml-4">
            Chi tiết đơn nghỉ phép
          </Text>
          <View className={`px-3 py-1.5 rounded-full ${getStatusColor(request.status)}`}>
            <View className="flex-row items-center">
              <Ionicons name={getStatusIcon(request.status)} size={16} />
              <Text className="text-sm font-semibold ml-1">
                {getStatusText(request.status)}
              </Text>
            </View>
          </View>
        </View>

        {/* Urgent Warning */}
        {isUrgent && (
          <View className="bg-red-500 rounded-xl px-4 py-3 flex-row items-center">
            <Ionicons name="warning" size={20} color="white" />
            <Text className="text-white font-bold text-sm ml-2 flex-1">
              Khẩn cấp! Còn {hoursRemaining || 0}h để duyệt
            </Text>
          </View>
        )}
      </LinearGradient>

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        {/* Student Information */}
        <View className="bg-purple-50 rounded-2xl p-4 mb-4 border-2 border-purple-200">
          <View className="flex-row items-center mb-3">
            <Ionicons name="person" size={24} color="#7c3aed" />
            <Text className="text-gray-900 font-bold text-lg ml-2">Thông tin sinh viên</Text>
          </View>
          
          <View className="flex-row items-center mb-3">
            <View className="w-16 h-16 bg-purple-200 rounded-full items-center justify-center mr-3">
              <Text className="text-purple-700 font-bold text-2xl">
                {(request.student?.full_name || request.studentName || 'S').charAt(0)}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-bold text-lg">{request.student?.full_name || 'Unknown'}</Text>
              <Text className="text-gray-600 text-sm">Mã SV: {request.student?.student_code || 'N/A'}</Text>
            </View>
          </View>

          {/* Contact Actions */}
          <View className="flex-row space-x-2">
            <TouchableOpacity 
              className="flex-1 bg-white rounded-xl py-3 flex-row items-center justify-center border border-purple-300"
              onPress={() => Alert.alert('Gọi điện', `Liên hệ ${request.student?.full_name || 'sinh viên'}`)}
            >
              <Ionicons name="call" size={18} color="#7c3aed" />
              <Text className="text-purple-700 font-semibold text-sm ml-2">Gọi</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-1 bg-white rounded-xl py-3 flex-row items-center justify-center border border-purple-300"
              onPress={() => Alert.alert('Gửi email', `Email đến ${request.student?.full_name || 'sinh viên'}`)}
            >
              <Ionicons name="mail" size={18} color="#7c3aed" />
              <Text className="text-purple-700 font-semibold text-sm ml-2">Email</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Schedule Information */}
        <View className="bg-blue-50 rounded-2xl p-4 mb-4 border border-blue-200">
          <View className="flex-row items-center mb-3">
            <Ionicons name="calendar" size={24} color="#2563eb" />
            <Text className="text-gray-900 font-bold text-lg ml-2">Buổi học xin nghỉ</Text>
          </View>

          <View className="bg-white rounded-xl p-3">
            <View className="flex-row items-center mb-2">
              <View className="bg-blue-100 rounded-lg px-3 py-1 mr-2">
                <Text className="text-blue-700 text-sm font-bold">
                  {request.classSession?.courseSection?.code || 'N/A'}
                </Text>
              </View>
              <Text className="text-gray-900 font-semibold text-base flex-1" numberOfLines={1}>
                {request.classSession?.courseSection?.name || 'Unknown Course'}
              </Text>
            </View>

            <View className="space-y-2">
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                <Text className="text-gray-700 text-sm ml-2">
                  {request.classSession?.class_date ? DAYMAPPING[new Date(request.classSession.class_date).getDay()] : 'N/A'}, {formatDate(request.classSession?.class_date)}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={16} color="#6b7280" />
                <Text className="text-gray-700 text-sm ml-2">
                  {request.classSession?.start_hour || 'N/A'} - {request.classSession?.end_hour || 'N/A'}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="location-outline" size={16} color="#6b7280" />
                <Text className="text-gray-700 text-sm ml-2">
                  Phòng {request.classSession?.room?.room_code || 'N/A'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Reason */}
        <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-200">
          <View className="flex-row items-center mb-3">
            <Ionicons name={getReasonIcon(request.reason_type)} size={24} color="#7c3aed" />
            <Text className="text-gray-900 font-bold text-lg ml-2">Lý do nghỉ</Text>
          </View>

          <View className="bg-purple-50 rounded-xl px-4 py-2 mb-3">
            <Text className="text-purple-700 font-semibold text-base">
              {getReasonType(request.reason_type) || 'Không rõ lý do'}
            </Text>
          </View>

          <Text className="text-gray-700 leading-6">{request.note || 'Không có ghi chú'}</Text>
        </View>

        {/* Attachments */}
        <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-200">
          <View className="flex-row items-center mb-3">
            <Ionicons name="attach" size={24} color="#7c3aed" />
            <Text className="text-gray-900 font-bold text-lg ml-2">
              Minh chứng đính kèm ({request.attachments?.length || 0})
            </Text>
          </View>

          {(request.attachments || []).map((attachment, index) => {
            const mimeType = attachment.mimetype || attachment.type || '';
            const isImage = mimeType.startsWith('image/') || mimeType === 'image';
            return (
            <TouchableOpacity
              key={attachment.id || index}
              onPress={() => handleViewImage(attachment)}
              className="bg-gray-50 rounded-xl p-3 mb-2 flex-row items-center"
            >
              <View className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 mr-3">
                {isImage ? (
                  <Image
                    source={{ uri: attachment.url }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-full items-center justify-center bg-red-100">
                    <Ionicons name="document-text" size={32} color="#dc2626" />
                  </View>
                )}
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-semibold mb-1" numberOfLines={1} ellipsizeMode="tail">
                  {attachment.originalName || attachment.name || 'Tệp đính kèm'}
                </Text>
                <Text className="text-gray-500 text-xs mb-2">
                  {isImage ? 'Ảnh' : 'PDF'}
                </Text>
                <View className="flex-row items-center">
                  <Ionicons name="eye" size={14} color="#7c3aed" />
                  <Text className="text-purple-600 text-sm ml-1 font-semibold">
                    Nhấn để xem
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          )})}
        </View>

        {/* Submission Info */}
        <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-200">
          <View className="flex-row items-center mb-3">
            <Ionicons name="information-circle" size={24} color="#7c3aed" />
            <Text className="text-gray-900 font-bold text-lg ml-2">Thông tin nộp đơn</Text>
          </View>

          <View>
            <View className="flex-row justify-between py-3 border-b border-gray-100">
              <Text className="text-gray-600">Ngày nộp</Text>
              <Text className="text-gray-900 font-semibold">
                {formatDateTime(request.created_at || request.createdAt)}
              </Text>
            </View>

            {(request.reviewed_at || request.reviewedAt) && (
              <View className="flex-row justify-between py-3 border-b border-gray-100">
                <Text className="text-gray-600">Ngày duyệt</Text>
                <Text className="text-gray-900 font-semibold">
                  {formatDateTime(request.reviewed_at || request.reviewedAt)}
                </Text>
              </View>
            )}

            {request.status === 'pending' && hoursRemaining != null && (
              <View className="flex-row justify-between py-3">
                <Text className="text-gray-600">Thời hạn duyệt</Text>
                <Text className={`font-semibold ${
                  hoursRemaining < 12 ? 'text-red-600' : 'text-orange-600'
                }`}>
                  Còn {hoursRemaining}h
                </Text>
              </View>
            )}
          </View>
        </View>

        <View className="h-6" />
      </ScrollView>

      {/* Action Buttons (only for pending status) */}
      {request.status === 'pending' && (
        <View className="px-6 py-4 border-t border-gray-200">
          <View className="flex-row space-x-3">
            <TouchableOpacity
              onPress={() => setShowRejectModal(true)}
              disabled={actionLoading}
              className="flex-1 bg-white rounded-xl py-4 flex-row items-center justify-center border-2 border-red-500"
            >
              <Ionicons name="close-circle" size={22} color="#dc2626" />
              <Text className="text-red-600 font-bold text-base ml-2">Từ chối</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleApprove}
              disabled={actionLoading}
              className="flex-1 bg-green-500 rounded-xl py-4 flex-row items-center justify-center"
              style={{
                shadowColor: '#10b981',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={22} color="white" />
                  <Text className="text-white font-bold text-base ml-2">Duyệt đơn</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Reject Modal */}
      <RejectLeaveRequestModal
        visible={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        handleReject={handleReject}
        isProcessing={actionLoading}
      />

      {/* Image Viewer Modal */}
      <ImageViewerModal
        visible={showImageModal}
        onClose={() => setShowImageModal(false)}
        selectedImage={selectedImage}
        screenWidth={SCREEN_WIDTH}
      />
    </SafeAreaView>
  );
};

export default TeacherLeaveRequestDetailScreen;
