import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ReasonPickerModal = ({
  visible,
  onClose,
  reasonTypes,
  reasonType,
  setReasonType,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 bg-black/50 justify-end"
      >
        <View className="bg-white rounded-t-3xl p-6">
          <Text className="text-gray-900 text-lg font-bold mb-4">Chọn lý do nghỉ</Text>
          {reasonTypes.map((type) => (
            <TouchableOpacity
              key={type.value}
              onPress={() => {
                setReasonType(type.value);
                onClose();
              }}
              className={`flex-row items-center p-4 rounded-xl mb-2 ${
                reasonType === type.value ? 'bg-blue-50' : 'bg-gray-50'
              }`}
            >
              <Ionicons
                name={type.icon}
                size={24}
                color={reasonType === type.value ? '#2563eb' : '#6b7280'}
              />
              <Text
                className={`ml-3 text-base ${
                  reasonType === type.value ? 'text-blue-600 font-bold' : 'text-gray-900'
                }`}
              >
                {type.label}
              </Text>
              {reasonType === type.value && (
                <Ionicons name="checkmark-circle" size={20} color="#2563eb" className="ml-auto" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export default ReasonPickerModal;
