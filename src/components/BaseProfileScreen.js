import React from 'react';
import { View, Text, ScrollView, TouchableOpacity,RefreshControl } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const BaseProfileScreen = ({
  navigation,
  userRole = 'student', // 'student' or 'teacher'
  userData,
  stats = [], // Array of stats objects: { label, value }
  menuItems = [], // Array of menu items
  onLogout,
}) => {
  const roleColors = userRole === 'teacher' 
    ? ['#7c3aed', '#8b5cf6']  // purple gradient
    : ['#2563eb', '#3b82f6'];  // blue gradient
  
  const roleColor = userRole === 'teacher' ? '#7c3aed' : '#2563eb';
  const roleBgColor = userRole === 'teacher' ? '#faf5ff' : '#eff6ff';

  const [refreshing, setRefreshing] = React.useState(false);
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'IntroCarousel' }],
      });
    }
  };


  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      <ScrollView 
        className="flex-1" 
        showsVerticalScrollIndicator={false} 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Profile Header */}
        <LinearGradient
          colors={roleColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="px-6 pt-6 pb-8"
        >
          <View className="items-center">
            {/* Avatar */}
            <View 
              className="w-24 h-24 rounded-full bg-white items-center justify-center mb-4"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
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
                <Text className="text-4xl font-bold" style={{ color: roleColor }}>
                  {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
                </Text>
              )}
            </View>

            {/* User Info */}
            <Text className="text-white text-2xl font-bold mb-1">
              {userData?.name || 'Người dùng'}
            </Text>
            <Text className="text-white/80 text-base mb-1">
              {userData?.id || ''}
            </Text>
            <Text className="text-white/80 text-sm">
              {userData?.subtitle || ''}
            </Text>
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

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-50 rounded-2xl p-4 mt-2 flex-row items-center justify-center"
          >
            <Ionicons name="log-out-outline" size={24} color="#dc2626" />
            <Text className="text-red-600 font-bold text-base ml-2">
              Đăng xuất
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BaseProfileScreen;
