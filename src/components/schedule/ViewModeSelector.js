import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const ViewModeSelector = ({ viewMode, onViewModeChange, userRole }) => {
  return (
    <View className="bg-white px-4 py-3 flex-row border-b border-gray-200">
      <TouchableOpacity
        onPress={() => onViewModeChange('day')}
        className={`px-6 py-2 rounded-lg mr-2 ${
          viewMode === 'day' ? (userRole === 'teacher' ? 'bg-sky-700' : 'bg-blue-600') : 'bg-white'
        }`}
      >
        <Text
          className={`font-semibold ${
            viewMode === 'day' ? 'text-white' : 'text-gray-600'
          }`}
        >
          Ngày
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onViewModeChange('week')}
        className={`px-6 py-2 rounded-lg mr-2 ${
          viewMode === 'week' ? (userRole === 'teacher' ? 'bg-sky-700' : 'bg-blue-600') : 'bg-white'
        }`}
      >
        <Text
          className={`font-semibold ${
            viewMode === 'week' ? 'text-white' : 'text-gray-600'
          }`}
        >
          Tuần
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onViewModeChange('month')}
        className={`px-6 py-2 rounded-lg ${
          viewMode === 'month' ? (userRole === 'teacher' ? 'bg-sky-700' : 'bg-blue-600') : 'bg-white'
        }`}
      >
        <Text
          className={`font-semibold ${
            viewMode === 'month' ? 'text-white' : 'text-gray-600'
          }`}
        >
          Tháng
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ViewModeSelector;
