import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const TeacherLeaveRequestListScreen = ({ navigation, route }) => {
  const [requests, setRequests] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filterStatus, setFilterStatus] = useState('pending'); // pending, approved, rejected, all
  const [filterCourse, setFilterCourse] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    // TODO: API GET /api/teachers/{teacher_id}/leave-requests
    // Response: [{ id, student_name, student_id, courseCode, schedule, 
    //   reason_type, note, attachments, status, created_at, hours_remaining }]

    const mockRequests = [
      {
        id: 1,
        studentName: 'Nguyễn Văn A',
        studentId: '20210001',
        studentAvatar: null,
        courseCode: 'IT4788',
        schedule: {
          courseName: 'Lập trình Di động',
          courseCode: 'IT4788',
          date: '2025-12-08',
          dayOfWeek: 'Thứ 2',
          startTime: '07:00',
          endTime: '09:00',
          room: 'D3-201',
        },
        reasonType: 'sick',
        reasonLabel: 'Bệnh',
        note: 'Em bị sốt cao và đau đầu, đã đi khám bác sĩ và được nghỉ ngơi 2 ngày.',
        attachments: [
          { id: 1, uri: 'https://via.placeholder.com/150', name: 'giay_kham_benh.jpg', type: 'image' },
        ],
        status: 'pending',
        createdAt: '2025-12-10 10:30:00',
        hoursRemaining: 35, // 48h deadline
      },
      {
        id: 2,
        studentName: 'Trần Thị B',
        studentId: '20210002',
        studentAvatar: null,
        courseCode: 'IT3090',
        schedule: {
          courseName: 'Cơ sở dữ liệu',
          courseCode: 'IT3090',
          date: '2025-12-09',
          dayOfWeek: 'Thứ 3',
          startTime: '13:00',
          endTime: '15:00',
          room: 'D5-302',
        },
        reasonType: 'family',
        reasonLabel: 'Việc gia đình',
        note: 'Em phải về quê gấp vì gia đình có việc khẩn cấp.',
        attachments: [
          { id: 2, uri: 'https://via.placeholder.com/150', name: 'giay_xin_phep.jpg', type: 'image' },
        ],
        status: 'pending',
        createdAt: '2025-12-11 08:00:00',
        hoursRemaining: 20,
      },
      {
        id: 3,
        studentName: 'Lê Văn C',
        studentId: '20210003',
        studentAvatar: null,
        courseCode: 'IT4788',
        schedule: {
          courseName: 'Lập trình Di động',
          courseCode: 'IT4788',
          date: '2025-12-10',
          dayOfWeek: 'Thứ 4',
          startTime: '07:00',
          endTime: '09:00',
          room: 'D3-201',
        },
        reasonType: 'school_activity',
        reasonLabel: 'Hoạt động trường',
        note: 'Em tham gia cuộc thi Olympic Tin học cấp trường.',
        attachments: [
          { id: 3, uri: 'https://via.placeholder.com/150', name: 'giay_moi.pdf', type: 'pdf' },
        ],
        status: 'approved',
        createdAt: '2025-12-09 14:00:00',
        reviewedAt: '2025-12-09 16:00:00',
      },
    ];

    // Extract unique courses
    const uniqueCourses = [];
    const courseCodes = new Set();
    mockRequests.forEach(req => {
      if (!courseCodes.has(req.courseCode)) {
        courseCodes.add(req.courseCode);
        uniqueCourses.push({
          courseCode: req.schedule.courseCode,
          name: req.schedule.courseName,
          pendingCount: mockRequests.filter(r => r.courseCode === req.courseCode && r.status === 'pending').length,
        });
      }
    });

    setRequests(mockRequests);
    setCourses(uniqueCourses);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ duyệt';
      case 'approved':
        return 'Đã duyệt';
      case 'rejected':
        return 'Đã từ chối';
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return 'time';
      case 'approved':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const getReasonIcon = (reasonType) => {
    switch (reasonType) {
      case 'sick':
        return 'medkit';
      case 'family':
        return 'home';
      case 'school_activity':
        return 'school';
      default:
        return 'ellipsis-horizontal';
    }
  };

  const handleViewDetail = (request) => {
    navigation.navigate('TeacherLeaveRequestDetail', { request });
  };

  const filteredRequests = requests.filter((req) => {
    const matchStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchCourse = filterCourse === 'all' || req.courseCode === filterCourse;
    return matchStatus && matchCourse;
  });

  const pendingCount = requests.filter(r => 
    (filterCourse === 'all' || r.courseCode === filterCourse) && r.status === 'pending'
  ).length;
  const approvedCount = requests.filter(r => 
    (filterCourse === 'all' || r.courseCode === filterCourse) && r.status === 'approved'
  ).length;
  const rejectedCount = requests.filter(r => 
    (filterCourse === 'all' || r.courseCode === filterCourse) && r.status === 'rejected'
  ).length;

  // Count urgent requests (< 12h remaining)
  const urgentCount = requests.filter(r => 
    r.status === 'pending' && r.hoursRemaining < 12
  ).length;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient
        colors={['#7c3aed', '#8b5cf6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 py-4"
      >
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold flex-1">Duyệt đơn nghỉ phép</Text>
          {urgentCount > 0 && (
            <View className="bg-red-500 rounded-full px-3 py-1">
              <Text className="text-white text-xs font-bold">
                {urgentCount} khẩn
              </Text>
            </View>
          )}
        </View>

        {/* Course Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
          <TouchableOpacity
            onPress={() => setFilterCourse('all')}
            className={`px-4 py-2 rounded-lg mr-2 ${
              filterCourse === 'all' ? 'bg-white' : 'bg-white/20'
            }`}
          >
            <Text className={`font-semibold ${
              filterCourse === 'all' ? 'text-purple-600' : 'text-white'
            }`}>
              Tất cả môn
            </Text>
          </TouchableOpacity>
          {courses.map((course) => (
            <TouchableOpacity
              key={course.courseCode}
              onPress={() => setFilterCourse(course.courseCode)}
              className={`px-4 py-2 rounded-lg mr-2 ${
                filterCourse === course.courseCode ? 'bg-white' : 'bg-white/20'
              }`}
            >
              <Text className={`font-semibold ${
                filterCourse === course.courseCode ? 'text-purple-600' : 'text-white'
              }`}>
                {course.courseCode}
                {course.pendingCount > 0 && ` (${course.pendingCount})`}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Status Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          <TouchableOpacity
            onPress={() => setFilterStatus('pending')}
            className={`px-4 py-2 rounded-lg mr-2 ${
              filterStatus === 'pending' ? 'bg-white' : 'bg-white/20'
            }`}
          >
            <Text className={`font-semibold ${
              filterStatus === 'pending' ? 'text-purple-600' : 'text-white'
            }`}>
              Chờ duyệt ({pendingCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilterStatus('approved')}
            className={`px-4 py-2 rounded-lg mr-2 ${
              filterStatus === 'approved' ? 'bg-white' : 'bg-white/20'
            }`}
          >
            <Text className={`font-semibold ${
              filterStatus === 'approved' ? 'text-purple-600' : 'text-white'
            }`}>
              Đã duyệt ({approvedCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilterStatus('rejected')}
            className={`px-4 py-2 rounded-lg mr-2 ${
              filterStatus === 'rejected' ? 'bg-white' : 'bg-white/20'
            }`}
          >
            <Text className={`font-semibold ${
              filterStatus === 'rejected' ? 'text-purple-600' : 'text-white'
            }`}>
              Đã từ chối ({rejectedCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg ${
              filterStatus === 'all' ? 'bg-white' : 'bg-white/20'
            }`}
          >
            <Text className={`font-semibold ${
              filterStatus === 'all' ? 'text-purple-600' : 'text-white'
            }`}>
              Tất cả ({requests.length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>

      {/* Request List */}
      <ScrollView
        className="flex-1 px-6 pt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredRequests.length === 0 ? (
          <View className="bg-white rounded-2xl p-8 items-center justify-center">
            <Text className="text-gray-900 font-bold text-lg mb-1">
              Không có đơn nào
            </Text>
            <Text className="text-gray-500 text-sm text-center">
              {filterStatus === 'pending'
                ? 'Chưa có đơn nào chờ duyệt'
                : `Không có đơn ${getStatusText(filterStatus).toLowerCase()}`}
            </Text>
          </View>
        ) : (
          filteredRequests.map((request) => (
            <TouchableOpacity
              key={request.id}
              onPress={() => handleViewDetail(request)}
              className="bg-white rounded-2xl p-4 mb-3"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 3,
              }}
            >
              {/* Urgent Badge */}
              {request.status === 'pending' && request.hoursRemaining < 12 && (
                <View className="absolute top-2 right-2 bg-red-500 rounded-full px-2 py-1 z-10">
                  <Text className="text-white text-xs font-bold">
                    Còn {request.hoursRemaining}h
                  </Text>
                </View>
              )}

              {/* Student Info */}
              <View className="flex-row items-center mb-3">
                <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center mr-3">
                  <Text className="text-purple-700 font-bold text-lg">
                    {request.studentName.charAt(0)}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-bold text-base">
                    {request.studentName}
                  </Text>
                  <Text className="text-gray-500 text-sm">MSV: {request.studentId}</Text>
                </View>
                <View className={`px-3 py-1 rounded-full border ${getStatusColor(request.status)}`}>
                  <View className="flex-row items-center">
                    <Ionicons name={getStatusIcon(request.status)} size={14} />
                    <Text className="text-xs font-semibold ml-1">
                      {getStatusText(request.status)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Schedule Info */}
              <View className="bg-gray-50 rounded-xl p-3 mb-2">
                <View className="flex-row items-center mb-1">
                  <View className="bg-purple-100 rounded-lg px-2 py-1 mr-2">
                    <Text className="text-purple-700 text-xs font-bold">
                      {request.schedule.courseCode}
                    </Text>
                  </View>
                  <Text className="text-gray-900 font-semibold flex-1" numberOfLines={1}>
                    {request.schedule.courseName}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="calendar-outline" size={12} color="#6b7280" />
                  <Text className="text-gray-600 text-xs ml-1">
                    {request.schedule.dayOfWeek}, {request.schedule.date}
                  </Text>
                  <Ionicons name="time-outline" size={12} color="#6b7280" className="ml-2" />
                  <Text className="text-gray-600 text-xs ml-1">
                    {request.schedule.startTime} - {request.schedule.endTime}
                  </Text>
                </View>
              </View>

              {/* Reason */}
              <View className="flex-row items-center mb-2">
                <Ionicons name={getReasonIcon(request.reasonType)} size={16} color="#7c3aed" />
                <Text className="text-purple-700 font-semibold text-sm ml-2">
                  {request.reasonLabel}
                </Text>
              </View>

              {/* Note Preview */}
              <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
                {request.note}
              </Text>

              {/* Attachments */}
              <View className="flex-row items-center mb-2">
                <Ionicons name="attach" size={14} color="#6b7280" />
                <Text className="text-gray-600 text-xs ml-1">
                  {request.attachments.length} tệp đính kèm
                </Text>
              </View>

              {/* Footer */}
              <View className="flex-row items-center justify-between pt-2 border-t border-gray-100">
                <Text className="text-gray-500 text-xs">
                  Nộp: {new Date(request.createdAt).toLocaleDateString('vi-VN')}
                </Text>
                {request.status === 'pending' && (
                  <Text className={`text-xs font-semibold ${
                    request.hoursRemaining < 12 ? 'text-red-600' : 'text-orange-600'
                  }`}>
                    Còn {request.hoursRemaining}h để duyệt
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}

        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
};

export default TeacherLeaveRequestListScreen;
