import React, { useState, useEffect } from 'react';
import BaseHomeScreen from '../../components/BaseHomeScreen';
import ScheduleCard from '../../components/ScheduleCard';
import { useSelector, useDispatch } from 'react-redux';
import { getStudentProfileThunk, getMySchedulesToday } from '../../features/student/studentThunks';
import { selectStudentProfile, selectSchedulesLoading, selectStudentSchedulesToday } from '../../features/student/studentSlice';
import { logoutThunk } from '../../features/auth/authThunks';
const StudentHomeScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const userRole = 'student';

  const dispatch = useDispatch();
  const profile = useSelector(selectStudentProfile);
  const isLoading = useSelector(selectSchedulesLoading);
  const schedules = useSelector(selectStudentSchedulesToday);


  const handleLogout = () => {
    dispatch(logoutThunk());
    
    navigation.reset({
      index: 0,
      routes: [{ name: 'IntroCarousel' }],
    });
  };

  const quickActions = [
    {
      id: '1',
      icon: 'time-outline',
      label: 'Lịch sử điểm danh',
      onPress: () => navigation.navigate('AttendanceHistory'),
    },
    {
      id: '2',
      icon: 'clipboard-outline',
      label: 'Xin nghỉ phép',
      onPress: () => navigation.navigate('LeaveRequest'),
    },
    {
      id: '3',
      icon: 'list-outline',
      label: 'Đơn y/c nghỉ của tôi',
      onPress: () => navigation.navigate('LeaveRequestList'),
    },
    {
      id: '4',
      icon: 'chatbox-ellipses-outline',
      label: 'Khảo sát',
      onPress: () => navigation.navigate('SurveyList'),
    },
    {
      id: '5',
      icon: 'stats-chart-outline',
      label: 'Thống kê',
      onPress: () => console.log('Statistics'),
    },
    // quản lý lần đ6ỏi thiết bị
    {
      id: '6',
      icon: 'phone-portrait-outline',
      label: 'Quản lý thiết bị',
      onPress: () => navigation.navigate('DeviceChangeHistory'),
    },
    {
      id: '7',
      icon: 'shield-checkmark-outline',
      label: 'Đổi mật khẩu',
      onPress: () => navigation.navigate('ChangePassword'),
    },
    {
      id: '8',
      icon: 'log-out-outline',
      label: 'Đăng xuất',
      onPress: () => handleLogout(),
    }
  ];

  useEffect(() => {
    // Load student profile on mount
    dispatch(getStudentProfileThunk());

    // Load today's schedules on mount
    dispatch(getMySchedulesToday());
  }, [dispatch]);


  const onRefresh = () => {
    setRefreshing(true);
    dispatch(getMySchedulesToday());
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const renderScheduleCard = (schedule) => (
    <ScheduleCard
      key={schedule.id}
      schedule={schedule}
      navigation={navigation}
    />
  );

  return (
    <BaseHomeScreen
      navigation={navigation}
      userRole={userRole}
      userData={profile}
      todaySchedules={schedules}
      refreshing={refreshing}
      onRefresh={onRefresh}
      renderScheduleCard={renderScheduleCard}
      isLoading={isLoading}
      quickActions={quickActions}
    />
  );
};

export default StudentHomeScreen;
