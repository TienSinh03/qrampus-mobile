import React, { useState, useEffect } from "react";
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
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useDispatch, useSelector } from "react-redux";
import { loginThunk } from "../features/auth/authThunks";
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { loginThunk, refreshTokenThunk } from '../features/auth/authThunks';
} from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  setLoginRole,
  clearError,
  selectIsLoading,
  selectAuthError,
  selectIsAuthenticated,
  selectLoginRole,
} from "../features/auth/authSlice";

import {
  checkBiometricAvailable,
  authenticateBiometric,
  getBiometricConfig,
} from '../utils/biometricAuth';

// Cần cài đặt: npm install lucide-react-native
import { 
  ArrowLeft, User, Lock, Eye, EyeOff, 
  RefreshCw, Fingerprint, BookOpen, MessageCircle, Phone 
} from 'lucide-react-native';

const LoginScreen = ({ route, navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const { role: initialRole } = route.params || { role: "student" };

  const [activeTab, setActiveTab] = useState(initialRole);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();

  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentLoginRole = useSelector(selectLoginRole);

  const isStudent = activeTab === "student";
  const accentColor = isStudent ? "#2563EB" : "#0891B2";

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
    return () => dispatch(clearError());
  }, [activeTab]);

  useEffect(() => {
    if (isAuthenticated && currentLoginRole) {
      navigation.reset({
        index: 0,
        routes: [
          {
            name:
              currentLoginRole === "student"
                ? "StudentHome"
                : "TeacherHome",
          },
        ],
      });
    }
  }, [isAuthenticated, currentLoginRole]);

  useEffect(() => {
    if (error) {
      Alert.alert("Đăng nhập thất bại", error?.message || error);
      dispatch(clearError());
    }
  }, [error]);

  useEffect(() => {
    checkLoginBiometric();
  }, []);

  const checkLoginBiometric = async () => {
    const available = await checkBiometricAvailable();
    const config = await getBiometricConfig();

    setBiometricAvailable(available);
    setBiometricEnabled(config.enabled);
  };

  const handleLogin = () => {
    if (!username.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mã đăng nhập");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mật khẩu");
      return;
    }

    dispatch(
      loginThunk({
        user_name: username.trim(),
        password,
        loginRole: activeTab,
      })
    );
  };

  const handleBiometricLogin = async () => {
    const config = await getBiometricConfig();
    console.log('Biometric config on login attempt:', config);

    if (!config.enabled || !config.refreshToken) {
      Alert.alert(
        'Chưa thể đăng nhập bằng vân tay',
        'Bạn cần đăng nhập bằng mật khẩu lần đầu và bật chức năng vân tay trong phần cài đặt.'
      );
      return;
    }

    if (config.role !== activeTab) {
      Alert.alert(
        'Không thể sử dụng vân tay',
        'Vui lòng đăng nhập bằng mật khẩu để tiếp tục.'
      );
      return;
    }

    const result = await authenticateBiometric('Xác thực vân tay để đăng nhập');

    if (!result.success) {
      Alert.alert('Đăng nhập thất bại', 'Xác thực vân tay không thành công');
      return;
    }

    dispatch(refreshTokenThunk({
      refreshToken: config.refreshToken,
      role: config.role,
    }));
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setUsername("");
    setPassword("");
    dispatch(clearError());
  };

  const onRefresh = () => {
    setRefreshing(true);
    setUsername("");
    setPassword("");
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F8FAFC" }}>
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
            >
              <Ionicons
                name="arrow-back"
                size={22}
                color="#0F172A"
              />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Đăng nhập</Text>

            <View style={{ width: 42 }} />
          </View>

          {/* TOP ICON */}
          <View style={styles.hero}>
            <View
              style={[
                styles.heroIcon,
                { backgroundColor: accentColor },
              ]}
            >
              <Ionicons
                name={
                  isStudent
                    ? "school-outline"
                    : "person-outline"
                }
                size={28}
                color="#fff"
              />
            </View>

            <Text style={styles.bigTitle}>
              {isStudent ? "Sinh viên" : "Giảng viên"}
            </Text>

            <Text style={styles.subTitle}>
              Đăng nhập để tiếp tục sử dụng hệ thống
            </Text>
          </View>

          {/* TAB */}
          <View style={styles.tabs}>
            <TouchableOpacity
              onPress={() => handleTabSwitch("student")}
              style={[
                styles.tab,
                isStudent && {
                  backgroundColor: "#EFF6FF",
                  borderColor: "#BFDBFE",
                },
              ]}
            >
              <Ionicons
                name="school-outline"
                size={18}
                color={isStudent ? "#2563EB" : "#64748B"}
              />
              <Text
                style={[
                  styles.tabText,
                  isStudent && { color: "#2563EB" },
                ]}
              >
                Sinh viên
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleTabSwitch("teacher")}
              style={[
                styles.tab,
                !isStudent && {
                  backgroundColor: "#ECFEFF",
                  borderColor: "#A5F3FC",
                },
              ]}
            >
              <Ionicons
                name="person-outline"
                size={18}
                color={!isStudent ? "#0891B2" : "#64748B"}
              />
              <Text
                style={[
                  styles.tabText,
                  !isStudent && { color: "#0891B2" },
                ]}
              >
                Giảng viên
              </Text>
            </TouchableOpacity>
          </View>

          {/* FORM */}
          <View style={styles.card}>
            {/* USERNAME */}
            <Text style={styles.label}>Mã đăng nhập</Text>

            <View style={styles.inputWrap}>
              <Ionicons
                name="person-outline"
                size={18}
                color="#94A3B8"
              />
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder={
                  isStudent
                    ? "Nhập mã sinh viên"
                    : "Nhập mã giảng viên"
                }
                style={styles.input}
              />
            </View>

            {/* PASSWORD */}
            <Text style={[styles.label, { marginTop: 16 }]}>
              Mật khẩu
            </Text>

            <View style={styles.inputWrap}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color="#94A3B8"
              />

              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Nhập mật khẩu"
                secureTextEntry={!showPassword}
                style={styles.input}
              />

              <TouchableOpacity
                onPress={() =>
                  setShowPassword(!showPassword)
                }
              >
                <Ionicons
                  name={
                    showPassword
                      ? "eye-off-outline"
                      : "eye-outline"
                  }
                  size={20}
                  color="#94A3B8"
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
              </TouchableOpacity>
            </View>

            {/* LOGIN BTN */}
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
              style={[
                styles.loginBtn,
                { backgroundColor: accentColor },
              ]}
              onPress={handleLogin}
              disabled={isLoading}
              className={`h-14 rounded-xl items-center justify-center mb-6 shadow-sm ${isLoading ? 'bg-slate-400' : bgTheme}`}
              activeOpacity={0.85}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.loginText}>
                    Đăng nhập
                  </Text>
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color="#fff"
                  />
                </>
              )}
            </TouchableOpacity>

            {/* LINKS */}
            <View style={styles.links}>
              <TouchableOpacity>
                <Text
                  style={{
                    color: accentColor,
                    fontWeight: "600",
                  }}
                >
                  Quên mật khẩu?
                </Text>
              </TouchableOpacity>

              <TouchableOpacity>
                <Text style={{ color: "#64748B" }}>
                  Hỗ trợ
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* BIOMETRIC */}
          <TouchableOpacity style={styles.bioBtn}>
            <Ionicons
              name="finger-print-outline"
              size={26}
              color={accentColor}
            />
            <Text style={styles.bioText}>
              Đăng nhập bằng vân tay
            </Text>
          </TouchableOpacity>

          {/* FOOTER */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.footerItem}>
              <Ionicons
                name="help-circle-outline"
                size={22}
                color="#64748B"
              />
              <Text style={styles.footerText}>
                Hướng dẫn
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.footerItem}>
              <Ionicons
                name="chatbubble-outline"
                size={22}
                color="#64748B"
              />
              <Text style={styles.footerText}>
                FAQ
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.footerItem}>
              <Ionicons
                name="call-outline"
                size={22}
                color="#64748B"
              />
              <Text style={styles.footerText}>
                Hotline
              </Text>
            </TouchableOpacity>
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
            {biometricAvailable && (
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

const styles = {
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
  },

  hero: {
    alignItems: "center",
    marginTop: 30,
    marginBottom: 24,
  },

  heroIcon: {
    width: 62,
    height: 62,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  bigTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
  },

  subTitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 6,
  },

  tabs: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },

  tab: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#fff",
  },

  tabText: {
    fontWeight: "700",
    color: "#64748B",
  },

  card: {
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 18,
  },

  label: {
    fontWeight: "700",
    color: "#334155",
    marginBottom: 8,
  },

  inputWrap: {
    height: 54,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  input: {
    flex: 1,
    fontSize: 15,
  },

  loginBtn: {
    height: 54,
    borderRadius: 14,
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  loginText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15,
  },

  links: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  bioBtn: {
    marginTop: 20,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  bioText: {
    fontWeight: "600",
    color: "#334155",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 32,
    marginBottom: 30,
  },

  footerItem: {
    alignItems: "center",
    gap: 6,
  },

  footerText: {
    fontSize: 12,
    color: "#64748B",
  },
};

export default LoginScreen;