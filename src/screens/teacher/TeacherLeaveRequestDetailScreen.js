import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import RejectLeaveRequestModal from '../../components/modal/RejectLeaveRequestModal';
import ImageViewerModal from '../../components/modal/ImageViewerModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TeacherLeaveRequestDetailScreen = ({ navigation, route }) => {
  const { request } = route.params;
  
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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

  const getReasonIcon = (reasonType) => {
    switch (reasonType) {
      case 'sick':
        return 'medkit';
      case 'family':
        return 'home';
      case 'school_activity':
        return 'school';
      default:
        return 'ellipsis-horizontal';
    }
  };

  const handleApprove = async () => {
    Alert.alert(
      'Xác nhận duyệt đơn',
      `Bạn có chắc chắn muốn duyệt đơn xin nghỉ phép của ${request.studentName}?\n\nTrạng thái điểm danh sẽ tự động cập nhật từ "Vắng" → "Vắng có phép".`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Duyệt',
          style: 'default',
          onPress: async () => {
            try {
              setIsProcessing(true);
              
              // Simulate API call
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              Alert.alert('Thành công', 'Đã duyệt đơn xin nghỉ phép', [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể duyệt đơn. Vui lòng thử lại.');
            } finally {
              setIsProcessing(false);
            }
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

    Alert.alert(
      'Xác nhận từ chối',
      `Bạn có chắc chắn muốn từ chối đơn xin nghỉ phép của ${request.studentName}?`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Từ chối',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsProcessing(true);
              
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              setShowRejectModal(false);
              Alert.alert('Đã từ chối', 'Đơn xin nghỉ phép đã bị từ chối', [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể từ chối đơn. Vui lòng thử lại.');
            } finally {
              setIsProcessing(false);
            }
          },
        },
      ]
    );
  };

  const handleViewImage = (attachment) => {
    if (attachment.type === 'image') {
      setSelectedImage(attachment);
      setShowImageModal(true);
    } else if (attachment.type === 'pdf') {
      Alert.alert('PDF Viewer', 'Chức năng xem PDF đang được phát triển');
    }
  };

  const isUrgent = request.status === 'pending' && request.hoursRemaining < 12;

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
              Khẩn cấp! Còn {request.hoursRemaining}h để duyệt
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
                {request.studentName.charAt(0)}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-gray-900 font-bold text-lg">{request.studentName}</Text>
              <Text className="text-gray-600 text-sm">Mã SV: {request.studentId}</Text>
            </View>
          </View>

          {/* Contact Actions */}
          <View className="flex-row space-x-2">
            <TouchableOpacity 
              className="flex-1 bg-white rounded-xl py-3 flex-row items-center justify-center border border-purple-300"
              onPress={() => Alert.alert('Gọi điện', `Liên hệ ${request.studentName}`)}
            >
              <Ionicons name="call" size={18} color="#7c3aed" />
              <Text className="text-purple-700 font-semibold text-sm ml-2">Gọi</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-1 bg-white rounded-xl py-3 flex-row items-center justify-center border border-purple-300"
              onPress={() => Alert.alert('Gửi email', `Email đến ${request.studentName}`)}
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
                  {request.schedule.courseCode}
                </Text>
              </View>
              <Text className="text-gray-900 font-semibold text-base flex-1" numberOfLines={1}>
                {request.schedule.courseName}
              </Text>
            </View>

            <View className="space-y-2">
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={16} color="#6b7280" />
                <Text className="text-gray-700 text-sm ml-2">
                  {request.schedule.dayOfWeek}, {request.schedule.date}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={16} color="#6b7280" />
                <Text className="text-gray-700 text-sm ml-2">
                  {request.schedule.startTime} - {request.schedule.endTime}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="location-outline" size={16} color="#6b7280" />
                <Text className="text-gray-700 text-sm ml-2">
                  Phòng {request.schedule.room}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Reason */}
        <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-200">
          <View className="flex-row items-center mb-3">
            <Ionicons name={getReasonIcon(request.reasonType)} size={24} color="#7c3aed" />
            <Text className="text-gray-900 font-bold text-lg ml-2">Lý do nghỉ</Text>
          </View>

          <View className="bg-purple-50 rounded-xl px-4 py-2 mb-3">
            <Text className="text-purple-700 font-semibold text-base">
              {request.reasonLabel}
            </Text>
          </View>

          <Text className="text-gray-700 leading-6">{request.note}</Text>
        </View>

        {/* Attachments */}
        <View className="bg-white rounded-2xl p-4 mb-4 border border-gray-200">
          <View className="flex-row items-center mb-3">
            <Ionicons name="attach" size={24} color="#7c3aed" />
            <Text className="text-gray-900 font-bold text-lg ml-2">
              Minh chứng đính kèm ({request.attachments.length})
            </Text>
          </View>

          {request.attachments.map((attachment) => (
            <TouchableOpacity
              key={attachment.id}
              onPress={() => handleViewImage(attachment)}
              className="bg-gray-50 rounded-xl p-3 mb-2 flex-row items-center"
            >
              <View className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 mr-3">
                {attachment.type === 'image' ? (
                  <Image
                    source={{ uri: attachment.uri }}
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
                <Text className="text-gray-900 font-semibold mb-1" numberOfLines={1}>
                  {attachment.name}
                </Text>
                <Text className="text-gray-500 text-xs mb-2">
                  {attachment.type === 'image' ? 'Ảnh' : 'PDF'}
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
          ))}
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
                {new Date(request.createdAt).toLocaleString('vi-VN')}
              </Text>
            </View>

            {request.reviewedAt && (
              <>
                <View className="flex-row justify-between py-3 border-b border-gray-100">
                  <Text className="text-gray-600">Ngày duyệt</Text>
                  <Text className="text-gray-900 font-semibold">
                    {new Date(request.reviewedAt).toLocaleString('vi-VN')}
                  </Text>
                </View>
              </>
            )}

            {request.status === 'pending' && (
              <View className="flex-row justify-between py-3">
                <Text className="text-gray-600">Thời hạn duyệt</Text>
                <Text className={`font-semibold ${
                  request.hoursRemaining < 12 ? 'text-red-600' : 'text-orange-600'
                }`}>
                  Còn {request.hoursRemaining}h
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
              disabled={isProcessing}
              className="flex-1 bg-white rounded-xl py-4 flex-row items-center justify-center border-2 border-red-500"
            >
              <Ionicons name="close-circle" size={22} color="#dc2626" />
              <Text className="text-red-600 font-bold text-base ml-2">Từ chối</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleApprove}
              disabled={isProcessing}
              className="flex-1 bg-green-500 rounded-xl py-4 flex-row items-center justify-center"
              style={{
                shadowColor: '#10b981',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              <Ionicons name="checkmark-circle" size={22} color="white" />
              <Text className="text-white font-bold text-base ml-2">
                {isProcessing ? 'Đang duyệt...' : 'Duyệt đơn'}
              </Text>
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
        isProcessing={isProcessing}
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
