import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SvgUri } from 'react-native-svg';

const passwordSvgUri = Image.resolveAssetSource(
  require('../../../assets/svg_password.svg')
).uri;

const StudentChangePasswordScreen = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = () => {
    Alert.alert('Thông báo', 'Đây là màn UI đổi mật khẩu. Chưa tích hợp API.');
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F4F6FA]">
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#3B82F6', '#6366F1']}
          style={{
            paddingTop: 24,
            paddingBottom: 90,
            paddingHorizontal: 24,
            overflow: 'hidden',
          }}
        >
          <View className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
          <View className="absolute bottom-8 left-10 w-16 h-16 rounded-full bg-white/10" />
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              right: -20,
              bottom: -26,
              width: 220,
              height: 160,
              opacity: 0.16,
            }}
          >
            <SvgUri
              uri={passwordSvgUri}
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid meet"
            />
          </View>

          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
            >
              <Ionicons name="arrow-back" size={20} color="white" />
            </TouchableOpacity>

            <Text className="text-white text-2xl font-bold">Đổi mật khẩu</Text>

            <View className="w-10 h-10" />
          </View>
        </LinearGradient>

        <View className="px-6 -mt-16 pb-6">
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 10,
              padding: 24,
              shadowColor: '#e7c6c6',
              shadowOpacity: 0.08,
              elevation: 10,
            }}
          >
            <Text className="text-lg font-bold text-gray-800 mb-2">Bảo mật tài khoản</Text>
            <Text className="text-gray-500 mb-6">
              Nhập mật khẩu hiện tại và mật khẩu mới của bạn.
            </Text>

            <PasswordField
              icon="lock-closed-outline"
              label="Mật khẩu hiện tại"
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />

            <PasswordField
              icon="key-outline"
              label="Mật khẩu mới"
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <PasswordField
              icon="shield-checkmark-outline"
              label="Xác nhận mật khẩu mới"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <LinearGradient
              colors={['#3B82F6', '#6366F1']}
              style={{
                marginTop: 8,
                borderRadius: 16,
              }}
            >
              <TouchableOpacity
                onPress={handleSave}
                className="py-4 items-center"
              >
                <Text className="text-white font-semibold text-base">
                  Lưu thay đổi
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const PasswordField = ({ icon, label, value, onChangeText }) => (
  <View className="mb-5">
    <Text className="text-xs text-gray-400 mb-2">{label}</Text>
    <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
      <Ionicons name={icon} size={18} color="#6B7280" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry
        className="flex-1 ml-3 text-gray-800"
        placeholder="••••••••"
        placeholderTextColor="#9CA3AF"
      />
    </View>
  </View>
);

export default StudentChangePasswordScreen;
