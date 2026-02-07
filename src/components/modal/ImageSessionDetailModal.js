import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { createImageSession } from '../../features/imageSession/imageSessionThunks';

const ImageSessionDetailModal = ({ 
  visible, 
  onClose, 
  session,
  classSessionId, // ID của class session để tạo image session mới
  mode = 'view', // 'view' hoặc 'create'
}) => {
  const dispatch = useDispatch();
  const [captureType, setCaptureType] = useState('manual');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateSession = async () => {
    if (!classSessionId) {
      alert('Thiếu thông tin class session ID');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await dispatch(
        createImageSession({
          class_session_id: classSessionId,
          capture_type: captureType,
          note: note.trim() || null,
        })
      ).unwrap();

      alert('Tạo bộ sưu tập ảnh thành công!');
      onClose();
      // Reset form
      setNote('');
      setCaptureType('manual');
    } catch (error) {
      alert(error || 'Có lỗi xảy ra khi tạo bộ sưu tập ảnh');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'Chưa có';
    const date = new Date(dateTimeString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Mode: Create new image session
  if (mode === 'create') {
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
              <Text className="text-gray-900 text-xl font-bold">Tạo bộ sưu tập ảnh</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Capture Type Selection */}
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">Loại chụp ảnh</Text>
                <View className="flex-row">
                  <TouchableOpacity
                    onPress={() => setCaptureType('manual')}
                    className={`flex-1 mr-2 p-4 rounded-xl border-2 ${
                      captureType === 'manual'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <Ionicons
                      name="hand-left"
                      size={24}
                      color={captureType === 'manual' ? '#7c3aed' : '#9ca3af'}
                    />
                    <Text
                      className={`mt-2 font-semibold ${
                        captureType === 'manual' ? 'text-purple-700' : 'text-gray-600'
                      }`}
                    >
                      Thủ công
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1">
                      Chụp ảnh thủ công
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setCaptureType('auto')}
                    className={`flex-1 ml-2 p-4 rounded-xl border-2 ${
                      captureType === 'auto'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <Ionicons
                      name="flash"
                      size={24}
                      color={captureType === 'auto' ? '#7c3aed' : '#9ca3af'}
                    />
                    <Text
                      className={`mt-2 font-semibold ${
                        captureType === 'auto' ? 'text-purple-700' : 'text-gray-600'
                      }`}
                    >
                      Tự động
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1">
                      Chụp tự động
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Note Input */}
              <View className="mb-4">
                <Text className="text-gray-700 font-semibold mb-2">Ghi chú (Tùy chọn)</Text>
                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="Nhập ghi chú về bộ sưu tập ảnh này..."
                  multiline
                  numberOfLines={4}
                  className="bg-gray-50 rounded-xl p-4 text-gray-900"
                  style={{ textAlignVertical: 'top' }}
                  maxLength={500}
                />
                <Text className="text-gray-400 text-xs mt-1 text-right">
                  {note.length}/500
                </Text>
              </View>

              {/* Create Button */}
              <TouchableOpacity
                onPress={handleCreateSession}
                disabled={isSubmitting}
                className={`p-4 rounded-xl items-center ${
                  isSubmitting ? 'bg-gray-300' : 'bg-purple-600'
                }`}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-base">
                    Tạo bộ sưu tập ảnh
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  }

  // Mode: View existing session
  // Mode: View existing session
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
            <Text className="text-gray-900 text-xl font-bold">Chi tiết bộ sưu tập ảnh</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {session && (
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Session Info */}
              <View className="bg-gray-50 rounded-xl p-4 mb-4">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-gray-600 text-sm">ID Phiên</Text>
                  <Text className="text-gray-900 font-mono text-xs">
                    {session.id?.slice(0, 8)}...
                  </Text>
                </View>

                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-gray-600 text-sm">Loại chụp</Text>
                  <View className="bg-purple-100 px-3 py-1 rounded-full">
                    <Text className="text-purple-700 font-semibold text-xs">
                      {session.captureType === 'manual' ? 'Thủ công' : 'Tự động'}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-gray-600 text-sm">Thời gian bắt đầu</Text>
                  <Text className="text-gray-900 font-semibold">
                    {formatDateTime(session.startedAt)}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-gray-600 text-sm">Thời gian kết thúc</Text>
                  <Text className="text-gray-900 font-semibold">
                    {formatDateTime(session.endedAt)}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-600 text-sm">Trạng thái</Text>
                  <View
                    className={`px-3 py-1 rounded-full ${
                      session.endedAt ? 'bg-gray-100' : 'bg-green-100'
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        session.endedAt ? 'text-gray-700' : 'text-green-700'
                      }`}
                    >
                      {session.endedAt ? 'Đã kết thúc' : 'Đang hoạt động'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Note */}
              {session.note && (
                <View className="bg-white rounded-xl p-4 mb-4" style={{ elevation: 2 }}>
                  <Text className="text-gray-900 font-bold mb-2">Ghi chú</Text>
                  <Text className="text-gray-700 leading-5">{session.note}</Text>
                </View>
              )}

              {/* Class Session Info */}
              {session.courseName && (
                <View className="bg-purple-50 rounded-xl p-4 mb-4">
                  <Text className="text-gray-900 font-bold mb-3">Thông tin lớp học</Text>
                  
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="book" size={16} color="#7c3aed" />
                    <Text className="ml-2 text-gray-700">
                      {session.courseName}
                    </Text>
                  </View>

                  {session.courseCode && (
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="code" size={16} color="#7c3aed" />
                      <Text className="ml-2 text-gray-700">
                        Mã: {session.courseCode}
                      </Text>
                    </View>
                  )}

                  {session.classDate && (
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="calendar" size={16} color="#7c3aed" />
                      <Text className="ml-2 text-gray-700">
                        Ngày: {session.classDate}
                      </Text>
                    </View>
                  )}

                  {session.startHour && session.endHour && (
                    <View className="flex-row items-center">
                      <Ionicons name="time" size={16} color="#7c3aed" />
                      <Text className="ml-2 text-gray-700">
                        Giờ: {session.startHour} - {session.endHour}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default ImageSessionDetailModal;
