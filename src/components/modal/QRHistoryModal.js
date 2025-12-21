import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const QRHistoryModal = ({
  visible,
  onClose,
  qrHistory,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-white rounded-t-3xl p-6" style={{ maxHeight: '80%' }}>
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-900 text-xl font-bold">Lịch sử điểm danh</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {qrHistory.map((session, index) => (
              <View
                key={session.id}
                className={`bg-gray-50 rounded-xl p-4 mb-3 ${
                  index === 0 ? 'border-2 border-purple-200' : ''
                }`}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-gray-900 font-bold">
                    {session.date} • {session.time}
                  </Text>
                  {index === 0 && (
                    <View className="bg-purple-100 px-2 py-1 rounded-full">
                      <Text className="text-purple-700 text-xs font-semibold">Gần nhất</Text>
                    </View>
                  )}
                </View>

                <Text className="text-gray-600 text-sm mb-2">
                  Tạo bởi: <Text className="font-semibold">{session.createdBy}</Text>
                </Text>

                <View className="flex-row items-center">
                  <View className="flex-row items-center mr-4">
                    <Ionicons name="time-outline" size={14} color="#6b7280" />
                    <Text className="text-gray-600 text-xs ml-1">
                      {session.duration}p
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons name="people-outline" size={14} color="#6b7280" />
                    <Text className="text-gray-600 text-xs ml-1">
                      {session.attendanceCount}/{session.totalStudents}
                    </Text>
                  </View>
                  <View className="flex-1" />
                  <Text
                    className={`font-semibold ${
                      (session.attendanceCount / session.totalStudents) >= 2/3
                        ? 'text-green-600'
                        : 'text-orange-600'
                    }`}
                  >
                    {Math.round((session.attendanceCount / session.totalStudents) * 100)}%
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default QRHistoryModal;
