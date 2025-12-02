import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

const LoginScreen = ({ route, navigation }) => {
  const { role } = route.params || { role: 'student' };
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const isStudent = role === 'student';
  const roleTitle = isStudent ? 'Sinh viên' : 'Giảng viên';
  const roleIcon = isStudent ? '🎓' : '👨‍🏫';
  const roleColor = isStudent ? 'blue' : 'purple';

  const handleLogin = () => {
    // TODO: Implement actual login API call
    console.log('Login:', { username, password, role });
    
    // Navigate to appropriate home screen based on role
    if (isStudent) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'StudentHome', params: { userRole: 'student' } }],
      });
    } else {
      // TODO: Navigate to teacher home when implemented
      navigation.reset({
        index: 0,
        routes: [{ name: 'TeacherHome', params: { userRole: 'teacher' } }],
      });
    }
  };

  const gradientColors = isStudent ? ['#2563eb', '#9333ea'] : ['#9333ea', '#7c3aed'];

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 0 }}
      className="flex-1"
    >
      <StatusBar style="light" />
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="ml-6 mt-4 bg-white/20 px-4 py-2 rounded-full self-start"
          >
            <Text className="text-white text-base">← Quay lại</Text>
          </TouchableOpacity>

          <View className="flex-1 justify-center px-8">
            {/* Header */}
            <View className="items-center mb-12">
              <Text className="text-6xl mb-4">{roleIcon}</Text>
              <Text className="text-white text-3xl font-bold mb-2">Đăng nhập</Text>
              <Text className="text-white/90 text-lg">
                {roleTitle}
              </Text>
            </View>

            <View 
              className="bg-white rounded-3xl p-8"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <View className="mb-6">
                <Text className="text-gray-700 text-base font-semibold mb-2">Tên đăng nhập</Text>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Nhập tên đăng nhập"
                  className="bg-gray-100 rounded-xl px-4 py-4 text-base"
                  autoCapitalize="none"
                />
              </View>

              <View className="mb-6">
                <Text className="text-gray-700 text-base font-semibold mb-2">Mật khẩu</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Nhập mật khẩu"
                  secureTextEntry
                  className="bg-gray-100 rounded-xl px-4 py-4 text-base"
                />
              </View>

              {/* Forgot Password */}
              <TouchableOpacity className="items-end mb-6">
                <Text 
                  className="text-sm font-semibold"
                  style={{ color: isStudent ? '#2563eb' : '#9333ea' }}
                >
                  Quên mật khẩu?
                </Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                className="rounded-xl py-4"
                style={{
                  backgroundColor: isStudent ? '#2563eb' : '#9333ea',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 5,
                }}
              >
                <Text className="text-white text-center text-lg font-bold">Đăng nhập</Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View className="mt-8 items-center">
              <Text className="text-white/80 text-sm">
                Chưa có tài khoản?{' '}
                <Text className="font-bold">Liên hệ quản trị viên</Text>
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default LoginScreen;
