import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

const CreateLeaveRequestModal = ({
  visible,
  onClose,
  selectedSchedule,
  reasonType,
  reasonTypes,
  setShowReasonPicker,
  note,
  setNote,
  attachments,
  removeAttachment,
  takePhoto,
  pickImage,
  handleSubmit,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar style="dark" />

        {/* Modal Header */}
        <View className="px-6 py-4 border-b border-gray-200">
          <View className="flex-row items-center justify-between">
            <Text className="text-gray-900 text-xl font-bold">Đơn xin nghỉ phép</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
          {/* Selected Schedule Info */}
          {selectedSchedule && (
            <View className="bg-blue-50 rounded-xl p-4 mb-4">
              <Text className="text-gray-900 font-bold mb-1">
                {selectedSchedule.courseName}
              </Text>
              <Text className="text-gray-600 text-sm">
                {selectedSchedule.dayOfWeek}, {selectedSchedule.date} • {selectedSchedule.startTime} - {selectedSchedule.endTime}
              </Text>
            </View>
          )}

          {/* Reason Type */}
          <Text className="text-gray-900 font-bold mb-2">
            Lý do nghỉ <Text className="text-red-500">*</Text>
          </Text>
          <TouchableOpacity
            onPress={() => setShowReasonPicker(true)}
            className="bg-gray-50 rounded-xl px-4 py-3 flex-row items-center justify-between mb-4"
          >
            <View className="flex-row items-center">
              <Ionicons
                name={reasonTypes.find(r => r.value === reasonType)?.icon}
                size={20}
                color="#2563eb"
              />
              <Text className="text-gray-900 ml-3">
                {reasonTypes.find(r => r.value === reasonType)?.label}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color="#6b7280" />
          </TouchableOpacity>

          {/* Note */}
          <Text className="text-gray-900 font-bold mb-2">
            Ghi chú chi tiết <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Mô tả chi tiết lý do nghỉ (tối thiểu 10 ký tự, tối đa 500 ký tự)"
            multiline
            numberOfLines={4}
            maxLength={500}
            className="bg-gray-50 rounded-xl px-4 py-3 text-gray-900 mb-2"
            style={{ textAlignVertical: 'top' }}
          />
          <Text className="text-gray-500 text-xs text-right mb-4">
            {note.length}/500 ký tự
          </Text>

          {/* Attachments */}
          <Text className="text-gray-900 font-bold mb-2">
            Minh chứng <Text className="text-red-500">*</Text>
          </Text>
          <Text className="text-gray-500 text-sm mb-3">
            Tải lên ảnh giấy xin phép, giấy khám bệnh... (JPG, PNG, tối đa 5MB/tệp, tối đa 3 tệp)
          </Text>

          {/* Attachment List */}
          {attachments.map((attachment, index) => (
            <View
              key={index}
              className="bg-gray-50 rounded-xl p-3 flex-row items-center justify-between mb-2"
            >
              <Image
                source={{ uri: attachment.uri }}
                className="w-16 h-16 rounded-lg"
                resizeMode="cover"
              />
              <View className="flex-1 ml-3">
                <Text className="text-gray-900 font-semibold" numberOfLines={1}>
                  {attachment.name}
                </Text>
                <Text className="text-gray-500 text-xs">
                  {attachment.size ? `${(attachment.size / 1024).toFixed(0)} KB` : 'N/A'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => removeAttachment(index)}>
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          ))}

          {/* Upload Buttons */}
          {attachments.length < 3 && (
            <View className="flex-row gap-2 mb-6">
              <TouchableOpacity
                onPress={takePhoto}
                className="flex-1 bg-blue-600 rounded-xl py-3 flex-row items-center justify-center"
              >
                <Ionicons name="camera" size={20} color="white" />
                <Text className="text-white font-bold ml-2">Chụp ảnh</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={pickImage}
                className="flex-1 bg-blue-600 rounded-xl py-3 flex-row items-center justify-center"
              >
                <Ionicons name="images" size={20} color="white" />
                <Text className="text-white font-bold ml-2">Thư viện</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Submit Button */}
        <View className="px-6 py-4 border-t border-gray-200">
          <TouchableOpacity
            onPress={handleSubmit}
            className="bg-blue-600 rounded-xl py-4 flex-row items-center justify-center"
            style={{
              shadowColor: '#2563eb',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Ionicons name="send" size={20} color="white" />
            <Text className="text-white font-bold text-base ml-2">Gửi đơn</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default CreateLeaveRequestModal;
