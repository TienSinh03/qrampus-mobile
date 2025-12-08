import React from 'react';
import BaseTabNavigator from './BaseTabNavigator';
import StudentHomeScreen from '../screens/student/StudentHomeScreen';
import StudentProfileScreen from '../screens/student/StudentProfileScreen';
import StudentScheduleScreen from '../screens/student/StudentScheduleScreen';

const StudentTabNavigator = ({ route }) => {
  const role = route.params?.userRole;
  const tabs = [
    {
      name: 'Home',
      component: StudentHomeScreen,
      label: 'Trang chủ',
      icon: 'home-outline',
      iconFocused: 'home',
    },
    {
      name: 'Schedule',
      component: StudentScheduleScreen,
      label: 'Lịch học',
      icon: 'calendar-outline',
      iconFocused: 'calendar',
    },
    {
      name: 'Profile',
      component: StudentProfileScreen,
      label: 'Cá nhân',
      icon: 'person-outline',
      iconFocused: 'person',
    },
  ];

  return <BaseTabNavigator tabs={tabs} userRole={role} />;
};

export default StudentTabNavigator;
