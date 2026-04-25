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
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useDispatch, useSelector } from "react-redux";
import { loginThunk } from "../features/auth/authThunks";
import {
  setLoginRole,
  clearError,
  selectIsLoading,
  selectAuthError,
  selectIsAuthenticated,
  selectLoginRole,
} from "../features/auth/authSlice";

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
                />
              </TouchableOpacity>
            </View>

            {/* LOGIN BTN */}
            <TouchableOpacity
              style={[
                styles.loginBtn,
                { backgroundColor: accentColor },
              ]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
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