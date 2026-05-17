import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { loginThunk, refreshTokenThunk } from '../features/auth/authThunks';
import {
  setLoginRole,
  clearError,
  selectIsLoading,
  selectAuthError,
  selectIsAuthenticated,
  selectLoginRole,
} from '../features/auth/authSlice';

import {
  checkBiometricAvailable,
  getBiometricConfig,
  getBiometricRefreshToken,
} from '../utils/biometricAuth';

// Cần cài đặt: npm install lucide-react-native
import { 
  ArrowLeft, User, Lock, Eye, EyeOff, 
  RefreshCw, Fingerprint, BookOpen, MessageCircle, Phone 
} from 'lucide-react-native';

const LoginScreen = ({ route, navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const { role: initialRole } = route.params || { role: 'student' };
  const [activeTab, setActiveTab] = useState(initialRole); // 'student' | 'teacher'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentLoginRole = useSelector(selectLoginRole);

  const isStudent = activeTab === 'student';

  // Biometric states
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  // Styling Themes (Tailwind Classes)
  const themeHex = isStudent ? '#2563eb' : '#0891b2'; // blue-600 : cyan-600
  const textTheme = isStudent ? 'text-blue-600' : 'text-cyan-600';
  const bgTheme = isStudent ? 'bg-blue-600' : 'bg-cyan-600';
  const borderTheme = isStudent ? 'border-blue-600' : 'border-cyan-600';
  const lightBgTheme = isStudent ? 'bg-blue-50' : 'bg-cyan-50';

  useEffect(() => {
    dispatch(setLoginRole(activeTab));
    return () => {
      dispatch(clearError());
    };
  }, [activeTab, dispatch]);

  useEffect(() => {
    if (isAuthenticated && currentLoginRole) {
      if (currentLoginRole === 'student') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'StudentAvatarGate', params: { userRole: currentLoginRole } }],
        });
      } else if (currentLoginRole === 'teacher') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'TeacherHome', params: { userRole: currentLoginRole } }],
        });
      }
    }
  }, [isAuthenticated, currentLoginRole, navigation]);

  useEffect(() => {
    if (error) {
      const message = typeof error === 'object' ? error.message : error;
      const errorCode = typeof error === 'object' ? error.error_code : null;
      Alert.alert(
        errorCode === 'DEVICE_MISMATCH' ? 'Thiết bị không hợp lệ' : 'Đăng nhập thất bại',
        message,
        [{ text: 'Đóng', onPress: () => dispatch(clearError()) }]
      );
    }
  }, [error, dispatch]);

  useEffect(() => {
    initBiometric();
  }, []);

  const initBiometric = async () => {
    const available = await checkBiometricAvailable();
    const config = await getBiometricConfig();
    setBiometricAvailable(available);
    setBiometricEnabled(config.enabled);
    // Tự động hiện prompt vân tay khi mở màn hình nếu đã bật
    if (available && config.enabled) {
      setTimeout(handleBiometricLogin, 300);
    }
  };

  const handleLogin = () => {
    if (!username.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã đăng nhập');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu');
      return;
    }
    dispatch(loginThunk({
      user_name: username.trim(),
      password,
      loginRole: activeTab,
    }));
  };

  const handleBiometricLogin = async () => {
    try {
      const isAvailable = await checkBiometricAvailable();
      if (!isAvailable) {
        Alert.alert('Không hỗ trợ', 'Thiết bị chưa đăng ký vân tay hoặc Face ID.');
        return;
      }

      const config = await getBiometricConfig();
      if (!config.enabled) {
        Alert.alert(
          'Chưa bật vân tay',
          'Hãy đăng nhập bằng mật khẩu và bật vân tay trong phần cài đặt.'
        );
        return;
      }

      if (config.role !== activeTab) {
        Alert.alert('Không khớp tài khoản', 'Vân tay được lưu cho tab khác. Vui lòng đăng nhập bằng mật khẩu.');
        return;
      }

      // OS tự hiện prompt sinh trắc học — không cần gọi authenticateBiometric()
      const biometricToken = await getBiometricRefreshToken();
      if (!biometricToken) return;

      await dispatch(refreshTokenThunk({ role: config.role, biometricToken })).unwrap();
    } catch (err) {
      const msg = err?.message || '';
      // Bỏ qua lỗi khi user tự hủy prompt
      if (!msg.toLowerCase().includes('cancel') && !msg.toLowerCase().includes('user')) {
        Alert.alert('Đăng nhập thất bại', msg || 'Xác thực thất bại, vui lòng thử lại.');
      }
    }
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setUsername('');
    setPassword('');
    dispatch(clearError());
  };

  const onRefresh = () => {
    setRefreshing(true);
    setUsername('');
    setPassword('');
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[themeHex]} tintColor={themeHex} />}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          {/* Top Header */}
          <View className="flex-row items-center justify-between px-5 pt-2 pb-4">
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-full items-center justify-center"
            >
              <ArrowLeft size={20} color="#475569" />
            </TouchableOpacity>
            <Text className={`text-base font-black tracking-widest ${textTheme}`}>
              ĐĂNG NHẬP
            </Text>
            <View className="w-10" />
          </View>

          {/* Segmented Tab Switcher */}
          <View className="px-5 mt-2 mb-6">
            <View className="flex-row bg-slate-100 p-1 rounded-xl">
              <TouchableOpacity
                className={`flex-1 py-3 rounded-lg items-center justify-center ${isStudent ? 'bg-white shadow-sm' : ''}`}
                onPress={() => handleTabSwitch('student')}
                activeOpacity={0.8}
              >
                <Text className={`text-sm font-bold ${isStudent ? textTheme : 'text-slate-500'}`}>
                  Sinh viên
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 py-3 rounded-lg items-center justify-center ${!isStudent ? 'bg-white shadow-sm' : ''}`}
                onPress={() => handleTabSwitch('teacher')}
                activeOpacity={0.8}
              >
                <Text className={`text-sm font-bold ${!isStudent ? textTheme : 'text-slate-500'}`}>
                  Giảng viên
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Form Content */}
          <View className="px-6 flex-1">
            <Text className="text-2xl font-extrabold text-slate-800 mb-6">
              Chào mừng bạn 👋
            </Text>

            {/* Username Input */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-slate-700 mb-2">Mã đăng nhập</Text>
              <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 h-14">
                <User size={20} color="#94a3b8" />
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder={isStudent ? 'Nhập mã sinh viên' : 'Nhập mã giảng viên'}
                  placeholderTextColor="#94a3b8"
                  className="flex-1 ml-3 text-base text-slate-800"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-slate-700 mb-2">Mật khẩu</Text>
              <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 h-14">
                <Lock size={20} color="#94a3b8" />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry={!showPassword}
                  className="flex-1 ml-3 text-base text-slate-800"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-2">
                  {showPassword ? (
                    <EyeOff size={20} color="#94a3b8" />
                  ) : (
                    <Eye size={20} color="#94a3b8" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              className={`h-14 rounded-xl items-center justify-center mb-6 shadow-sm ${isLoading ? 'bg-slate-400' : bgTheme}`}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white text-base font-bold tracking-wide">
                  Đăng nhập
                </Text>
              )}
            </TouchableOpacity>

            {/* Actions Row */}
            <View className="flex-row justify-between items-center mb-8">
              <TouchableOpacity>
                <Text className={`text-sm font-semibold ${textTheme}`}>Quên mật khẩu?</Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-row items-center">
                <Text className="text-sm font-semibold text-slate-700 mr-1.5">Đổi tài khoản</Text>
                <RefreshCw size={14} color={themeHex} />
              </TouchableOpacity>
            </View>

            {/* Biometric Button */}
            {biometricAvailable && biometricEnabled && (
              <TouchableOpacity
                onPress={handleBiometricLogin}
                activeOpacity={0.85}
                className={`flex-row items-center p-4 rounded-2xl border-2 ${borderTheme} mb-8 bg-white shadow-sm`}
              >
                <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${lightBgTheme}`}>
                  <Fingerprint size={28} color={themeHex} />
                </View>
                <View className="flex-1">
                  <Text className={`text-base font-bold ${textTheme} mb-0.5`}>
                    Đăng nhập bằng vân tay
                  </Text>
                  <Text className="text-xs text-slate-500">
                    Chạm nhẹ để truy cập nhanh chóng
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Footer Area */}
          <View className="pt-6 pb-4 mt-auto bg-slate-50 border-t border-slate-200/60 items-center">
            <View className="flex-row justify-around w-full px-4 mb-4">
              <TouchableOpacity className="items-center flex-1">
                <BookOpen size={24} color="#64748b" className="mb-2" />
                <Text className="text-xs text-slate-500 font-medium text-center">Hướng dẫn</Text>
              </TouchableOpacity>
              <TouchableOpacity className="items-center flex-1">
                <MessageCircle size={24} color="#64748b" className="mb-2" />
                <Text className="text-xs text-slate-500 font-medium text-center">Hỏi đáp</Text>
              </TouchableOpacity>
              <TouchableOpacity className="items-center flex-1">
                <Phone size={24} color="#64748b" className="mb-2" />
                <Text className="text-xs text-slate-500 font-medium text-center">Hotline</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity>
              <Text className="text-xs text-slate-500 underline mb-2">Điều khoản & Quyền riêng tư</Text>
            </TouchableOpacity>
            <Text className="text-[10px] text-slate-400 font-medium tracking-widest">
              PHIÊN BẢN 1.0.0
            </Text>
          </View>

        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default LoginScreen;  