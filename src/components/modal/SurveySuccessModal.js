import React from 'react';
import {
  View,
  Text,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SurveySuccessModal = ({ 
  visible, 
  onClose,
  width 
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 items-center justify-center">
        <View className="bg-white rounded-3xl p-8 mx-8" style={{ width: width * 0.85 }}>
          <View className="items-center">
            <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="checkmark-circle" size={60} color="#10b981" />
            </View>
            
            <Text className="text-gray-900 font-bold text-2xl mb-2 text-center">Cảm ơn đánh giá!</Text>
            
            <Text className="text-gray-600 text-base text-center leading-6">
              Phản hồi của bạn rất quan trọng và sẽ giúp chúng tôi cải thiện chất lượng giảng dạy.
            </Text>

            <View className="w-full bg-green-50 rounded-xl p-4 mt-4">
              <View className="flex-row items-center justify-center">
                <Ionicons name="trophy" size={24} color="#10b981" />
                <Text className="text-green-700 font-bold text-base ml-2">
                  +5 điểm tích cực
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SurveySuccessModal;
