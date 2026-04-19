import React, { useMemo, useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!profile && !isLoading) {
      dispatch(isStudent ? getStudentProfileThunk() : getTeacherProfileThunk());
    }
  }, [profile]);

  useEffect(() => {
    if (profile) setFormData(profile);
  }, [profile]);

  const updateField = (field, value) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handleUpdate = async () => {
    try {
      const action = isStudent
        ? updateStudentProfileThunk(formData)
        : updateTeacherProfileThunk(formData);

      await dispatch(action).unwrap();
      Alert.alert('Thành công', 'Cập nhật thành công');
      setIsEditing(false);
    } catch (err) {
      Alert.alert('Lỗi', 'Cập nhật thất bại');
    }
  };

  if (isLoading && !profile) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-[#F4F6FA]">
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F4F6FA]">
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header Gradient */}
        <LinearGradient
          colors={['#3B82F6', '#6366F1']}
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
              right: -8,
              bottom: -10,
              width: 120,
              height: 140,
              opacity: 0.18,
            }}
          >
            <SvgUri uri={profileIllustrationUri} width="90%" height="90%" preserveAspectRatio="xMidYMid slice" />
          </View>

          <View className="flex-row justify-between items-center">
            <Text className="text-white text-xl font-bold">
              Hồ sơ cá nhân
            </Text>

            <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
              <Ionicons
                name={isEditing ? 'close' : 'create-outline'}
                size={24}
                color="white"
              />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Avatar Card nổi */}
        <View className="px-6 -mt-16">
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 10,
              padding: 24,
              shadowColor: '#000',
              shadowOpacity: 0.08,
              // shadowRadius: 20,
              elevation: 10,
            }}
          >
            <View className="items-center">

              <View
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: 55,
                  backgroundColor: '#EEF2FF',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 4,
                  borderColor: 'white',
                }}
              >
                <Text className="text-3xl font-bold text-indigo-500">
                  {isStudent ? 'SV' : 'GV'}
                </Text>
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

            {/* Info Section */}
            <View className="mt-8">

              <ProfileField
                icon="mail-outline"
                label="Email"
                value={formData.email}
                editable={isEditing}
                onChangeText={(v) => updateField('email', v)}
              />

              <ProfileField
                icon="call-outline"
                label="Số điện thoại"
                value={formData.phone}
                editable={isEditing}
                onChangeText={(v) => updateField('phone', v)}
              />

              <ProfileField
                icon="calendar-outline"
                label="Ngày sinh"
                value={formData.dob}
                editable={isEditing}
                onChangeText={(v) => updateField('dob', v)}
              />

            </View>

            {/* Save Button */}
            {isEditing && (
              <LinearGradient
                colors={['#3B82F6', '#6366F1']}
                style={{
                  marginTop: 10,
                  borderRadius: 16,
                }}
              >
                <TouchableOpacity
                  onPress={handleUpdate}
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
}) => (
  <View className="mb-6">
    <Text className="text-xs text-gray-400 mb-2">{label}</Text>

    <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
      <Ionicons name={icon} size={18} color="#6B7280" />

      {editable ? (
        <TextInput
          value={value}
          onChangeText={onChangeText}
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

export default ProfileScreen;