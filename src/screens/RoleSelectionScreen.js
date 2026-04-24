import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Import Vector Icons từ Lucide
import { User, GraduationCap, ChevronRight, ArrowLeft } from 'lucide-react-native';

const RoleSelectionScreen = ({ navigation }) => {
  const handleRoleSelect = (role) => {
    navigation.navigate('Login', { role });
  };

  return (
    // Màu nền trắng khói (off-white) chuyên nghiệp, tối giản
    <View className="flex-1 bg-[#FDFDFD]">
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1 px-6">
        
        {/* Thanh điều hướng trên cùng (Header) */}
        <View className="flex-row items-center h-14 mb-8">
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            className="w-10 h-10 items-center justify-center"
          >
            {/* Sử dụng Icon Vector thay vì ảnh */}
            <ArrowLeft color="#1E293B" size={24} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

        <View className="flex-1 justify-center">
          {/* Section Tiêu đề */}
          <View className="mb-16">
            <Text className="text-[#1E293B] text-4xl font-extrabold tracking-tighter">
              Bạn là...
            </Text>
            <Text className="text-gray-500 text-lg mt-2 font-normal leading-6">
              Vui lòng chọn một vai trò để tiếp tục.
            </Text>
          </View>

          {/* Role Options - Các thẻ lựa chọn */}
          <View className="space-y-6">
            
            {/* Thẻ Sinh viên */}
            <TouchableOpacity
              onPress={() => handleRoleSelect('student')}
              activeOpacity={0.7}
              // Điều chỉnh Shadow nhẹ nhàng và thực tế hơn
              className="bg-white rounded-3xl p-6 flex-row items-center shadow-xl shadow-gray-200/50 border border-gray-100"
            >
              {/* BỎ BO GỐC: Icon đứng độc lập trên nền trắng */}
              <View className="mr-5">
                <GraduationCap 
                  color="#2563EB" // Màu xanh đậm chuẩn
                  size={48} // Kích thước lớn làm điểm nhấn
                  strokeWidth={1.2} // Nét mảnh tinh tế
                />
              </View>
              <View className="flex-1">
                <Text className="text-[#1E293B] text-xl font-bold">Sinh viên</Text>
                <Text className="text-gray-500 text-sm mt-1">Điểm danh nhanh bằng mã QR</Text>
              </View>
              <ChevronRight color="#CBD5E1" size={20} />
            </TouchableOpacity>

            {/* Thẻ Giảng viên */}
            <TouchableOpacity
              onPress={() => handleRoleSelect('teacher')}
              activeOpacity={0.7}
              className="bg-white rounded-3xl p-6 flex-row items-center shadow-xl shadow-gray-200/50 border border-gray-100"
            >
              <View className="mr-5">
                <User 
                  color="#1E293B" 
                  size={48} 
                  strokeWidth={1.2} 
                />
              </View>
              <View className="flex-1">
                <Text className="text-[#1E293B] text-xl font-bold">Giảng viên</Text>
                <Text className="text-gray-500 text-sm mt-1">Quản lý lớp học & điểm danh</Text>
              </View>
              <ChevronRight color="#CBD5E1" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View className="pb-10 items-center">
          <TouchableOpacity>
            <Text className="text-gray-400 text-sm font-medium">Bạn gặp sự cố? Liên hệ hỗ trợ</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
};

export default RoleSelectionScreen;