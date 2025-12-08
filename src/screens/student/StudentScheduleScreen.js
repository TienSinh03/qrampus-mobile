import React from 'react';
import BaseScheduleScreen from '../../components/BaseScheduleScreen';
import ScheduleCard from '../../components/ScheduleCard';

const StudentScheduleScreen = ({ navigation }) => {
  const userRole = 'student';
  // Mock data - thay bằng API call
  const scheduleData = {
    '2025-01-06': [
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
    ],
    '2025-01-07': [
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
    ],
    '2025-01-09': [
      {
        id: '3',
        courseName: 'Cơ sở dữ liệu',
        courseCode: 'IT4420',
        room: 'D9-101',
        startTime: '13:00',
        endTime: '15:00',
        teacherName: 'TS. Lê Văn C',
        hasQR: false,
      },
    ],
  };

  return (
    <BaseScheduleScreen
      navigation={navigation}
      userRole={userRole}
      title="Lịch học/ lịch thi"
      scheduleData={scheduleData}
    />
  );
};

export default StudentScheduleScreen;
