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
import axiosInstance from '../../api/axiosInstance';

const passwordSvgUri = Image.resolveAssetSource(
  require('../../../assets/svg_password.svg')
).uri;

export const validatePasswordStrength = (password = '') => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];

  if (password.length < minLength) {
    errors.push(`Mật khẩu phải có ít nhất ${minLength} ký tự`);
  }
  if (!hasUpperCase) {
    errors.push('Mật khẩu phải chứa ít nhất một ký tự viết hoa');
  }
  if (!hasLowerCase) {
    errors.push('Mật khẩu phải chứa ít nhất một ký tự viết thường');
  }
  if (!hasNumbers) {
    errors.push('Mật khẩu phải chứa ít nhất một số');
  }
  if (!hasSpecialChar) {
    errors.push('Mật khẩu phải chứa ít nhất một ký tự đặc biệt');
  }

  return {
    isValid: errors.length === 0,
    errors,
    checks: {
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar,
    },
  };
};

const StudentChangePasswordScreen = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const passwordStrength = validatePasswordStrength(newPassword.trim());

  const handleSave = async () => {
    const current = currentPassword.trim();
    const nextPassword = newPassword.trim();
    const confirm = confirmPassword.trim();

    if (!current || !nextPassword || !confirm) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ các trường mật khẩu.');
      return;
    }

    if (!passwordStrength.isValid) {
      Alert.alert('Mật khẩu chưa hợp lệ', passwordStrength.errors.join('\n'));
      return;
    }

    if (nextPassword !== confirm) {
      Alert.alert('Xác nhận không khớp', 'Mật khẩu xác nhận không trùng với mật khẩu mới.');
      return;
    }

    if (current === nextPassword) {
      Alert.alert('Mật khẩu chưa hợp lệ', 'Mật khẩu mới phải khác mật khẩu hiện tại.');
      return;
    }

    setSubmitting(true);

    try {
      await axiosInstance.post('/auth/change-password', {
        current_password: current,
        new_password: nextPassword,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      Alert.alert('Thành công', 'Đổi mật khẩu thành công.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Không thể đổi mật khẩu. Vui lòng thử lại.';
      Alert.alert('Đổi mật khẩu thất bại', message);
    } finally {
      setSubmitting(false);
    }
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

        <View className="px-6 -mt-14 pb-6">
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
            <Text className="text-gray-500 mb-2 text-center font-medium">
              Thay đổi mật khẩu của bạn
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

            <View className="mb-5 -mt-2 bg-gray-50 rounded-xl px-3 border border-gray-100">
              <Text className="text-xs text-gray-500 mb-2">Yêu cầu mật khẩu:</Text>

              <PasswordRule
                text="Ít nhất 8 ký tự"
                ok={passwordStrength.checks.minLength}
              />
              <PasswordRule
                text="Có ít nhất 1 ký tự viết hoa"
                ok={passwordStrength.checks.hasUpperCase}
              />
              <PasswordRule
                text="Có ít nhất 1 ký tự viết thường"
                ok={passwordStrength.checks.hasLowerCase}
              />
              <PasswordRule
                text="Có ít nhất 1 chữ số"
                ok={passwordStrength.checks.hasNumbers}
              />
              <PasswordRule
                text="Có ít nhất 1 ký tự đặc biệt"
                ok={passwordStrength.checks.hasSpecialChar}
              />
            </View>

            <PasswordField
              icon="shield-checkmark-outline"
              label="Xác nhận mật khẩu mới"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <LinearGradient
              colors={['#3B82F6', '#6366F1']}
              style={{
                borderRadius: 16,
              }}
            >
              <TouchableOpacity
                onPress={handleSave}
                disabled={submitting}
                className="py-4 items-center"
              >
                {submitting ? (
                  <Text className="text-white font-semibold text-base">
                    Đang cập nhật...
                  </Text>
                ) : (
                  <Text className="text-white font-semibold text-base">
                    Lưu thay đổi
                  </Text>
                )}
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

const PasswordRule = ({ text, ok }) => (
  <View className="flex-row items-center mb-1.5">
    <Ionicons
      name={ok ? 'checkmark-circle' : 'ellipse-outline'}
      size={14}
      color={ok ? '#10b981' : '#9CA3AF'}
    />
    <Text className="ml-2 text-xs" style={{ color: ok ? '#047857' : '#6B7280' }}>
      {text}
    </Text>
  </View>
);

export default StudentChangePasswordScreen;
