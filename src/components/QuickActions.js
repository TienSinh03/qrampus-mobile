import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const QuickActionItem = ({ item, roleColor, roleBgColor }) => (
  <TouchableOpacity
    onPress={item.onPress}
    className="items-center mb-3 mx-2"
    style={{ width: 64 }}
  >
    <View
      className="w-14 h-14 rounded-full items-center justify-center mb-1"
      style={{
        backgroundColor: roleBgColor,
        shadowColor: roleColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <Ionicons name={item.icon} size={24} color={roleColor} />
    </View>
    <Text
      className="text-gray-600 text-center"
      style={{ fontSize: 10, lineHeight: 14 }}
      numberOfLines={2}
    >
      {item.label}
    </Text>
  </TouchableOpacity>
);

const QuickActions = ({ actions = [], roleColor, roleBgColor, userRole = 'student' }) => {
  if (!actions || actions.length === 0) return null;

  return (
    <View className="px-4 mb-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-gray-900 text-lg font-bold">
          Truy cập nhanh 
        </Text>
        <Text 
          className="text-sm font-semibold"
          style={{ color: roleColor }}
        >
          {userRole === 'teacher' ? '3 mục' : '8 mục'}
        </Text>
      </View>
      <FlatList
        data={actions}
        keyExtractor={(item) => item.id}
        horizontal={false}
        numColumns={4}
        scrollEnabled={false}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        renderItem={({ item }) => (
          <QuickActionItem
            item={item}
            roleColor={roleColor}
            roleBgColor={roleBgColor}
          />
        )}
      />
    </View>
  );
};

export default QuickActions;