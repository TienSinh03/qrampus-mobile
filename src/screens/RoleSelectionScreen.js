import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

const RoleSelectionScreen = ({ navigation }) => {
  const handleRoleSelect = (role) => {
    navigation.navigate('Login', { role });
  };

  return (
    <LinearGradient
      colors={['#132440', '#9333ea', '#DD7BDF']}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 0 }}
      className="flex-1"
    >
      <StatusBar style="light" />
      <SafeAreaView className="flex-1">
        <View className="flex-1 justify-center items-center px-8">
          {/* Header */}
          <View className="items-center mb-12">
            <Text className="text-6xl mb-6">🎯</Text>
            <Text className="text-white text-4xl font-bold text-center mb-4">Chọn vai trò</Text>
            <Text className="text-white/90 text-lg text-center">Vui lòng chọn vai trò của bạn để tiếp tục</Text>
          </View>

          {/* Role Options */}
          <View className="w-full">
            <TouchableOpacity
              onPress={() => handleRoleSelect('student')}
              className="bg-white rounded-3xl p-8 mb-6"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
              activeOpacity={0.8}
            >
              <View className="items-center">
                <View className="bg-blue-100 w-20 h-20 rounded-full items-center justify-center mb-4">
                  <Text className="text-5xl">🎓</Text>
                </View>
                <Text className="text-blue-600 text-2xl font-bold mb-2">Sinh viên</Text>
                <Text className="text-gray-600 text-center text-base">Quét QR code để điểm danh và xem lịch học của bạn</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleRoleSelect('teacher')}
              className="bg-white rounded-3xl p-8"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
              activeOpacity={0.8}
            >
              <View className="items-center">
                <View className="bg-purple-100 w-20 h-20 rounded-full items-center justify-center mb-4">
                  <Text className="text-5xl">👨‍🏫</Text>
                </View>
                <Text className="text-purple-600 text-2xl font-bold mb-2">Giảng viên</Text>
                <Text className="text-gray-600 text-center text-base">Tạo QR code điểm danh và quản lý lớp học</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Back Button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mt-8 bg-white/20 px-6 py-3 rounded-full"
          >
            <Text className="text-white text-base font-semibold">← Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default RoleSelectionScreen;
