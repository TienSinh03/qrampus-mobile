import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Modal,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { getLeaveRequestsOfStudentThunk, cancelLeaveRequestThunk } from '../../features/leave-request/leaveRequestThunk';
import { resetCancelState } from '../../features/leave-request/leaveRequestSlice';
import { reasonTypes } from '../../utils/reason.type';
import { DAYMAPPING } from '../../utils/day.mapping';
import LeaveRequestDetailModal from '../../components/modal/LeaveRequestDetailModal';

// Helper function to format date for display
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('vi-VN');
  } catch (e) {
    return dateString;
  }
};

// Helper function to get reason label from type
const getReasonLabel = (reasonType) => {
  const reason = reasonTypes.find(r => r.value === reasonType);
  return reason ? reason.label : reasonType || 'Không rõ';
};

const LeaveRequestListScreen = ({ navigation, route }) => {  
  const dispatch = useDispatch();
  const { 
    studentLeaves, 
    studentLeavesLoading, 
    studentLeavesError,
    cancelLoading,
    cancelSuccess,
    cancelError
  } = useSelector((state) => state.leaveRequests);
  
  const { schedule } = route?.params || {};

  const [courses, setCourses] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, approved, rejected
  const [filterCourse, setFilterCourse] = useState(schedule?.courseCode || 'all'); // all or course_code
  const [refreshing, setRefreshing] = useState(false);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [showDetailRequestModal, setShowDetailRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, [filterStatus]);

  // Handle cancel success/error
  useEffect(() => {
    if (cancelSuccess) {
      Alert.alert(
        'Thành công',
        'Đã xóa yêu cầu nghỉ phép thành công.',
        [{
          text: 'OK',
          onPress: () => {
            setShowDetailRequestModal(false);
            setSelectedRequest(null);
            dispatch(resetCancelState());
          }
        }]
      );
    }
  }, [cancelSuccess]);

  useEffect(() => {
    if (cancelError) {
      Alert.alert('Lỗi', cancelError);
      dispatch(resetCancelState());
    }
  }, [cancelError]);

  // Extract unique courses from studentLeaves
  useEffect(() => {
    if (studentLeaves.length > 0) {
      const uniqueCourses = [];
      const courseCodes = new Set();
      studentLeaves.forEach(req => {
        const courseCode = req.classSession?.courseSection?.code;
        if (courseCode && !courseCodes.has(courseCode)) {
          courseCodes.add(courseCode);
          uniqueCourses.push({
            courseCode: courseCode,
            name: req.classSession?.courseSection?.name || courseCode,
            requestCount: studentLeaves.filter(r => r.classSession?.courseSection?.code === courseCode).length,
          });
        }
      });
      setCourses(uniqueCourses);
    }
  }, [studentLeaves]);

  const fetchRequests = async () => {
    const params = {};
    if (filterStatus !== 'all') {
      params.status = filterStatus;
    }
    dispatch(getLeaveRequestsOfStudentThunk(params));
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
    const reason = reasonTypes.find(r => r.value === reasonType);
    return reason ? reason.icon : 'ellipsis-horizontal';
  };

  // Handle cancel request
  const handleCancelRequest = (leaveRequestId) => {
    dispatch(cancelLeaveRequestThunk(leaveRequestId));
  };

  const filteredRequests = studentLeaves.filter((req) => {
    // Filter by status
    const matchStatus = filterStatus === 'all' || req.status === filterStatus;
    // Filter by course
    const reqCourseCode = req.classSession?.courseSection?.code;
    const matchCourse = filterCourse === 'all' || reqCourseCode === filterCourse;
    return matchStatus && matchCourse;
  });

  const currentCourse = courses.find(c => c.courseCode === filterCourse);
  const pendingCount = studentLeaves.filter(r => 
    (filterCourse === 'all' || r.classSession?.courseSection?.code === filterCourse) && r.status === 'pending'
  ).length;
  const approvedCount = studentLeaves.filter(r => 
    (filterCourse === 'all' || r.classSession?.courseSection?.code === filterCourse) && r.status === 'approved'
  ).length;
  const rejectedCount = studentLeaves.filter(r => 
    (filterCourse === 'all' || r.classSession?.courseSection?.code === filterCourse) && r.status === 'rejected'
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
          <TouchableOpacity onPress={() => navigation.navigate('LeaveRequest')}>
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
              Tất cả ({studentLeaves.length})
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
              onPress={() => {
                setSelectedRequest(request);
                setShowDetailRequestModal(true);
              }} 
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
                  <Ionicons name={getReasonIcon(request.reason_type)} size={20} color="#2563eb" />
                  <Text className="text-gray-900 font-bold text-base ml-2" numberOfLines={1}>
                    {getReasonLabel(request.reason_type)}
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
                  {request.classSession?.courseSection?.name || 'Unknown Course'}
                </Text>
                <View className="flex-row items-center">
                  <Ionicons name="calendar-outline" size={12} color="#6b7280" />
                  <Text className="text-gray-600 text-xs ml-1">
                    {request.classSession?.class_date ? DAYMAPPING[new Date(request.classSession.class_date).getDay()] : 'N/A'}, {formatDate(request.classSession?.class_date)}
                  </Text>
                  <Ionicons name="time-outline" size={12} color="#6b7280" className="ml-2" />
                  <Text className="text-gray-600 text-xs ml-1">
                    {request.classSession?.start_hour || 'N/A'} - {request.classSession?.end_hour || 'N/A'}
                  </Text>
                </View>
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
                  Nộp: {formatDate(request.created_at)}
                </Text>
                {request.reviewed_at && (
                  <Text className="text-gray-500 text-xs">
                    Duyệt: {formatDate(request.reviewed_at)}
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
                    {studentLeaves.length} yêu cầu
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

      {/* Detail Request Modal */}
      <LeaveRequestDetailModal
        visible={showDetailRequestModal}
        onClose={() => setShowDetailRequestModal(false)}
        selectedRequest={selectedRequest}
        getStatusColor={getStatusColor}
        getStatusIcon={getStatusIcon}
        getStatusText={getStatusText}
        getReasonIcon={getReasonIcon}
        onCancelRequest={handleCancelRequest}
        cancelLoading={cancelLoading}
      />
    
    </SafeAreaView>
  );
};

export default LeaveRequestListScreen;
