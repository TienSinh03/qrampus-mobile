import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SvgUri } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';

import { getStudentProfileThunk } from '../../features/student/studentThunks';
import {
  selectStudentLoading,
  selectStudentProfile,
} from '../../features/student/studentSlice';
import { getDevicePayload } from '../../utils/device.helper';

const cloudSyncSvgSource = Image.resolveAssetSource(
  require('../../../assets/undraw_cloud-sync_h1ig.svg')
);
const cloudSyncSvgUri =
  cloudSyncSvgSource?.uri || cloudSyncSvgSource?.localUri || null;

const DeviceChangeHistoryScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const profile = useSelector(selectStudentProfile);
  const loading = useSelector(selectStudentLoading);
  const [refreshing, setRefreshing] = useState(false);
  const [currentDevicePayload, setCurrentDevicePayload] = useState(null);

  const loadCurrentDevice = async () => {
    try {
      const payload = await getDevicePayload();
      setCurrentDevicePayload(payload);
    } catch (error) {
      setCurrentDevicePayload(null);
    }
  };

  useEffect(() => {
    dispatch(getStudentProfileThunk());
    loadCurrentDevice();
  }, [dispatch]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(getStudentProfileThunk()).unwrap(),
        loadCurrentDevice(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'Chưa cập nhật';
    return date.toLocaleDateString('vi-VN');
  };

  const devicePayload = profile?.device_id || {};
  const deviceInfo = devicePayload?.device || {};
  const currentDeviceInfo = currentDevicePayload?.device || {};

  const data = {
    installation_id: devicePayload?.installation_id || 'Chưa cập nhật',
    bound_at: devicePayload?.bound_at || null,
    device: {
      brand: deviceInfo?.brand || 'Không rõ',
      osName:
        deviceInfo?.osName ||
        'Không rõ',
      modelName: deviceInfo?.modelName || 'Không rõ',
      osVersion: deviceInfo?.osVersion || '-',
      appVersion: deviceInfo?.appVersion || '-',
      buildVersion: deviceInfo?.buildVersion || '-',
    },
  };

  const osDisplay = [data.device.osName, data.device.osVersion]
    .filter((value) => value && value !== '-')
    .join(' ');

  const currentDeviceData = {
    installation_id:
      currentDevicePayload?.installation_id ||
      'Chưa cập nhật',
    device: {
      brand: currentDeviceInfo?.brand || 'Không rõ',
      modelName: currentDeviceInfo?.modelName || 'Không rõ',
      osName: currentDeviceInfo?.osName || 'Không rõ',
      osVersion: currentDeviceInfo?.osVersion || '-',
      appVersion: currentDeviceInfo?.appVersion || '-',
      buildVersion: currentDeviceInfo?.buildVersion || '-',
    },
  };

  const currentOsDisplay = [
    currentDeviceData.device.osName,
    currentDeviceData.device.osVersion,
  ]
    .filter((value) => value && value !== '-')
    .join(' ');

  const normalizeValue = (value) =>
    (value || '')
      .toString()
      .trim()
      .toLowerCase();

  const hasLinkedDevice = !!devicePayload?.installation_id;
  const isDeviceMismatch =
    hasLinkedDevice &&
    (
      normalizeValue(data.installation_id) !==
        normalizeValue(currentDeviceData.installation_id) ||
      normalizeValue(data.device.modelName) !==
        normalizeValue(currentDeviceData.device.modelName) ||
      normalizeValue(data.device.osName) !==
        normalizeValue(currentDeviceData.device.osName)
    );

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar style="light" />

      {/* HEADER */}
      <LinearGradient
        colors={['#2563eb', '#3b82f6']}
        className="relative overflow-hidden px-5 pt-5 pb-6"
      >
        {!!cloudSyncSvgUri && (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              right: -15,
              bottom: -15,
              width: 100,
              height: 160,
              opacity: 0.26,
            }}
          >
            <SvgUri
              uri={cloudSyncSvgUri}
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid meet"
            />
          </View>
        )}

        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-3 w-10 h-10 items-center justify-center rounded-full bg-white/20"
          >
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>

          <Text className="text-white text-xl font-bold flex-1">
            Thiết bị đăng nhập
          </Text>
        </View>

        <Text className="text-blue-100 mt-3 text-sm leading-5">
          Thiết bị hiện đang liên kết với tài khoản sinh viên
        </Text>
      </LinearGradient>

      <ScrollView
        className="px-5"
        contentContainerStyle={{ paddingTop: 22, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading && !profile ? (
          <View className="bg-white rounded-2xl py-10 items-center justify-center">
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : (
          <>
        {/* MAIN CARD */}
        <View
          className="bg-white overflow-hidden"
          style={{
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: 15,
            elevation: 6,
          }}
        >
          {/* TOP BLUE SECTION */}
          <LinearGradient
            colors={['#2563eb', '#3b82f6']}
            className="px-5 py-6 p"
          >
            <View className="items-center">
              <View className="w-20 h-20 rounded-full bg-white/20 items-center justify-center mb-4">
                <Ionicons
                  name="phone-portrait-outline"
                  size={42}
                  color="white"
                />
              </View>

              <Text className="text-white text-2xl font-bold capitalize">
                {data.device.brand}
              </Text>

              <Text className="text-blue-100 text-sm mt-1">
                {data.device.modelName}
              </Text>

              <View className="mt-4 bg-white/20 px-4 py-2 rounded-full">
                <Text className="text-white text-xs font-semibold">
                  Đang hoạt động
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* DETAIL */}
          <View className="p-5">
            <View className="space-y-4">
              <View className="flex-row items-start">
                <Text className="text-gray-500 flex-1 pr-3">Hệ điều hành</Text>
                <Text
                  className="font-semibold text-gray-900 flex-1 text-right"
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {osDisplay || 'Không rõ'}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-gray-500">Phiên bản App</Text>
                <Text className="font-semibold text-gray-900">
                  {data.device.appVersion}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-gray-500">Build</Text>
                <Text className="font-semibold text-gray-900">
                  {data.device.buildVersion}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-gray-500">Ngày liên kết</Text>
                <Text className="font-semibold text-gray-900">
                  {formatDate(data.bound_at)}
                </Text>
              </View>
            </View>

            {/* ID BOX */}
            <View className="mt-5 bg-gray-50 rounded-2xl p-4">
              <Text className="text-xs text-gray-400 mb-1">
                Installation ID
              </Text>
              <Text className="text-sm text-gray-700">
                {data.installation_id}
              </Text>
            </View>

            {/* WARNING */}
            <View className="mt-5 flex-row bg-amber-50 rounded-2xl p-4">
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color="#d97706"
              />
              <Text className="text-amber-700 text-sm ml-3 flex-1 leading-5">
                Nếu đổi điện thoại mới, hệ thống sẽ yêu cầu xác minh lại thiết bị.
              </Text>
            </View>

            {isDeviceMismatch && (
              <View className="mt-4 flex-row bg-red-50 rounded-2xl p-4 border border-red-100">
                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color="#dc2626"
                />
                <Text className="text-red-700 text-sm ml-3 flex-1 leading-5">
                  Sinh viên vui lòng đăng xuất, liên hệ giảng viên giảng dạy reset lại thiết bị, để không ảnh hưởng kết quả điểm danh.
                </Text>
              </View>
            )}

            <View className="mt-5 bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-blue-900 font-semibold text-base">
                  Thiết bị hiện tại
                </Text>
                <View className="px-3 py-1 rounded-full bg-blue-100">
                  <Text className="text-blue-700 text-xs font-semibold">
                    {isDeviceMismatch ? 'Không khớp' : 'Khớp'}
                  </Text>
                </View>
              </View>

              <View className="space-y-3">
                <View className="flex-row items-start">
                  <Text className="text-blue-700 flex-1 pr-3">Thiết bị</Text>
                  <Text
                    className="text-blue-900 font-semibold flex-1 text-right"
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {currentDeviceData.device.brand} {currentDeviceData.device.modelName}
                  </Text>
                </View>

                <View className="flex-row items-start">
                  <Text className="text-blue-700 flex-1 pr-3">Hệ điều hành</Text>
                  <Text
                    className="text-blue-900 font-semibold flex-1 text-right"
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {currentOsDisplay || 'Không rõ'}
                  </Text>
                </View>

                <View className="flex-row items-start">
                  <Text className="text-blue-700 flex-1 pr-3">Installation ID</Text>
                  <Text
                    className="text-blue-900 font-semibold flex-1 text-right"
                    numberOfLines={2}
                    ellipsizeMode="middle"
                  >
                    {currentDeviceData.installation_id}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DeviceChangeHistoryScreen;