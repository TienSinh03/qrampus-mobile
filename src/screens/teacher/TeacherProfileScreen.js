import React from 'react';
import BaseProfileScreen from '../../components/BaseProfileScreen';

const TeacherProfileScreen = ({ navigation }) => {
  const userData = {
    name: 'Thầy Nguyễn Văn A',
    id: 'Mã GV: GV001234',
    subtitle: 'Khoa Công nghệ thông tin',
    avatarUri: null,
  };

  const stats = [
    { label: 'Tỷ lệ điểm danh TB', value: '78%' },
    { label: 'Số giờ dạy', value: '18h' },
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
      icon: 'book-outline',
      title: 'Danh sách lớp học',
      subtitle: 'Quản lý các lớp học đang giảng dạy',
      onPress: () => console.log('My courses'),
    },
    {
      id: '3',
      icon: 'document-text-outline',
      title: 'Lịch sử điểm danh',
      subtitle: 'Xem lịch sử điểm danh các lớp',
      onPress: () => console.log('Attendance history'),
    },
    {
      id: '4',
      icon: 'stats-chart-outline',
      title: 'Thống kê chi tiết',
      subtitle: 'Báo cáo và phân tích điểm danh',
      onPress: () => console.log('Detailed statistics'),
    },
    {
      id: '5',
      icon: 'qr-code-outline',
      title: 'Quản lý QR',
      subtitle: 'Lịch sử tạo mã QR điểm danh',
      onPress: () => console.log('QR history'),
    },
    {
      id: '6',
      icon: 'settings-outline',
      title: 'Cài đặt',
      subtitle: 'Cài đặt ứng dụng',
      onPress: () => console.log('Settings'),
    },
    {
      id: '7',
      icon: 'help-circle-outline',
      title: 'Trợ giúp',
      subtitle: 'Hướng dẫn sử dụng và hỗ trợ',
      onPress: () => console.log('Help'),
    },
  ];

  return (
    <BaseProfileScreen
      navigation={navigation}
      userRole="teacher"
      userData={userData}
      stats={stats}
      menuItems={menuItems}
    />
  );
};

export default TeacherProfileScreen;
