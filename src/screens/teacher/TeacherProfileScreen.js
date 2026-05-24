import React, { useEffect } from 'react';
import BaseProfileScreen from '../../components/BaseProfileScreen';
import { useSelector, useDispatch } from 'react-redux';
import { selectTeacherProfile, selectTeacherError, selectTeacherLoading } from '../../features/teacher/teacherSlice';
import { getTeacherProfileThunk } from '../../features/teacher/teacherThunks';

const TeacherProfileScreen = ({ navigation }) => {

  const dispatch = useDispatch();
  const profile = useSelector(selectTeacherProfile);
  const error = useSelector(selectTeacherError);
  const isLoading = useSelector(selectTeacherLoading);
  console.log(' profile teacher profile:', profile);
  useEffect(() => {
    if (!profile && !isLoading) {
      dispatch(getTeacherProfileThunk());
    }
  }, [profile, isLoading, dispatch]);


  const userData = {
    name: profile?.full_name || 'Giảng viên',
    code: `MSGV: ${profile?.teacher_code || ''}`,
    major: profile?.department || '',
    avatarUri: profile?.avatar_url || null,
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
      onPress: () => navigation.navigate('ProfileDetail'),
    },
    {
      id: '2',
      icon: 'document-text-outline',
      title: 'Lịch sử chấm công',
      subtitle: 'Xem lịch sử chấm công',
      onPress: () => navigation.navigate('TeacherAttendanceHistory'),
    },
    {
      id: '3',
      icon: 'stats-chart-outline',
      title: 'Thống kê chi tiết',
      subtitle: 'Báo cáo và phân tích chấm công',
      onPress: () => navigation.navigate('TeacherAttendanceAnalytics'),
    },
    {
      id: '4',
      icon: 'settings-outline',
      title: 'Cài đặt',
      subtitle: 'Cài đặt ứng dụng',
      onPress: () => navigation.navigate('Setting', { userRole: 'teacher' }),
    },
    {
      id: '5',
      icon: 'help-circle-outline',
      title: 'Trợ giúp',
      subtitle: 'Hướng dẫn sử dụng và hỗ trợ',
      onPress: () => console.log('Help'),
    },
    { id: '6', icon: 'document-text-outline', title: 'Điều khoản & Chính sách', subtitle: 'Xem điều khoản và chính sách sử dụng', onPress: () => navigation.navigate('TermsPolicies') }
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
