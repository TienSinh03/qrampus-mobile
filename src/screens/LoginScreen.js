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

  // Active tab accent color
  const accentColor = isStudent ? '#1a56db' : '#0087ad';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backArrow}>←</Text>
            </TouchableOpacity>
            <Text style={styles.appName}>ĐĂNG NHẬP HỆ THỐNG</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Tab Switcher — flat, sharp corners */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                isStudent && { borderBottomColor: '#1a56db', borderBottomWidth: 3 },
              ]}
              onPress={() => handleTabSwitch('student')}
              activeOpacity={0.85}
            >
              <Text style={[styles.tabText, isStudent && { color: '#1a56db', fontWeight: '700' }]}>
                Sinh viên
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                !isStudent && { borderBottomColor: '#0087ad', borderBottomWidth: 3 },
              ]}
              onPress={() => handleTabSwitch('teacher')}
              activeOpacity={0.85}
            >
              <Text style={[styles.tabText, !isStudent && { color: '#0087ad', fontWeight: '700' }]}>
                Giảng viên
              </Text>
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Form Content */}
          <View style={styles.formContainer}>
            <Text style={styles.heading}>
              Nhập thông tin đăng nhập để tiếp tục
            </Text>

            {/* Username */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Mã đăng nhập</Text>
              <View style={[styles.inputWrapper, { borderColor: accentColor }]}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder={isStudent ? 'Nhập mã sinh viên' : 'Nhập mã giảng viên'}
                  placeholderTextColor="#aab"
                  style={styles.input}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Mật khẩu</Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor="#aab"
                  secureTextEntry={!showPassword}
                  style={styles.input}
                />
                <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
                  <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              style={[styles.loginBtn, { backgroundColor: isLoading ? '#9ca3af' : accentColor }]}
              activeOpacity={0.88}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginBtnText}>Đăng nhập</Text>
              )}
            </TouchableOpacity>

            {/* Forgot / Switch Account Row */}
            <View style={styles.actionRow}>
              <TouchableOpacity>
                <Text style={[styles.actionLink, { color: accentColor }]}>Quên mật khẩu</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.switchRow}>
                <Text style={styles.actionText}>Đổi tài khoản</Text>
                <Text style={{ color: accentColor, marginLeft: 4, fontSize: 16 }}>↺</Text>
              </TouchableOpacity>
            </View>

            {/* Biometric */}
            <TouchableOpacity style={styles.biometricRow}>
              <View style={styles.biometricIcon}>
                <Text style={{ fontSize: 26 }}>👆</Text>
              </View>
              <Text style={styles.biometricText}>Đăng nhập bằng vân tay</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerLinks}>
              <TouchableOpacity style={styles.footerItem}>
                <Text style={styles.footerIcon}>📖</Text>
                <Text style={styles.footerLabel}>Hướng dẫn{'\n'}sử dụng</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.footerItem}>
                <Text style={styles.footerIcon}>💬</Text>
                <Text style={styles.footerLabel}>Câu hỏi{'\n'}thường gặp</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.footerItem}>
                <Text style={styles.footerIcon}>📞</Text>
                <Text style={styles.footerLabel}>Hotline{'\n'}hỗ trợ</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity>
              <Text style={styles.privacyLink}>Chính sách quyền riêng tư</Text>
            </TouchableOpacity>
            <Text style={styles.version}>Phiên bản 1.0.0</Text>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = {
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 22,
    color: '#222',
  },
  appName: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#1a56db',
  },

  // TAB SWITCHER — no border radius
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginTop: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },

  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 28,
    flex: 1,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 30,
    marginBottom: 28,
  },
  fieldGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    // No borderRadius — flat square corners
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 10,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    padding: 0,
    margin: 0,
  },
  eyeBtn: {
    paddingLeft: 8,
  },
  eyeIcon: {
    fontSize: 16,
    opacity: 0.5,
  },

  loginBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
    // No borderRadius — flat
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  actionLink: {
    fontSize: 14,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },

  biometricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 20,
  },
  biometricIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  biometricText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },

  footer: {
    paddingTop: 24,
    paddingBottom: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    backgroundColor: '#fafafa',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  footerItem: {
    alignItems: 'center',
    flex: 1,
  },
  footerIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  footerLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  privacyLink: {
    fontSize: 13,
    color: '#374151',
    textDecorationLine: 'underline',
    marginBottom: 6,
  },
  version: {
    fontSize: 12,
    color: '#9ca3af',
  },
};

export default LoginScreen;