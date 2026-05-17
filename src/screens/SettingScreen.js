import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Switch,
  Alert,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { SafeAreaView } from 'react-native-safe-area-context';

// Đã thêm ArrowLeft cho nút Back
import { Fingerprint, ShieldAlert, ShieldCheck, ArrowLeft } from 'lucide-react-native';

import {
  checkBiometricAvailable,
  enableBiometricLogin,
  disableBiometricLogin,
  getBiometricConfig,
} from '../utils/biometricAuth';

// NHỚ THÊM prop "navigation" vào đây
const SettingScreen = ({ route, navigation }) => {
  const { userRole = 'student' } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const isStudent = userRole === 'student';
  
  // Custom màu sắc dựa trên role
  const themeColorHex = isStudent ? '#2563eb' : '#0891b2'; 
  const iconBgClass = isStudent ? 'bg-blue-50' : 'bg-cyan-50';
  const trackColorTrue = isStudent ? '#bfdbfe' : '#a5f3fc';

  useEffect(() => {
    initBiometricSetting();
  }, []);

  const initBiometricSetting = async () => {
    try {
      const available = await checkBiometricAvailable();
      const config = await getBiometricConfig();
      setBiometricAvailable(available);
      setBiometricEnabled(config.enabled);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể kiểm tra trạng thái vân tay');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBiometric = async (value) => {
    if (!biometricAvailable) {
      Alert.alert('Không hỗ trợ', 'Thiết bị chưa hỗ trợ hoặc chưa cài đặt vân tay/Face ID.');
      return;
    }

    if (value) {
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      if (!refreshToken) {
        Alert.alert('Lỗi', 'Không tìm thấy phiên đăng nhập. Vui lòng đăng xuất và đăng nhập lại.');
        return;
      }

      // enableBiometricLogin dùng requireAuthentication: true → OS tự xác thực, không gọi thêm
      await enableBiometricLogin({ role: userRole, refreshToken });
      setBiometricEnabled(true);
      Alert.alert('Thành công', 'Đã bật đăng nhập bằng sinh trắc học');

    } else {
      await disableBiometricLogin();
      setBiometricEnabled(false);
      Alert.alert('Đã tắt', 'Đăng nhập bằng sinh trắc học đã được tắt');
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center">
        <View className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 items-center">
          <ActivityIndicator size="large" color={themeColorHex} />
          <Text className="mt-4 text-slate-500 font-medium text-sm">Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      
      {/* Header Area */}
      <View className="px-6 pt-4 pb-6">
        
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          className="w-10 h-10 bg-white border border-slate-200 rounded-full items-center justify-center mb-6 shadow-sm"
        >
          <ArrowLeft size={20} color="#475569" />
        </TouchableOpacity>

        {/* Tiêu đề trang */}
        <View className="flex-row items-center mb-2">
          <ShieldCheck size={28} color={themeColorHex} />
          <Text className="text-2xl font-extrabold text-slate-800 ml-2 tracking-tight">
            Bảo mật tài khoản
          </Text>
        </View>
        <Text className="text-sm text-slate-500 font-medium leading-5">
          Quản lý các phương thức xác thực và đăng nhập nhanh vào hệ thống của bạn.
        </Text>
      </View>

      <View className="px-5">

        {biometricAvailable ? (
          <View className="bg-white px-5 py-4 border border-slate-100 shadow-sm flex-row items-center justify-between">
            
            <View className="flex-1 flex-row items-center pr-4">
              <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${iconBgClass}`}>
                <Fingerprint size={24} color={themeColorHex} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-slate-800 mb-1">Đăng nhập sinh trắc học</Text>
                <Text className="text-xs text-slate-500 leading-tight">Sử dụng Vân tay hoặc Face ID để đăng nhập nhanh chóng.</Text>
              </View>
            </View>

            <Switch
              value={biometricEnabled}
              onValueChange={handleToggleBiometric}
              trackColor={{ false: '#e2e8f0', true: trackColorTrue }}
              thumbColor={biometricEnabled ? themeColorHex : '#f8fafc'}
              ios_backgroundColor="#e2e8f0"
              className={Platform.OS === 'ios' ? 'scale-90' : ''}
            />
          </View>
        ) : (
          <View className="bg-amber-50 p-5 rounded-2xl border border-amber-200/60 flex-row items-start">
            <View className="w-10 h-10 rounded-full bg-amber-100 items-center justify-center mr-3 shrink-0">
              <ShieldAlert size={20} color="#d97706" />
            </View>
            <View className="flex-1 mt-0.5">
              <Text className="text-base font-bold text-amber-900 mb-1">Không khả dụng</Text>
              <Text className="text-sm text-amber-700/80 leading-5">
                Thiết bị của bạn chưa hỗ trợ hoặc chưa được thiết lập Vân tay / Face ID. Hãy kiểm tra lại cài đặt máy.
              </Text>
            </View>
          </View>
        )}
      </View>
      
    </SafeAreaView>
  );
};

export default SettingScreen;