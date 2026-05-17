import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { selectLoginRole } from '../features/auth/authSlice';
const Tab = createBottomTabNavigator();

const BaseTabNavigator = ({
  tabs = [], // Array of { name, component, label, icon, iconFocused }
}) => {
  const userRole = useSelector(selectLoginRole);
  const roleColor = userRole === 'teacher' ? '#0171a5' : '#2563eb';
  const insets = useSafeAreaInsets();
  const bottomInset = Platform.OS === 'ios' ? insets.bottom : Math.max(insets.bottom, 12);
  const tabBarHeight = Platform.OS === 'ios' ? 60 + bottomInset : 60 + bottomInset;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: roleColor,
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          height: tabBarHeight,
          paddingBottom: bottomInset,
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
        tabBarItemStyle: {
          paddingBottom: Platform.OS === 'android' ? 2 : 0,
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
