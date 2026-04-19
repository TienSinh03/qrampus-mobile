import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import BaseProfileScreen from '../../components/BaseProfileScreen';
import { selectStudentProfile, selectStudentLoading } from '../../features/student/studentSlice';
import { getStudentProfileThunk } from '../../features/student/studentThunks';

const StudentProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const profile = useSelector(selectStudentProfile);
  const isLoading = useSelector(selectStudentLoading);

  // Chỉ fetch nếu chưa có data (trường hợp user vào ProfileScreen trước)
  useEffect(() => {
    if (!profile && !isLoading) {
      dispatch(getStudentProfileThunk());
    }
  }, [profile, isLoading, dispatch]);

  // Map dữ liệu từ API sang format UI
  const userData = profile ? {
    name: profile?.full_name || 'Sinh viên',
    code: `MSSV: ${profile?.student_code || ''}`,
    major: profile?.class_name || '',
    avatarUri: profile?.avatar_url || null,
  } : {
    name: 'Đang tải...',
    code: 'MSSV: ---',
    major: '---',
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
      // onPress: () => console.log('Profile info'),
      onPress: () => navigation.navigate('ProfileDetail'),
    },
    {
      id: '2',
      icon: 'lock-closed-outline',
      title: 'Đổi mật khẩu',
      subtitle: 'Thay đổi mật khẩu đăng nhập',
      onPress: () => navigation.navigate('ChangePassword'),
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
    }
    
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
