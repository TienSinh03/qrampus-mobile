import React from 'react';
import { View, Text, ScrollView, TouchableOpacity,RefreshControl, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { logoutThunk } from '../features/auth/authThunks';
import { selectIsLoading } from '../features/auth/authSlice';

const BaseProfileScreen = ({
  navigation,
  userRole = 'student', // 'student' or 'teacher'
  userData,
  stats = [], // Array of stats objects: { label, value }
  menuItems = [], // Array of menu items
}) => {
  const roleColors = userRole === 'teacher' 
    ? ['#0171a5', '#30b2ea']  // purple gradient
    : ['#2563eb', '#3b82f6'];  // blue gradient
  
  const roleColor = userRole === 'teacher' ? '#0171a5' : '#2563eb';
  const roleBgColor = userRole === 'teacher' ? '#faf5ff' : '#eff6ff';

  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);

  const [refreshing, setRefreshing] = React.useState(false);
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }

  const handleLogout = () => {
    dispatch(logoutThunk());
    
    navigation.reset({
      index: 0,
      routes: [{ name: 'IntroCarousel' }],
    });
  };


  return (
    <SafeAreaView className="flex-1">
      <StatusBar style="dark" />

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false} 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >

        <LinearGradient
          colors={roleColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="px-6 pt-8 pb-12 overflow-hidden"
        >
          {/* Background Circle SVG giả lập */}
          <View className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
          <View className="absolute top-24 -left-12 w-28 h-28 rounded-full bg-white/10" />
          <View className="absolute bottom-6 right-10 w-16 h-16 rounded-full bg-white/10" />

          {/* Top Row */}
          <View className="flex-row items-center justify-between mb-8">
            <View>
              <Text className="text-white/80 text-sm">
                Cài đặt chung
              </Text>

              <Text className="text-white text-2xl font-bold mt-1">
                Xin chào 👋
              </Text>
            </View>

            <TouchableOpacity className="w-11 h-11 rounded-full bg-white/15 items-center justify-center" onPress={handleLogout}>
              <Ionicons name="log-out" size={22} color="white" />
              {/* Logout Icon */}
              <Text className="sr-only">Đăng xuất</Text>
            </TouchableOpacity>
          </View>

          {/* Main User Card */}
          <View className="flex-row items-center">
            {/* Avatar */}
            <View
              className="w-24 h-24 rounded-full bg-white items-center justify-center border-4 border-white/30"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              {userData?.avatarUri ? (
                <Image
                  source={{ uri: userData.avatarUri }}
                  className="w-full h-full rounded-full"
                />
              ) : (
                <Text
                  className="text-4xl font-bold"
                  style={{ color: roleColor }}
                >
                  {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              )}
            </View>

            {/* Info */}
            <View className="ml-4 flex-1">
              <Text className="text-white text-xl font-bold">
                {userData?.name}
              </Text>

              <Text className="text-white/80 text-sm mt-1">
                {userData?.code}
              </Text>

              <Text className="text-white/80 text-sm mt-1">
                {userData?.major}
              </Text>

              <View className="self-start mt-3 px-3 py-1 rounded-full bg-white/20">
                <Text className="text-white text-xs font-semibold uppercase">
                  {userRole === 'teacher' ? 'Giảng viên' : 'Sinh viên'}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Stats */}
        {stats && stats.length > 0 && (
          <View className="flex-row px-6 -mt-6 mb-4">
            {stats.map((stat, index) => (
              <View 
                key={index}
                className={`flex-1 bg-white rounded-2xl p-4 ${index < stats.length - 1 ? 'mr-2' : ''}`}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              >
                <Text className="text-gray-500 text-xs mb-1">{stat.label}</Text>
                <Text className="text-gray-900 text-2xl font-bold">{stat.value}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Menu Items */}
        <View className="px-6 pb-6">
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={item.onPress}
              className="bg-white rounded-2xl p-4 mb-3 flex-row items-center"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              <View 
                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: roleBgColor }}
              >
                <Ionicons name={item.icon} size={24} color={roleColor} />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-bold text-base mb-1">
                  {item.title}
                </Text>
                <Text className="text-gray-500 text-sm">
                  {item.subtitle}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BaseProfileScreen;
