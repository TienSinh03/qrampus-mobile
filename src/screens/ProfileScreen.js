// ProfileScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SvgUri } from 'react-native-svg';
import { useSelector, useDispatch } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';

import { selectLoginRole } from '../features/auth/authSlice';

import {
  selectStudentProfile,
  selectStudentLoading,
} from '../features/student/studentSlice';

import {
  selectTeacherProfile,
  selectTeacherLoading,
} from '../features/teacher/teacherSlice';

import {
  getStudentProfileThunk,
  updateStudentProfileThunk,
  uploadStudentAvatarThunk,
} from '../features/student/studentThunks';

import {
  getTeacherProfileThunk,
  updateTeacherProfileThunk,
} from '../features/teacher/teacherThunks';

const profileIllustrationUri = Image.resolveAssetSource(
  require('../../assets/undraw_profile.svg')
).uri;

const ProfileScreen = () => {
  const dispatch = useDispatch();

  const role = useSelector(selectLoginRole);
  const isStudent = role === 'student';

  const profile = useSelector(
    isStudent ? selectStudentProfile : selectTeacherProfile
  );

  const isLoading = useSelector(
    isStudent ? selectStudentLoading : selectTeacherLoading
  );

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    if (!profile && !isLoading) {
      dispatch(
        isStudent
          ? getStudentProfileThunk()
          : getTeacherProfileThunk()
      );
    }
  }, [profile]);

  useEffect(() => {
    if (profile) {
      setFormData(profile);
      setAvatar(profile?.avatar_url || null);
      console.log('[ProfileScreen] avatar_url:', profile?.avatar_url);
    }
  }, [profile]);

  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePickAvatar = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Thông báo',
        'Bạn cần cấp quyền truy cập thư viện ảnh'
      );
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes:
          ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

    if (!result.canceled) {
      const uri = result.assets[0].uri;

      setAvatar(uri);

      setFormData(prev => ({
        ...prev,
        avatar: uri,
      }));
    }
  };

  const handleUpdate = async () => {
    try {
      // Upload avatar first if a new local file was picked
      if (isStudent && formData.avatar && formData.avatar !== profile?.avatar_url) {
        await dispatch(uploadStudentAvatarThunk(formData.avatar)).unwrap();
      }

      // Strip avatar fields — avatar_url is managed by the upload endpoint,
      // sending the old value here would overwrite the freshly uploaded URL
      const { avatar, avatar_url, ...textFields } = formData;
      const action = isStudent
        ? updateStudentProfileThunk(textFields)
        : updateTeacherProfileThunk(formData);

      await dispatch(action).unwrap();

      Alert.alert(
        'Thành công',
        'Cập nhật hồ sơ thành công'
      );

      setIsEditing(false);
    } catch (error) {
      Alert.alert(
        'Lỗi',
        'Cập nhật thất bại'
      );
    }
  };

  if (isLoading && !profile) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-[#F4F6FA]">
        <ActivityIndicator
          size="large"
          color="#3B82F6"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F4F6FA]">
      <StatusBar style="dark" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={
            isStudent
              ? ['#2563eb', '#3b82f6']
              : ['#0284c7', '#38bdf8']
          }
          style={{
            paddingTop: 60,
            paddingBottom: 90,
            paddingHorizontal: 24,
            overflow: 'hidden',
          }}
        >
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              right: -10,
              bottom: 0,
              width: 200,
              height: 180,
              opacity: 0.38,
            }}
          >
            <SvgUri
              uri={profileIllustrationUri}
              width="90%"
              height="90%"
            />
          </View>

          <View className="flex-row justify-between items-center">
            <Text className="text-white text-xl font-bold">
              Hồ sơ cá nhân
            </Text>

            <TouchableOpacity
              onPress={() =>
                setIsEditing(!isEditing)
              }
              activeOpacity={0.8}
              className="bg-white/80 p-2 rounded-full"
            >
              <Ionicons
                name={
                  isEditing
                    ? 'close'
                    : 'create-outline'
                }
                size={20}
                color="#3B82F6"
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Card */}
        <View className="px-6 -mt-16">
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 18,
              padding: 24,
              shadowColor: '#000',
              shadowOpacity: 0.08,
              elevation: 10,
            }}
          >
            {/* Avatar */}
            <View className="items-center">
              <View className="relative">
                <View
                  style={{
                    width: 110,
                    height: 110,
                    borderRadius: 55,
                    backgroundColor:
                      '#EEF2FF',
                    justifyContent:
                      'center',
                    alignItems: 'center',
                    borderWidth: 4,
                    borderColor:
                      'white',
                    overflow: 'hidden',
                  }}
                >
                  {avatar ? (
                    <Image
                      source={{
                        uri: avatar,
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                      }}
                    />
                  ) : (
                    <Text className="text-3xl font-bold text-indigo-500">
                      {isStudent
                        ? 'SV'
                        : 'GV'}
                    </Text>
                  )}
                </View>

                {/* Upload Avatar */}
                {isEditing && (
                  <TouchableOpacity
                    onPress={
                      handlePickAvatar
                    }
                    activeOpacity={
                      0.8
                    }
                    className="absolute bottom-0 right-0"
                  >
                    <LinearGradient
                      colors={
                        isStudent
                          ? [
                              '#2563eb',
                              '#3b82f6',
                            ]
                          : [
                              '#0284c7',
                              '#38bdf8',
                            ]
                      }
                      className="w-10 h-10 rounded-full items-center justify-center"
                    >
                      <Ionicons
                        name="camera-outline"
                        size={18}
                        color="white"
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                )}
              </View>

              <Text className="mt-4 text-xl font-bold text-gray-800">
                {formData.full_name}
              </Text>

              <Text className="text-gray-500">
                {isStudent
                  ? formData.student_code
                  : formData.teacher_code}
              </Text>
            </View>

            {/* Fields */}
            <View className="mt-8">
              <ProfileField
                icon="mail-outline"
                label="Email"
                value={
                  formData.email
                }
                editable={
                  isEditing
                }
                onChangeText={v =>
                  updateField(
                    'email',
                    v
                  )
                }
              />

              <ProfileField
                icon="call-outline"
                label="Số điện thoại"
                value={
                  formData.phone
                }
                editable={
                  isEditing
                }
                onChangeText={v =>
                  updateField(
                    'phone',
                    v
                  )
                }
              />

              <ProfileField
                icon="calendar-outline"
                label="Ngày sinh"
                value={
                  formData.dob
                }
                editable={
                  isEditing
                }
                onChangeText={v =>
                  updateField(
                    'dob',
                    v
                  )
                }
              />
            </View>

            {/* Save */}
            {isEditing && (
              <LinearGradient
                colors={
                  isStudent
                    ? [
                        '#2563eb',
                        '#3b82f6',
                      ]
                    : [
                        '#0284c7',
                        '#38bdf8',
                      ]
                }
                style={{
                  borderRadius: 16,
                }}
              >
                <TouchableOpacity
                  onPress={
                    handleUpdate
                  }
                  className="py-4 items-center"
                >
                  <Text className="text-white font-semibold text-base">
                    Lưu thay đổi
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const ProfileField = ({
  icon,
  label,
  value,
  editable,
  onChangeText,
}) => {
  return (
    <View className="mb-6">
      <Text className="text-xs text-gray-400 mb-2">
        {label}
      </Text>

      <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
        <Ionicons
          name={icon}
          size={18}
          color="#6B7280"
        />

        {editable ? (
          <TextInput
            value={value}
            onChangeText={
              onChangeText
            }
            className="flex-1 ml-3 text-gray-800"
          />
        ) : (
          <Text className="flex-1 ml-3 text-gray-800 font-medium">
            {value || '—'}
          </Text>
        )}
      </View>
    </View>
  );
};

export default ProfileScreen;