import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import NotificationItem from '../components/NotificationItem';

const NotificationScreen = ({ navigation }) => {
  const userRole = 'student' // sau này thay thế bằng uid từ auth để lấy role thực
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'

  // Config theo role
  const roleConfig = {
    student: {
      headerBg: 'bg-blue-600',
      headerText: 'text-blue-100',
      unreadBg: 'bg-blue-50',
      unreadText: 'text-blue-900',
      buttonBg: 'bg-blue-600',
      tagBg: 'bg-blue-100',
      tagText: 'text-blue-700',
      dot: 'bg-blue-600',
    },
    teacher: {
      headerBg: 'bg-purple-600',
      headerText: 'text-purple-100',
      unreadBg: 'bg-purple-50',
      unreadText: 'text-purple-900',
      buttonBg: 'bg-purple-600',
      tagBg: 'bg-purple-100',
      tagText: 'text-purple-700',
      dot: 'bg-purple-600',
    },
  };

  const configRole = roleConfig[userRole];

  // thay bằng API call
  const getNotifications = () => {
    if (userRole === 'student') {
      return [
        {
          id: '1',
          type: 'class_reminder',
          title: 'Sắp đến giờ học',
          message: 'Lớp "Lập trình Di động" sẽ bắt đầu sau 15 phút tại phòng D3-201',
          courseCode: 'IT4788',
          courseName: 'Lập trình Di động',
          room: 'D3-201',
          time: '2025-01-06 06:45',
          isRead: false,
          icon: 'time-outline',
          iconColor: '#f59e0b',
        },
        {
          id: '2',
          type: 'class_started',
          title: 'Tiết học đã bắt đầu',
          message: 'Lớp "Trí tuệ Nhân tạo" đang diễn ra. Vui lòng điểm danh.',
          courseCode: 'IT4868',
          courseName: 'Trí tuệ Nhân tạo',
          room: 'D5-302',
          time: '2025-01-05 09:15',
          isRead: false,
          icon: 'play-circle-outline',
          iconColor: '#10b981',
        },
        {
          id: '3',
          type: 'attendance_success',
          title: 'Điểm danh thành công',
          message: 'Bạn đã điểm danh thành công cho lớp "Cơ sở dữ liệu"',
          courseCode: 'IT4420',
          courseName: 'Cơ sở dữ liệu',
          time: '2025-01-04 13:05',
          isRead: true,
          icon: 'checkmark-circle-outline',
          iconColor: '#10b981',
        },
        {
          id: '4',
          type: 'class_cancelled',
          title: 'Lớp học bị hủy',
          message: 'Lớp "Mạng máy tính" ngày 06/01 đã bị hủy. Lý do: Giảng viên bận công tác.',
          courseCode: 'IT4883',
          courseName: 'Mạng máy tính',
          time: '2025-01-03 14:30',
          isRead: true,
          icon: 'close-circle-outline',
          iconColor: '#ef4444',
        },
        {
          id: '5',
          type: 'schedule_change',
          title: 'Thay đổi lịch học',
          message: 'Lớp "An toàn thông tin" được chuyển từ phòng D9-101 sang D7-203',
          courseCode: 'IT4501',
          courseName: 'An toàn thông tin',
          time: '2025-01-02 10:20',
          isRead: true,
          icon: 'swap-horizontal-outline',
          iconColor: '#3b82f6',
        },
      ];
    } else {
      return [
        {
          id: '1',
          type: 'class_reminder_15min',
          title: 'Sắp đến giờ lên lớp',
          message: 'Lớp "Lập trình Di động" sẽ bắt đầu sau 15 phút tại phòng D3-201',
          courseCode: 'IT4788',
          courseName: 'Lập trình Di động',
          room: 'D3-201',
          startTime: '07:00',
          time: '2025-01-06 06:45',
          isRead: false,
          icon: 'time-outline',
          iconColor: '#f59e0b',
          priority: 'high',
        },
        {
          id: '2',
          type: 'create_session_now',
          title: 'Đã đến giờ tạo phiên điểm danh',
          message: 'Lớp "Trí tuệ Nhân tạo" đã bắt đầu. Vui lòng tạo mã QR điểm danh.',
          courseCode: 'IT4868',
          courseName: 'Trí tuệ Nhân tạo',
          room: 'D5-302',
          startTime: '09:15',
          time: '2025-01-06 09:15',
          isRead: false,
          icon: 'qr-code-outline',
          iconColor: '#10b981',
          priority: 'urgent',
          action: 'create_qr',
        },
        {
          id: '3',
          type: 'missing_qr_5min',
          title: '⚠️ Chưa tạo mã QR điểm danh',
          message: 'Lớp "Cơ sở dữ liệu" đã bắt đầu được 5 phút nhưng chưa có mã QR điểm danh.',
          courseCode: 'IT4420',
          courseName: 'Cơ sở dữ liệu',
          room: 'D9-101',
          startTime: '13:00',
          time: '2025-01-06 13:05',
          isRead: false,
          icon: 'alert-circle-outline',
          iconColor: '#ef4444',
          priority: 'urgent',
          action: 'create_qr',
        },
        {
          id: '4',
          type: 'session_created',
          title: 'Phiên điểm danh đã được tạo',
          message: 'Mã QR điểm danh cho lớp "Mạng máy tính" đã sẵn sàng. 25/30 sinh viên đã điểm danh.',
          courseCode: 'IT4883',
          courseName: 'Mạng máy tính',
          room: 'D8-405',
          attendanceRate: '25/30',
          time: '2025-01-05 15:20',
          isRead: true,
          icon: 'checkmark-circle-outline',
          iconColor: '#10b981',
          priority: 'normal',
        },
        {
          id: '5',
          type: 'low_attendance',
          title: 'Tỷ lệ điểm danh thấp',
          message: 'Chỉ có 12/30 sinh viên điểm danh cho lớp "An toàn thông tin". Cân nhắc gia hạn thời gian?',
          courseCode: 'IT4501',
          courseName: 'An toàn thông tin',
          attendanceRate: '12/30',
          time: '2025-01-05 10:35',
          isRead: true,
          icon: 'stats-chart-outline',
          iconColor: '#f59e0b',
          priority: 'normal',
        },
        {
          id: '6',
          type: 'session_ended',
          title: 'Phiên điểm danh đã kết thúc',
          message: 'Phiên điểm danh "Lập trình Web" đã kết thúc. 28/30 sinh viên đã điểm danh (93%).',
          courseCode: 'IT4409',
          courseName: 'Lập trình Web',
          attendanceRate: '28/30',
          time: '2025-01-04 11:45',
          isRead: true,
          icon: 'flag-outline',
          iconColor: '#6b7280',
          priority: 'normal',
        },
      ];
    }
  };

  const notifications = getNotifications();

  /**
   * Lọc thông báo theo trạng thái
   * Nếu filter = 'all' => tất cả
   * Nếu filter = 'unread' => chưa đọc
   * Nếu filter = 'read' => đã đọc
   */
  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.isRead;
    if (filter === 'read') return notif.isRead;
    return true;
  });

  // Đếm số thông báo chưa đọc
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const onRefresh = () => {
    setRefreshing(true);
    // Gọi API để lấy thông báo mới
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const handleNotificationPress = (notification) => {
    console.log('Notification pressed:', notification);
    // Xử lý action tương ứng
    if (notification.action === 'create_qr') {
      console.log('Navigate to create QR for:', notification.courseCode);
    }
  };

  // Hàm đánh dấu tất cả thông báo là đã đọc
  const markAllAsRead = () => {
    console.log('Mark all as read');
    // Gọi API đánh dấu tất cả đã đọc
  };

  // Hàm định dạng thời gian hiển thị
  const getTimeAgo = (timeString) => {
    const now = new Date();
    const notifTime = new Date(timeString);
    const diffMs = now - notifTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    
    return notifTime.toLocaleDateString('vi-VN');
  };

  const getPriorityBorder = (priority) => {
    if (userRole === 'student') return 'border-l-4 border-transparent';
    
    switch (priority) {
      case 'urgent':
        return 'border-l-4 border-red-500';
      case 'high':
        return 'border-l-4 border-orange-500';
      default:
        return 'border-l-4 border-transparent';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View className={`${configRole.headerBg} px-4 py-3`}>
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              className="mr-3"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View>
              <Text className="text-white text-xl font-bold">
                Thông báo
              </Text>
              {unreadCount > 0 && (
                <Text className={`${configRole.headerText} text-xs mt-0.5`}>
                  {unreadCount} thông báo chưa đọc
                </Text>
              )}
            </View>
          </View>
          <TouchableOpacity onPress={markAllAsRead}>
            <Ionicons name="checkmark-done" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="bg-white px-4 py-3 flex-row border-b border-gray-200">
        <TouchableOpacity
          onPress={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg mr-2 ${
            filter === 'all' ? configRole.buttonBg : 'bg-white'
          }`}
        >
          <Text
            className={`font-semibold ${
              filter === 'all' ? 'text-white' : 'text-gray-600'
            }`}
          >
            Tất cả
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg mr-2 ${
            filter === 'unread' ? configRole.buttonBg : 'bg-white'
          }`}
        >
          <Text
            className={`font-semibold ${
              filter === 'unread' ? 'text-white' : 'text-gray-600'
            }`}
          >
            Chưa đọc {unreadCount > 0 && `(${unreadCount})`}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setFilter('read')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'read' ? configRole.buttonBg : 'bg-white'
          }`}
        >
          <Text
            className={`font-semibold ${
              filter === 'read' ? 'text-white' : 'text-gray-600'
            }`}
          >
            Đã đọc
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications List */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              configRole={configRole}
              onPress={handleNotificationPress}
              getTimeAgo={getTimeAgo}
              getPriorityBorder={getPriorityBorder}
            />
          ))
        ) : (
          <View className="items-center justify-center py-20">
            <Ionicons name="notifications-off-outline" size={64} color="#d1d5db" />
            <Text className="text-gray-400 text-base mt-4">
              {filter === 'unread' ? 'Không có thông báo chưa đọc' : 
               filter === 'read' ? 'Không có thông báo đã đọc' :
               'Chưa có thông báo nào'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationScreen;
