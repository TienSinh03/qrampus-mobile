import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const LeaveRequestListScreen = ({ navigation, route }) => {
  const [requests, setRequests] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, approved, rejected
  const [filterCourse, setFilterCourse] = useState(route?.params?.schedule.courseCode || 'all'); // all or course_id
  const [refreshing, setRefreshing] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    // Call API to get student's leave requests

    const mockRequests = [
      {
        id: 1,
        courseCode: 'IT4788',
        schedule: {
          courseName: 'Lập trình Di động',
          courseCode: 'IT4788',
          date: '2025-12-08',
          dayOfWeek: 'Thứ 2',
          startTime: '07:00',
          endTime: '09:00',
          room: 'D3-201',
          teacherName: 'TS. Nguyễn Văn A',
        },
        reasonType: 'sick',
        reasonLabel: 'Bệnh',
        note: 'Em bị sốt cao và đau đầu, đã đi khám bác sĩ và được nghỉ ngơi 2 ngày.',
        attachments: [
          { id: 1, uri: 'https://via.placeholder.com/150', name: 'giay_kham_benh.jpg' },
        ],
        status: 'approved', // pending, approved, rejected
        rejectedReason: null,
        createdAt: '2025-12-07 10:30:00',
        reviewedAt: '2025-12-07 14:00:00',
        reviewedBy: 'TS. Nguyễn Văn A',
      },
      {
        id: 2,
        courseCode: 'IT3090',
        schedule: {
          courseName: 'Cơ sở dữ liệu',
          courseCode: 'IT3090',
          date: '2025-12-09',
          dayOfWeek: 'Thứ 3',
          startTime: '13:00',
          endTime: '15:00',
          room: 'D5-302',
          teacherName: 'PGS. Trần Thị B',
        },
        reasonType: 'family',
        reasonLabel: 'Việc gia đình',
        note: 'Em phải về quê gấp vì gia đình có việc khẩn cấp.',
        attachments: [
          { id: 2, uri: 'https://via.placeholder.com/150', name: 'giay_xin_phep.jpg' },
        ],
        status: 'pending',
        rejectedReason: null,
        createdAt: '2025-12-08 08:00:00',
        reviewedAt: null,
        reviewedBy: null,
      },
      {
        id: 3,
        courseCode: 'IT4060',
        schedule: {
          courseName: 'Mạng máy tính',
          courseCode: 'IT4060',
          date: '2025-12-05',
          dayOfWeek: 'Thứ 5',
          startTime: '09:15',
          endTime: '11:15',
          room: 'TC-209',
          teacherName: 'TS. Lê Văn C',
        },
        reasonType: 'other',
        reasonLabel: 'Khác',
        note: 'Em bị muộn xe buýt nên không kịp đến lớp.',
        attachments: [
          { id: 3, uri: 'https://via.placeholder.com/150', name: 'screenshot.jpg' },
        ],
        status: 'rejected',
        rejectedReason: 'Lý do không hợp lệ. Vui lòng chuẩn bị tốt hơn để không bị muộn.',
        createdAt: '2025-12-05 10:00:00',
        reviewedAt: '2025-12-05 15:30:00',
        reviewedBy: 'TS. Lê Văn C',
      },
    ];

    // Tạo danh sách môn học duy nhất từ các yêu cầu
    const uniqueCourses = [];
    const courseCodes = new Set();
    mockRequests.forEach(req => {
      if (!courseCodes.has(req.courseCode)) {
        courseCodes.add(req.courseCode);
        uniqueCourses.push({
          courseCode: req.schedule.courseCode,
          name: req.schedule.courseName,
          requestCount: mockRequests.filter(r => r.courseCode === req.courseCode).length,
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
        return 'bg-orange-100 text-orange-700';
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ duyệt';
      case 'approved':
        return 'Đã duyệt';
      case 'rejected':
        return 'Từ chối';
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

  const filteredRequests = requests.filter((req) => {
    // Filter by status
    const matchStatus = filterStatus === 'all' || req.status === filterStatus;
    // Filter by course
    const matchCourse = filterCourse === 'all' || req.courseCode === filterCourse;
    return matchStatus && matchCourse;
  });

  const currentCourse = courses.find(c => c.courseCode === filterCourse);
  const pendingCount = requests.filter(r => 
    (filterCourse === 'all' || r.courseCode === filterCourse) && r.status === 'pending'
  ).length;
  const approvedCount = requests.filter(r => 
    (filterCourse === 'all' || r.courseCode === filterCourse) && r.status === 'approved'
  ).length;
  const rejectedCount = requests.filter(r => 
    (filterCourse === 'all' || r.courseCode === filterCourse) && r.status === 'rejected'
  ).length;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      {/* Header */}
      <LinearGradient
        colors={['#2563eb', '#3b82f6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 py-4"
      >
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold flex-1">Yêu cầu của tôi</Text>
          <TouchableOpacity 
            onPress={() => setShowCourseModal(true)}
            className="mr-3 bg-white/20 rounded-full p-2"
          >
            <Ionicons name="funnel" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {}}>
            <Ionicons name="add-circle" size={28} color="white" />
          </TouchableOpacity>
        </View>

        {/* Course Filter */}
        {filterCourse !== 'all' && currentCourse && (
          <View className="bg-white/20 rounded-xl px-4 py-2 mb-2">
            <View className="flex-row items-center">
              <Ionicons name="book" size={16} color="white" />
              <Text className="text-white font-semibold ml-2" numberOfLines={1}>
                {currentCourse.name}
              </Text>
              <TouchableOpacity 
                onPress={() => setFilterCourse('all')}
                className="ml-auto bg-white/30 rounded-full p-1"
              >
                <Ionicons name="close" size={14} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Filter Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          <TouchableOpacity
            onPress={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg mr-2 ${
              filterStatus === 'all' ? 'bg-white' : 'bg-white/20'
            }`}
          >
            <Text
              className={`font-semibold ${
                filterStatus === 'all' ? 'text-blue-600' : 'text-white'
              }`}
            >
              Tất cả ({requests.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilterStatus('pending')}
            className={`px-4 py-2 rounded-lg mr-2 ${
              filterStatus === 'pending' ? 'bg-white' : 'bg-white/20'
            }`}
          >
            <Text
              className={`font-semibold ${
                filterStatus === 'pending' ? 'text-blue-600' : 'text-white'
              }`}
            >
              Chờ duyệt ({pendingCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilterStatus('approved')}
            className={`px-4 py-2 rounded-lg mr-2 ${
              filterStatus === 'approved' ? 'bg-white' : 'bg-white/20'
            }`}
          >
            <Text
              className={`font-semibold ${
                filterStatus === 'approved' ? 'text-blue-600' : 'text-white'
              }`}
            >
              Đã duyệt ({approvedCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFilterStatus('rejected')}
            className={`px-4 py-2 rounded-lg ${
              filterStatus === 'rejected' ? 'bg-white' : 'bg-white/20'
            }`}
          >
            <Text
              className={`font-semibold ${
                filterStatus === 'rejected' ? 'text-blue-600' : 'text-white'
              }`}
            >
              Từ chối ({rejectedCount})
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
            <Text className="text-gray-900 font-bold text-lg mb-1">Chưa có yêu cầu nào</Text>
            <Text className="text-gray-500 text-sm text-center">
              {filterStatus === 'all'
                ? 'Bạn chưa nộp đơn xin nghỉ phép nào'
                : `Không có yêu cầu ${getStatusText(filterStatus).toLowerCase()}`}
            </Text>
          </View>
        ) : (
          filteredRequests.map((request) => (
            <TouchableOpacity
              key={request.id}
              onPress={() => {}} // Xử lý xem chi tiết yêu cầu
              className="bg-white rounded-2xl p-4 mb-3"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              {/* Header */}
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center flex-1">
                  <Ionicons name={getReasonIcon(request.reasonType)} size={20} color="#2563eb" />
                  <Text className="text-gray-900 font-bold text-base ml-2" numberOfLines={1}>
                    {request.reasonLabel}
                  </Text>
                </View>
                <View className={`px-3 py-1 rounded-full ${getStatusColor(request.status)}`}>
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
                <Text className="text-gray-900 font-semibold mb-1">
                  {request.schedule.courseName}
                </Text>
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
                {request.reviewedAt && (
                  <Text className="text-gray-500 text-xs">
                    Duyệt: {new Date(request.reviewedAt).toLocaleDateString('vi-VN')}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}

        <View className="h-6" />
      </ScrollView>

      {/* Course Filter Modal */}
      <Modal
        visible={showCourseModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowCourseModal(false)}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={() => setShowCourseModal(false)}
          className="flex-1 bg-black/50 justify-end"
        >
          <TouchableOpacity activeOpacity={1} className="bg-white rounded-t-3xl">
            <View className="px-6 py-4 border-b border-gray-200">
              <View className="flex-row items-center justify-between">
                <Text className="text-gray-900 text-lg font-bold">Lọc theo môn học</Text>
                <TouchableOpacity onPress={() => setShowCourseModal(false)}>
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView className="px-6 py-4" style={{ maxHeight: 400 }}>
              {/* All Courses Option */}
              <TouchableOpacity
                onPress={() => {
                  setFilterCourse('all');
                  setShowCourseModal(false);
                }}
                className={`rounded-xl p-4 mb-3 flex-row items-center justify-between ${
                  filterCourse === 'all' ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50'
                }`}
              >
                <View className="flex-1">
                  <Text className={`font-bold text-base mb-1 ${
                    filterCourse === 'all' ? 'text-blue-700' : 'text-gray-900'
                  }`}>
                    Tất cả môn học
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    {requests.length} yêu cầu
                  </Text>
                </View>
                {filterCourse === 'all' && (
                  <Ionicons name="checkmark-circle" size={24} color="#2563eb" />
                )}
              </TouchableOpacity>

              {/* Individual Courses */}
              {courses.map((course, index) => (
                <TouchableOpacity
                  key={course.courseCode || index}
                  onPress={() => {
                    setFilterCourse(course.courseCode);
                    setShowCourseModal(false);
                  }}
                  className={`rounded-xl p-4 mb-3 flex-row items-center justify-between ${
                    filterCourse === course.courseCode ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50'
                  }`}
                >
                  <View className="flex-1">
                    <View className="flex-row items-center mb-1">
                      <View className="bg-blue-100 rounded-lg px-2 py-1 mr-2">
                        <Text className="text-blue-700 text-xs font-bold">{course.courseCode}</Text>
                      </View>
                    </View>
                    <Text className={`font-bold text-base mb-1 ${
                      filterCourse === course.courseCode ? 'text-blue-700' : 'text-gray-900'
                    }`} numberOfLines={1}>
                      {course.name}
                    </Text>
                    <Text className="text-gray-600 text-sm">
                      {course.requestCount} yêu cầu
                    </Text>
                  </View>
                  {filterCourse === course.courseCode && (
                    <Ionicons name="checkmark-circle" size={24} color="#2563eb" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

    
    </SafeAreaView>
  );
};

export default LeaveRequestListScreen;
