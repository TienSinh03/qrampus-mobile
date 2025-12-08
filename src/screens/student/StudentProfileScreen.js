import React from 'react';
import BaseProfileScreen from '../../components/BaseProfileScreen';

const StudentProfileScreen = ({ navigation }) => {
  const userData = {
    name: 'Nguyễn Văn Nam',
    id: 'MSSV: 20200001',
    subtitle: 'IT K65 - Công nghệ thông tin',
    avatarUri: null,
  };

  const stats = [
    { label: 'Tỷ lệ điểm danh', value: '92%' },
    { label: 'Số buổi học', value: '45' },
  ];

  const menuItems = [
    {
      id: '1',
      icon: 'person-outline',
      title: 'Thông tin cá nhân',
      subtitle: 'Xem và chỉnh sửa thông tin',
      onPress: () => console.log('Profile info'),
    },
    {
      id: '2',
      icon: 'document-text-outline',
      title: 'Lịch sử điểm danh',
      subtitle: 'Xem lịch sử điểm danh các môn học',
      onPress: () => console.log('Attendance history'),
    },
    {
      id: '3',
      icon: 'stats-chart-outline',
      title: 'Thống kê',
      subtitle: 'Xem thống kê điểm danh',
      onPress: () => console.log('Statistics'),
    },
    {
      id: '4',
      icon: 'settings-outline',
      title: 'Cài đặt',
      subtitle: 'Cài đặt ứng dụng',
      onPress: () => console.log('Settings'),
    },
    {
      id: '5',
      icon: 'help-circle-outline',
      title: 'Trợ giúp',
      subtitle: 'Hướng dẫn sử dụng và hỗ trợ',
      onPress: () => console.log('Help'),
    },
  ];

  return (
    <BaseProfileScreen
      navigation={navigation}
      userRole="student"
      userData={userData}
      stats={stats}
      menuItems={menuItems}
    />
  );
};

export default StudentProfileScreen;
