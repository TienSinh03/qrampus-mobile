import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, TouchableOpacity, Animated } from 'react-native';

const Tab = createBottomTabNavigator();

const BaseTabNavigator = ({
  tabs = [], // Array of { name, component, label, icon, iconFocused }
  userRole = 'student', // 'student' or 'teacher'
}) => {
  const roleColor = userRole === 'teacher' ? '#7c3aed' : '#2563eb';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: roleColor,
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 85 : 75,
          paddingBottom: Platform.OS === 'ios' ? 25 : 15,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: '#f3f4f6',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          const currentTab = tabs.find(tab => tab.name === route.name);
          if (!currentTab) return null;

          const iconName = focused ? currentTab.iconFocused : currentTab.icon;
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      {tabs.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            tabBarLabel: tab.label,
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

export default BaseTabNavigator;
