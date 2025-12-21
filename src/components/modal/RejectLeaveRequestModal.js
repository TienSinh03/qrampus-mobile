import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RejectLeaveRequestModal = ({
  visible,
  onClose,
  rejectReason,
  setRejectReason,
  handleReject,
  isProcessing,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl">
          <View className="px-6 py-4 border-b border-gray-200">
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-900 text-xl font-bold">Từ chối đơn</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="px-6 py-4">
            <Text className="text-gray-700 mb-3">Vui lòng nhập lý do từ chối để sinh viên hiểu rõ:</Text>

            <TextInput
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder="Ví dụ: Minh chứng không rõ ràng, cần bổ sung..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              className="bg-gray-50 rounded-xl p-4 text-gray-900 mb-2"
              style={{
                height: 120,
                textAlignVertical: 'top',
                borderWidth: 1,
                borderColor: '#e5e7eb',
              }}
            />

            <Text className="text-gray-500 text-xs mb-4">
              {rejectReason.length}/500 ký tự (tối thiểu 10 ký tự)
            </Text>

            <TouchableOpacity
              onPress={handleReject}
              disabled={rejectReason.trim().length < 10 || isProcessing}
              className={`rounded-xl py-4 items-center ${
                rejectReason.trim().length < 10 ? 'bg-gray-300' : 'bg-red-500'
              }`}
            >
              <Text className="text-white font-bold text-base">
                {isProcessing ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default RejectLeaveRequestModal;
