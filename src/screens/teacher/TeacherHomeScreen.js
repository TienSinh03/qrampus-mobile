import React, { useState, useEffect } from 'react';
import BaseHomeScreen from '../../components/BaseHomeScreen';
import TeacherScheduleCard from '../../components/TeacherScheduleCard';
import { useSelector, useDispatch } from 'react-redux';
import { logoutThunk } from '../../features/auth/authThunks';
import { getTeacherProfileThunk, getMySchedulesToday } from '../../features/teacher/teacherThunks';
import { selectTeacherProfile, selectTeacherSchedulesToday, selectSchedulesLoading } from '../../features/teacher/teacherSlice';

const TeacherHomeScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [urgentAlerts, setUrgentAlerts] = useState([]);
  const userRole = 'teacher';

  const dispatch = useDispatch();
  const profile = useSelector(selectTeacherProfile);
  const isLoading = useSelector(selectSchedulesLoading);
  const schedules = useSelector(selectTeacherSchedulesToday);

  const handleLogout = () => {
    dispatch(logoutThunk());
    
    navigation.reset({
      index: 0,
      routes: [{ name: 'IntroCarousel' }],
    });
  };

  //thay bằng API call
  const stats = {
    attendanceRate: 78.5,
    hoursThisWeek: 18,
    studentCount: 125,
  };

  useEffect(() => {
    // Load student profile on mount
    dispatch(getTeacherProfileThunk());
    
    // Load today's schedules on mount
    dispatch(getMySchedulesToday());
  }, [dispatch]);

  // Kiểm tra các lớp học sắp bắt đầu để tạo cảnh báo khẩn cấp
  useEffect(() => {
    const checkUrgentAlerts = () => {
      const now = new Date();
      const alerts = [];

      schedules.forEach((schedule) => {
        const [startHourNum, startMinute] = schedule.startHour.split(':').map(Number);
        const classTime = new Date();
        classTime.setHours(startHourNum, startMinute, 0, 0);
        
        const diffMs = classTime - now;
        const diffMinutes = Math.floor(diffMs / 60000);
        
        // Cảnh báo nếu lớp học đã bắt đầu và chưa tạo QR (trong vòng 5 phút sau khi bắt đầu)
        if (diffMinutes >= -5 && diffMinutes <= 0 && !schedule.hasActiveSession) {
          alerts.push({
            title: 'Chưa tạo QR điểm danh!',
            message: `${schedule.courseCode} - ${schedule.courseName} (${schedule.startHour})`,
            scheduleId: schedule.id,
          });
        }
      });

      setUrgentAlerts(alerts);
    };

    checkUrgentAlerts();
    const interval = setInterval(checkUrgentAlerts, 30000); // Check every 30s
    
    return () => clearInterval(interval);
  }, [schedules]);

  const onRefresh = () => {
    setRefreshing(true);
    // Call API to refresh data
    dispatch(getTeacherProfileThunk());
    dispatch(getMySchedulesToday());
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const quickActions = [
    {
      id: '1',
      icon: 'qr-code-outline',
      label: 'Quản lý QR',
      onPress: () => navigation.navigate('TeacherMyClasses'),
    },
    {
      id: '2',
      icon: 'calendar-outline',
      label: 'Phiên học',
      onPress: () => navigation.navigate('TeacherMyClasses'),
    },
    {
      id: '3',
      icon: 'document-text-outline',
      label: 'Duyệt nghỉ phép',
      onPress: () => navigation.navigate('TeacherLeaveRequestList'),
      badge: 3
    },
    // {
    //   id: '4',
    //   icon: 'people-outline',
    //   label: 'Danh sách SV',
    //   onPress: () => navigation.navigate('StudentList'),
    //   // onPress: () => console.log('Student List'),
    // },
    // QUẢN LÝ THÔNG BÁO
    {
      id: '4',
      icon: 'notifications-outline',
      label: 'Quản lý Thông báo',
      onPress: () => navigation.navigate('TeacherNotification'),
      badge: 5
    },
    //QUẢN LÝ KHẢO SÁT
    {
      id: '5',
      icon: 'clipboard-outline',
      label: 'Quản lý Khảo sát',
      onPress: () => navigation.navigate('SurveyScreen'),
      badge: 2
    },
    {
      id: '6',
      icon: 'people-outline',
      label: 'Danh sách SV',
      onPress: () => navigation.navigate('StudentList'),
      // onPress: () => console.log('Student List'),
    },
    {
      id: '7',
      icon: 'bar-chart-outline',
      label: 'Thống kê',
      onPress: () => navigation.navigate('TeacherStatistics'),
      // onPress: () => console.log('Statistics'),
    },
    // ĐĂNG XUẤT
    {
      id: '8',
      icon: 'log-out-outline',
      label: 'Đăng xuất',
      onPress: handleLogout,
    }
  ];

  const renderScheduleCard = (schedule) => (
    <TeacherScheduleCard
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
      stats={stats}
      urgentAlerts={urgentAlerts}
      refreshing={refreshing}
      onRefresh={onRefresh}
      renderScheduleCard={renderScheduleCard}
      isLoading={isLoading}
      quickActions={quickActions}
    />
  );
};

export default TeacherHomeScreen;
