import React, { useState } from 'react';
import BaseHomeScreen from '../../components/BaseHomeScreen';
import ScheduleCard from '../../components/ScheduleCard';

const StudentHomeScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const userRole = 'student';
  // thay bằng API call
  const [todaySchedules, setTodaySchedules] = useState([
    {
      id: '1',
      courseName: 'Lập trình Di động',
      courseCode: 'IT4788',
      room: 'D3-201',
      startTime: '07:00',
      endTime: '09:00',
      teacherName: 'TS. Nguyễn Văn A',
      hasQR: true,
    },
    {
      id: '2',
      courseName: 'Trí tuệ Nhân tạo',
      courseCode: 'IT4868',
      room: 'D5-302',
      startTime: '09:15',
      endTime: '11:15',
      teacherName: 'PGS.TS. Trần Thị B',
      hasQR: false,
    },
  ]);

  const userData = {
    name: 'Nguyễn Văn Nam',
    avatarUri: null,
  };
  const onRefresh = () => {
    setRefreshing(true);
    // giả lập tải dữ liệu
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
      userData={userData}
      todaySchedules={todaySchedules}
      refreshing={refreshing}
      onRefresh={onRefresh}
      renderScheduleCard={renderScheduleCard}
    />
  );
};

export default StudentHomeScreen;
