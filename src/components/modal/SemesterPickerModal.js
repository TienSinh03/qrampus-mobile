import React from 'react';
import { Modal, TouchableWithoutFeedback, View, TouchableOpacity, Text} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SemesterPickerModal = ({ visible, onClose, semesters, onSemesterSelect, selectedSemester }) => {

  return (
    <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
    >
        <TouchableWithoutFeedback onPress={onClose}>
          <View className="flex-1 bg-black/40 justify-end">
            <TouchableWithoutFeedback>
              <View className="bg-white rounded-t-3xl px-5 pt-3 pb-8">
                <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-4" />
                <Text className="text-gray-900 text-base font-bold mb-4">Chọn học kỳ</Text>
                {semesters.map((sem, index) => {
                  const isSelected = sem === selectedSemester;
                  return (
                    <TouchableOpacity
                      key={sem}
                      onPress={() => onSemesterSelect(sem)}
                      className={`flex-row items-center py-3.5 ${index < semesters.length - 1 ? 'border-b border-gray-100' : ''}`}
                      activeOpacity={0.6}
                    >
                      <Text className={`flex-1 text-sm ${isSelected ? 'text-sky-600 font-bold' : 'text-gray-700 font-medium'}`}>
                        {sem}
                      </Text>
                      {isSelected && <Ionicons name="checkmark" size={20} color="#0284c7" />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
    </Modal>
  );
};

export default SemesterPickerModal;
