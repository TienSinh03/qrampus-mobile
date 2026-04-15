import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { getTeacherLeaveRequestsThunk } from '../../features/leave-request/leaveRequestThunk';
import { reasonTypes } from '../../utils/reason.type';
import { DAYMAPPING } from '../../utils/day.mapping';

// Helper function to compute hours remaining until class starts
const computeHoursRemaining = (classDate, startHour) => {
  if (!classDate || !startHour) return null;
  try {
    const [hours, minutes] = startHour.split(':').map(Number);
    const classDateTime = new Date(classDate);
    classDateTime.setHours(hours, minutes, 0, 0);
    const now = new Date();
    const diffMs = classDateTime - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    return diffHours > 0 ? diffHours : 0;
  } catch (e) {
    return null;
  }
};

// Helper function to format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('vi-VN');
  } catch (e) {
    return dateString;
  }
};

const TeacherLeaveRequestListScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { teacherLeaves, teacherLeavesLoading, teacherLeavesError } = useSelector((state) => state.leaveRequests);
  
  const { schedule } = route?.params || {};
  const [courses, setCourses] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all'); // pending, approved, rejected, all
  const [filterCourse, setFilterCourse] = useState(schedule?.courseCode || 'all');
  const [refreshing, setRefreshing] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);

  // Compute hours remaining for each leave request
  const leavesWithHours = useMemo(() => {
    return teacherLeaves.map(leave => ({
      ...leave,
      hoursRemaining: computeHoursRemaining(
        leave.classSession?.class_date,
        leave.classSession?.start_hour
      )
    }));
  }, [teacherLeaves]);
  
  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  const fetchRequests = async () => {
    const params = {};
    if (filterStatus !== 'all') {
      params.status = filterStatus;
      
    }
    if (schedule?.id) {
      params.schedule_id = schedule.id;
    }
    dispatch(getTeacherLeaveRequestsThunk(params));
  };

  // Extract unique courses from teacherLeaves
  useEffect(() => {
    if (teacherLeaves.length > 0) {
      const uniqueCourses = [];
      const courseCodes = new Set();
      teacherLeaves.forEach(req => {
        const courseCode = req.classSession?.courseSection?.code || req.code;
        if (courseCode && !courseCodes.has(courseCode)) {
          courseCodes.add(courseCode);
          uniqueCourses.push({
            courseCode: courseCode,
            name: req.classSession?.courseSection?.name || req.schedule?.courseName || courseCode,
            pendingCount: teacherLeaves.filter(r => 
              (r.classSession?.courseSection?.code ) === courseCode && r.status === 'pending'
            ).length,
          });
        }
      });
      setCourses(uniqueCourses);
    }
  }, [teacherLeaves]);

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

  const getReasonType = (reasonType) => {
    const reason = reasonTypes.find(r => r.value === reasonType);
    return reason ? reason.label : reasonType || 'Không rõ lý do';
  };

  const getReasonIcon = (reasonType) => {
    const reason = reasonTypes.find(r => r.value === reasonType);
    return reason ? reason.icon : 'help-circle';
  };

  const handleViewDetail = (request) => {
    // Add hoursRemaining to request before navigation
    const requestWithHours = {
      ...request,
      hoursRemaining: computeHoursRemaining(
        request.classSession?.class_date,
        request.classSession?.start_hour
      )
    };
    navigation.navigate('TeacherLeaveRequestDetail', { request: requestWithHours });
  };

  const filteredRequests = leavesWithHours.filter((req) => {
    const reqCourseCode = req.classSession?.courseSection?.code || req.courseCode;
    const matchStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchCourse = filterCourse === 'all' || reqCourseCode === filterCourse;
    return matchStatus && matchCourse;
  });

  const pendingCount = leavesWithHours.filter(r => {
    const reqCourseCode = r.classSession?.courseSection?.code || r.courseCode;
    return (filterCourse === 'all' || reqCourseCode === filterCourse) && r.status === 'pending';
  }).length;
  const approvedCount = leavesWithHours.filter(r => {
    const reqCourseCode = r.classSession?.courseSection?.code || r.courseCode;
    return (filterCourse === 'all' || reqCourseCode === filterCourse) && r.status === 'approved';
  }).length;
  const rejectedCount = leavesWithHours.filter(r => {
    const reqCourseCode = r.classSession?.courseSection?.code || r.courseCode;
    return (filterCourse === 'all' || reqCourseCode === filterCourse) && r.status === 'rejected';
  }).length;

  // Count urgent requests (< 12h remaining)
  const urgentCount = leavesWithHours.filter(r => 
    r.status === 'pending' && r.hoursRemaining != null && r.hoursRemaining < 12
  ).length;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      {/* Header */}
      <LinearGradient
        colors={['#0171a5', '#30b2ea']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-6 py-4"
      >
        <View className="flex-row items-center justify-between mb-3">
          <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-white text-xl font-bold">Duyệt đơn nghỉ phép</Text>
            {schedule && (
              <Text className="text-white/80 text-sm" numberOfLines={1}>
                {schedule.courseCode} - {schedule.courseName}
              </Text>
            )}
          </View>
          <TouchableOpacity 
            onPress={() => setShowCourseModal(true)}
            className="mr-3 bg-white/20 rounded-full p-2"
          >
            <Ionicons name="funnel" size={20} color="white" />
          </TouchableOpacity>
          {urgentCount > 0 && (
            <View className="bg-red-500 rounded-full px-3 py-1">
              <Text className="text-white text-xs font-bold">
                {urgentCount} khẩn
              </Text>
            </View>
          )}
        </View>

        {/* Course Filter Badge */}
        {schedule && filterCourse !== 'all' && (
          <View className="bg-white/20 rounded-xl px-4 py-2 mb-3">
            <View className="flex-row items-center">
              <Ionicons name="book" size={16} color="white" />
              <Text className="text-white font-semibold ml-2 flex-1" numberOfLines={1}>
                Đang lọc: {schedule.courseName}
              </Text>
              <TouchableOpacity 
                onPress={() => setFilterCourse('all')}
                className="ml-2 bg-white/30 rounded-full p-1"
              >
                <Ionicons name="close" size={14} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Course Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
          <TouchableOpacity
            onPress={() => setFilterCourse('all')}
            className={`px-4 py-2 rounded-lg mr-2 ${
              filterCourse === 'all' ? 'bg-white' : 'bg-white/20'
            }`}
          >
            <Text className={`font-semibold ${
              filterCourse === 'all' ? 'text-sky-600' : 'text-white'
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
                filterCourse === course.courseCode ? 'text-sky-600' : 'text-white'
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
              filterStatus === 'pending' ? 'text-sky-600' : 'text-white'
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
              filterStatus === 'approved' ? 'text-sky-600' : 'text-white'
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
              filterStatus === 'rejected' ? 'text-sky-600' : 'text-white'
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
              filterStatus === 'all' ? 'text-sky-600' : 'text-white'
            }`}>
              Tất cả ({leavesWithHours.length})
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
          filteredRequests.map((request, index) => (
            <TouchableOpacity
              key={index}
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
              {request.status === 'pending' && request.hoursRemaining != null && request.hoursRemaining < 12 && (
                <View className="absolute top-0.5 right-2 bg-red-500 rounded-full px-2 py-1 z-10">
                  <Text className="text-white text-xs font-bold">
                    Còn {request.hoursRemaining}h
                  </Text>
                </View>
              )}

              {/* Student Info */}
              <View className="flex-row items-center mb-3">
                <View className="w-12 h-12 bg-sky-100 rounded-full items-center justify-center mr-3">
                  <Text className="text-sky-700 font-bold text-lg">
                    {(request.student?.full_name || 'S').charAt(0)}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-900 font-bold text-base">
                    {request.student?.full_name || 'Unknown'}
                  </Text>
                  <Text className="text-gray-500 text-sm">MSSV: {request.student?.student_code || 'N/A'}</Text>
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
                  <View className="bg-sky-100 rounded-lg px-2 py-1 mr-2">
                    <Text className="text-sky-700 text-xs font-bold">
                      {request.classSession?.courseSection?.code || 'N/A'}
                    </Text>
                  </View>
                  <Text className="text-gray-900 font-semibold flex-1" numberOfLines={1}>
                    {request.classSession?.courseSection?.name || 'Unknown Course'}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <Ionicons name="calendar-outline" size={12} color="#6b7280" />
                  <Text className="text-gray-600 text-xs ml-1 mr-1.5">
                    {request.classSession?.class_date ? DAYMAPPING[new Date(request.classSession.class_date).getDay()] : 'N/A'}, {formatDate(request.classSession?.class_date)}
                  </Text>
                  <Ionicons name="time-outline" size={12} color="#6b7280" className="ml-2" />
                  <Text className="text-gray-600 text-xs ml-1">
                    {request.classSession?.start_hour || 'N/A'} - {request.classSession?.end_hour || 'N/A'}
                  </Text>
                </View>
              </View>

              {/* Reason */}
              <View className="flex-row items-center mb-2">
                <Ionicons name={getReasonIcon(request.reason_type)} size={16} color="#0171a5" />
                <Text className="text-sky-700 font-semibold text-sm ml-2">
                  {getReasonType(request.reason_type) || 'Không rõ lý do'}
                </Text>
              </View>

              {/* Note Preview */}
              <Text className="text-gray-600 text-sm mb-2" numberOfLines={2}>
                {request.note || 'Không có ghi chú'}
              </Text>

              {/* Attachments */}
              <View className="flex-row items-center mb-2">
                <Ionicons name="attach" size={14} color="#6b7280" />
                <Text className="text-gray-600 text-xs ml-1">
                  {request.attachments?.length || 0} tệp đính kèm
                </Text>
              </View>

              {/* Footer */}
              <View className="flex-row items-center justify-between pt-2 border-t border-gray-100">
                <Text className="text-gray-500 text-xs">
                  Nộp: {request.created_at ? new Date(request.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                </Text>
                {request.status === 'pending' && request.hoursRemaining != null && (
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

        {/* Course Filter Modal */}
      </ScrollView>
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
                    filterCourse === 'all' ? 'bg-sky-50 border-2 border-sky-500' : 'bg-gray-50'
                  }`}
                >
                  <View className="flex-1">
                    <Text className={`font-bold text-base mb-1 ${
                      filterCourse === 'all' ? 'text-sky-700' : 'text-gray-900'
                    }`}>
                      Tất cả môn học
                    </Text>
                    <Text className="text-gray-600 text-sm">
                      {leavesWithHours.length} yêu cầu
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
                      filterCourse === course.courseCode ? 'bg-sky-50 border-2 border-sky-500' : 'bg-gray-50'
                    }`}
                  >
                    <View className="flex-1">
                      <View className="flex-row items-center mb-1">
                        <View className="bg-sky-100 rounded-lg px-2 py-1 mr-2">
                          <Text className="text-sky-700 text-xs font-bold">{course.courseCode}</Text>
                        </View>
                      </View>
                      <Text className={`font-bold text-base mb-1 ${
                        filterCourse === course.courseCode ? 'text-sky-700' : 'text-gray-900'
                      }`} numberOfLines={1}>
                        {course.name}
                      </Text>
                      <Text className="text-gray-600 text-sm">
                        {leavesWithHours.filter(request => (request.classSession?.courseSection?.code) === course.courseCode).length} yêu cầu
                      </Text>
                    </View>
                    {filterCourse === course.courseCode && (
                      <Ionicons name="checkmark-circle" size={24} color="#0171a5" />
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

export default TeacherLeaveRequestListScreen;
