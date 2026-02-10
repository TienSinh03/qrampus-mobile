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
      icon: 'clipboard-outline',
      title: 'Xin nghỉ phép',
      subtitle: 'Nộp đơn xin nghỉ học có phép',
      onPress: () => navigation.navigate('LeaveRequest'),
    },
    {
      id: '4',
      icon: 'list-outline',
      title: 'Yêu cầu của tôi',
      subtitle: 'Xem danh sách đơn đã nộp',
      onPress: () => navigation.navigate('LeaveRequestList'),
    },
    {
      id: '5',
      icon: 'stats-chart-outline',
      title: 'Thống kê',
      subtitle: 'Xem thống kê điểm danh',
      onPress: () => console.log('Statistics'),
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
    // khảo sát
    {
      id: '8',
      icon: 'chatbox-ellipses-outline',
      title: 'Khảo sát',
      subtitle: 'Tham gia các khảo sát khóa học',
      onPress: () => navigation.navigate('SurveyList'),
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
