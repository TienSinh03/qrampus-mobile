import React from 'react';
import BaseTabNavigator from '../navigations/BaseTabNavigator';
import TeacherHomeScreen from '../screens/teacher/TeacherHomeScreen';
import TeacherScheduleScreen from '../screens/teacher/TeacherScheduleScreen';
import TeacherProfileScreen from '../screens/teacher/TeacherProfileScreen';
import TeacherCoursesScreen from '../screens/teacher/TeacherCoursesScreen';

const TeacherTabNavigator = ({ route }) => {
  const role = route.params?.userRole;
  const tabs = [
    {
      name: 'Home',
      component: TeacherHomeScreen,
      label: 'Trang chủ',
      icon: 'home-outline',
      iconFocused: 'home',
    },
    {
      name: 'Courses',
      component: TeacherCoursesScreen,
      label: 'Khóa học',
      icon: 'book-outline',
      iconFocused: 'book',
    },
    {
      name: 'Schedule',
      component: TeacherScheduleScreen,
      label: 'Lịch giảng',
      icon: 'calendar-outline',
      iconFocused: 'calendar',
    },
    {
      name: 'Profile',
      component: TeacherProfileScreen,
      label: 'Cá nhân',
      icon: 'person-outline',
      iconFocused: 'person',
    },
  ];

  return <BaseTabNavigator tabs={tabs} userRole={role} />;
};

export default TeacherTabNavigator;
