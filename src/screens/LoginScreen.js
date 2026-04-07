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
  RefreshControl
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { loginThunk } from '../features/auth/authThunks';
import { 
  setLoginRole, 
  clearError, 
  selectIsLoading, 
  selectAuthError,
  selectIsAuthenticated,
  selectLoginRole,
} from '../features/auth/authSlice';

const LoginScreen = ({ route, navigation }) => {

  const [refreshing, setRefreshing] = useState(false);

  const { role } = route.params || { role: 'student' };
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentLoginRole = useSelector(selectLoginRole);

  const isStudent = role === 'student';
  const roleTitle = isStudent ? 'Sinh viên' : 'Giảng viên';
  const roleIcon = isStudent ? '🎓' : '👨‍🏫';
  const roleColor = isStudent ? 'blue' : 'purple';

  // Set login role khi vào màn hình
  useEffect(() => {
    dispatch(setLoginRole(role));
    return () => {
      dispatch(clearError());
    };
  }, [role, dispatch]);

  // Xử lý khi login thành công
  useEffect(() => {
    if (isAuthenticated && currentLoginRole) {
      if (currentLoginRole === 'student') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'StudentHome', params: { userRole: currentLoginRole } }],
        });
      } else if (currentLoginRole === 'teacher') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'TeacherHome', params: { userRole: currentLoginRole } }],
        });
      }
    }
  }, [isAuthenticated, currentLoginRole, navigation]);

  // Hiển thị lỗi
  useEffect(() => {
    if (error) {
      const message = typeof error === 'object' ? error.message : error;
      const errorCode = typeof error === 'object' ? error.error_code : null;

      if (errorCode === 'DEVICE_MISMATCH') {
        Alert.alert(
          'Thiết bị không hợp lệ',
          message,
          [
            {
              text: 'Đóng',
              onPress: () => dispatch(clearError()),
            },
          ]
        );
      } else {
        Alert.alert(
          'Đăng nhập thất bại',
          message,
          [
            {
              text: 'Đóng',
              onPress: () => dispatch(clearError()),
            },
          ]
        );
      }
    }
  }, [error, dispatch]);

  const handleLogin = () => {
    // Validate input
    if (!username.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã đăng nhập');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu');
      return;
    }

    // Dispatch login thunk với role
    dispatch(loginThunk({
      user_name: username.trim(),
      password: password,
      loginRole: role,
    }));
  };

  const gradientColors = isStudent ? ['#2563eb', '#2563eb'] : ['#3bd0f9', '#00a5dc'];

  const onRefresh = () => {
    setRefreshing(true);
    setUsername('');
    setPassword('');

    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }

  return (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 0 }}
      className="flex-1"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <StatusBar style="light" />
      <SafeAreaView className="flex-1"  
      >
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
              {/* <Text className="text-6xl mb-4">{roleIcon}</Text> */}
              <Text className="text-white text-3xl font-bold mb-2">Đăng nhập</Text>
              <Text className="text-white/100 text-lg">
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
                <Text className="text-gray-700 text-base font-semibold mb-2">Mã đăng nhập</Text>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder={isStudent ? 'Nhập mã sinh viên' : 'Nhập mã giảng viên'}
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
                  style={{ color: isStudent ? '#000000' : '#000000' }}
                >
                  Quên mật khẩu?
                </Text>
              </TouchableOpacity>

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={isLoading}
                className="rounded-xl py-4"
                style={{
                  backgroundColor: isLoading 
                    ? '#9ca3af' 
                    : (isStudent ? '#2563eb' : '#0087ad'),
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 4,
                  elevation: 5,
                }}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-white text-center text-lg font-bold">Đăng nhập</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View className="mt-8 items-center">
              <Text className="text-white/100 text-sm">
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
