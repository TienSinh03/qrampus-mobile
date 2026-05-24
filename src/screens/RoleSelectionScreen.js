import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const RoleSelectionScreen = ({ navigation }) => {
  const handleRoleSelect = (role) => {
    navigation.navigate('Login', { role });
  };

  return (
    <View className="flex-1 bg-[#EBEBE3]">
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1 px-6">
        
        {/* Header Section */}
        <View className="mt-10 mb-8 px-2">
          <Text className="text-[#1A1A1A] text-[32px] font-bold leading-[48px] tracking-tight text-justify">
            Chào mừng bạn đến với hệ thống điểm danh
          </Text>
          {/* Mũi tên cong vẽ tay (Nếu có ảnh SVG/PNG thì thay vào đây) */}
          <View className="ml-24 mt-2">
            <Text className="text-3xl rotate-[20deg]">⤵</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          
          {/* Card: Sinh viên (Nằm bên trái) */}
          <TouchableOpacity
            onPress={() => handleRoleSelect('student')}
            activeOpacity={0.9}
            className="relative bg-[#2563eb]  h-48 mb-12 flex-row overflow-visible  border-black/10"
          >
            {/* Hình minh họa - Vị trí tuyệt đối để tràn viền như mẫu */}
            <View className="absolute -top-6 left-4 w-32 h-52 justify-end">
               {/* Thay Source bằng require('./path-to-your-student-img.png') */}
               <View className="w-full h-full bg-slate-200/20 rounded-b-full items-center justify-center">
                  <Text className="text-5xl">👩‍🎓</Text>
               </View>
            </View>
            
            <View className="flex-1 justify-center items-end pr-8">
              <Text className="text-white text-2xl font-bold text-right">Sinh viên</Text>
              <Text className="text-white/80 text-sm text-right mt-1">
                Học tập &{"\n"}Điểm danh QR
              </Text>
            </View>
          </TouchableOpacity>


          {/* Card: Giảng viên (Nằm bên phải) */}
          <TouchableOpacity
            onPress={() => handleRoleSelect('teacher')}
            activeOpacity={0.9}
            className="relative bg-[#0087ad] h-48 mb-20 flex-row-reverse overflow-visible border-black/10"
          >
            {/* Hình minh họa */}
            <View className="absolute -top-6 right-4 w-32 h-52 justify-end">
               <View className="w-full h-full bg-slate-200/20 rounded-b-full items-center justify-center">
                  <Text className="text-5xl">👨‍🏫</Text>
               </View>
            </View>

            <View className="flex-1 justify-center items-start pl-8">
              <Text className="text-white text-2xl font-bold">Giảng viên</Text>
              <Text className="text-white/80 text-sm mt-1">
                Quản lý lớp &{"\n"}Tạo mã QR
              </Text>
            </View>
          </TouchableOpacity>

        </ScrollView>

        {/* Footer trang trí các icon nhỏ */}
        <View className="absolute bottom-10 right-10 rotate-12">
           <Text className="text-purple-400 text-2xl">✦</Text>
        </View>
        <View className="absolute top-40 right-6 -rotate-12">
           <Text className="text-blue-300 text-xl">✨</Text>
        </View>

      </SafeAreaView>
    </View>
  );
};

export default RoleSelectionScreen;