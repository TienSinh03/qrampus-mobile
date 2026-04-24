import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SvgUri } from 'react-native-svg';
import { useDispatch, useSelector } from 'react-redux';
import RejectLeaveRequestModal from '../../components/modal/RejectLeaveRequestModal';
import ImageViewerModal from '../../components/modal/ImageViewerModal';
import { approveLeaveRequestThunk, rejectLeaveRequestThunk } from '../../features/leave-request/leaveRequestThunk';
import { resetActionState } from '../../features/leave-request/leaveRequestSlice';
import { reasonTypes } from '../../utils/reason.type';
import { DAYMAPPING } from '../../utils/day.mapping';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const decorSvgUri = Image.resolveAssetSource(
  require('../../../assets/Date picker-bro.svg')
).uri;

const computeHoursRemaining = (classDate, startHour) => {
  if (!classDate || !startHour) return null;
  try {
    const [hours, minutes] = startHour.split(':').map(Number);
    const classDateTime = new Date(classDate);
    classDateTime.setHours(hours, minutes, 0, 0);
    const diffHours = Math.floor((classDateTime - new Date()) / (1000 * 60 * 60));
    return diffHours > 0 ? diffHours : 0;
  } catch { return null; }
};

const formatDate = (d) => {
  if (!d) return 'N/A';
  try { return new Date(d).toLocaleDateString('vi-VN'); } catch { return d; }
};

const formatDateTime = (d) => {
  if (!d) return 'N/A';
  try { return new Date(d).toLocaleString('vi-VN'); } catch { return d; }
};

// ─── Section card wrapper ────────────────────────────────────────────────────
const Section = ({ icon, iconBg, iconColor, title, children }) => (
  <View className="bg-white rounded-2xl mb-3 overflow-hidden"
    style={{ borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#94a3b8', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 }}>
    <View className="flex-row items-center px-4 pt-4 pb-3"
      style={{ borderBottomWidth: 1, borderBottomColor: '#f8fafc' }}>
      <View className="w-8 h-8 rounded-xl items-center justify-center mr-2.5" style={{ backgroundColor: iconBg }}>
        <Ionicons name={icon} size={16} color={iconColor} />
      </View>
      <Text className="text-slate-800 font-bold text-base">{title}</Text>
    </View>
    <View className="px-4 py-3">{children}</View>
  </View>
);

// ─── Info row ────────────────────────────────────────────────────────────────
const InfoRow = ({ icon, label, value, last }) => (
  <View className={`flex-row items-center py-2.5 ${!last ? 'border-b border-slate-50' : ''}`}>
    <Ionicons name={icon} size={15} color="#94a3b8" style={{ marginRight: 10, width: 18 }} />
    <Text className="text-slate-500 text-sm w-28">{label}</Text>
    <Text className="text-slate-800 text-sm font-semibold flex-1 text-right" numberOfLines={2}>{value}</Text>
  </View>
);

const TeacherLeaveRequestDetailScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { actionLoading, actionError, actionSuccess } = useSelector((s) => s.leaveRequests);
  const { request } = route.params;

  const hoursRemaining = request.hoursRemaining ?? computeHoursRemaining(
    request.classSession?.class_date,
    request.classSession?.start_hour
  );

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (actionSuccess) {
      setShowRejectModal(false);
      dispatch(resetActionState());
      navigation.goBack();
    }
  }, [actionSuccess]);

  useEffect(() => {
    if (actionError) {
      Alert.alert('Lỗi', actionError);
      setShowRejectModal(false);
      dispatch(resetActionState());
    }
  }, [actionError]);

  const STATUS_CFG = {
    pending:  { text: 'Chờ duyệt',   icon: 'time-outline',             bg: '#fff7ed', color: '#ea580c' },
    approved: { text: 'Đã duyệt',    icon: 'checkmark-circle-outline', bg: '#f0fdf4', color: '#16a34a' },
    rejected: { text: 'Đã từ chối',  icon: 'close-circle-outline',     bg: '#fef2f2', color: '#dc2626' },
  };
  const sc = STATUS_CFG[request.status] || { text: request.status, icon: 'help-circle-outline', bg: '#f8fafc', color: '#64748b' };

  const getReasonLabel = (v) => reasonTypes.find(r => r.value === v)?.label || v || 'Không rõ';
  const getReasonIcon  = (v) => reasonTypes.find(r => r.value === v)?.icon  || 'help-circle-outline';

  const handleApprove = () => {
    const name = request.student?.full_name || 'sinh viên';
    Alert.alert('Xác nhận duyệt đơn',
      `Duyệt đơn xin nghỉ của ${name}?\n\nĐiểm danh sẽ đổi: Vắng → Vắng có phép.`,
      [{ text: 'Hủy', style: 'cancel' },
       { text: 'Duyệt', onPress: () => dispatch(approveLeaveRequestThunk({ id: request.id })) }]
    );
  };

  const handleReject = () => {
    if (rejectReason.trim().length < 10) {
      Alert.alert('Lỗi', 'Lý do từ chối tối thiểu 10 ký tự');
      return;
    }
    const name = request.student?.full_name || 'sinh viên';
    Alert.alert('Xác nhận từ chối', `Từ chối đơn của ${name}?`,
      [{ text: 'Hủy', style: 'cancel' },
       { text: 'Từ chối', style: 'destructive',
         onPress: () => dispatch(rejectLeaveRequestThunk({ id: request.id, rejectReason: rejectReason.trim() })) }]
    );
  };

  const handleViewImage = (att) => {
    const mime = att.mimetype || att.type || '';
    if (mime.startsWith('image/') || mime === 'image') {
      setSelectedImage(att); setShowImageModal(true);
    } else if (mime.includes('pdf')) {
      Alert.alert('PDF Viewer', 'Chức năng xem PDF đang được phát triển');
    }
  };

  const isUrgent = request.status === 'pending' && hoursRemaining != null && hoursRemaining < 12;
  const studentInitial = (request.student?.full_name || 'S').charAt(0).toUpperCase();

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar style="light" />

      {/* ── Header ── */}
      <LinearGradient
        colors={['#0171a5', '#30b2ea']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        className="px-6 pt-4 pb-5"
        style={{ overflow: 'hidden' }}
      >
        <View pointerEvents="none"
          style={{ position: 'absolute', right: 0, bottom: 0, width: 90, height: 90, opacity: 0.45 }}>
          <SvgUri uri={decorSvgUri} width="100%" height="100%" preserveAspectRatio="xMidYMid meet" />
        </View>

        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">Chi tiết đơn nghỉ phép</Text>
          <View style={{ width: 40 }} />
        </View>

      </LinearGradient>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
       {/* <View className="items-center mt-3">
          <View className="flex-row items-center bg-white/20 rounded-full px-4 py-1.5" style={{ gap: 6 }}>
            <Ionicons name={sc.icon} size={14} color="white" />
            <Text className="text-red text-sm font-semibold">{sc.text}</Text>
          </View>
      </View> */}

        {/* Urgent banner */}
        {isUrgent && (
          <View className="mt-4 mb-3 overflow-hidden">
            
            {/* nền gradient giả bằng lớp */}
            <View className="bg-red-500 px-4 py-3 flex-row items-center">
              
              {/* icon warning */}
              <View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center mr-3">
                <Ionicons name="warning" size={18} color="white" />
              </View>

              {/* text */}
              <View className="flex-1">
                <Text className="text-white font-bold text-sm">
                  KHẨN CẤP
                </Text>
                <Text className="text-red-50 text-xs mt-0.5">
                  Còn {hoursRemaining}h để duyệt yêu cầu
                </Text>
              </View>

              {/* badge thời gian */}
              <View className="bg-white/20 px-2 py-1 rounded-lg">
                <Text className="text-white font-bold text-xs">
                  {hoursRemaining}h
                </Text>
              </View>

            </View>
          </View>
        )}
        {/* ── Sinh viên ── */}
        <Section icon="person-outline" iconBg="#eff6ff" iconColor="#3b82f6" title="Thông tin sinh viên">
          <View className="flex-row items-center mb-3">
            <View className="w-14 h-14 rounded-2xl bg-sky-100 items-center justify-center mr-3">
              <Text className="text-sky-600 font-bold text-2xl">{studentInitial}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-slate-800 font-bold text-base">{request.student?.full_name || '--'}</Text>
              <Text className="text-slate-500 text-sm mt-0.5">Mã SV: {request.student?.student_code || 'N/A'}</Text>
            </View>
          </View>
          <View className="flex-row" style={{ gap: 8 }}>
            <TouchableOpacity
              className="flex-1 bg-sky-50 rounded-xl py-2.5 flex-row items-center justify-center"
              style={{ gap: 6 }}
              onPress={() => Alert.alert('Gọi điện', `Liên hệ ${request.student?.full_name || 'sinh viên'}`)}
            >
              <Ionicons name="call-outline" size={16} color="#0284c7" />
              <Text className="text-sky-700 font-semibold text-sm">Gọi</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-sky-50 rounded-xl py-2.5 flex-row items-center justify-center"
              style={{ gap: 6 }}
              onPress={() => Alert.alert('Email', `Email đến ${request.student?.full_name || 'sinh viên'}`)}
            >
              <Ionicons name="mail-outline" size={16} color="#0284c7" />
              <Text className="text-sky-700 font-semibold text-sm">Email</Text>
            </TouchableOpacity>
          </View>
        </Section>

        {/* ── Buổi học ── */}
        <Section icon="calendar-outline" iconBg="#f0f9ff" iconColor="#0284c7" title="Buổi học xin nghỉ">
          <View className="flex-row items-center mb-3">
            <View className="bg-sky-100 rounded-lg px-2.5 py-1 mr-2">
              <Text className="text-sky-700 text-xs font-bold">
                {request.classSession?.courseSection?.code || 'N/A'}
              </Text>
            </View>
            <Text className="text-slate-800 font-semibold flex-1 text-sm" numberOfLines={1}>
              {request.classSession?.courseSection?.name || 'Chưa có tên'}
            </Text>
          </View>
          <InfoRow icon="calendar-outline" label="Ngày học"
            value={`${request.classSession?.class_date
              ? DAYMAPPING[new Date(request.classSession.class_date).getDay()] + ', '
              : ''}${formatDate(request.classSession?.class_date)}`} />
          <InfoRow icon="time-outline" label="Giờ học"
            value={`${request.classSession?.start_hour || '--'} – ${request.classSession?.end_hour || '--'}`} />
          <InfoRow icon="location-outline" label="Phòng"
            value={request.classSession?.room?.room_code || 'N/A'} last />
        </Section>

        {/* ── Lý do ── */}
        <Section icon={getReasonIcon(request.reason_type)} iconBg="#fffbeb" iconColor="#d97706" title="Lý do nghỉ">
          <View className="bg-amber-50 rounded-xl px-3 py-2 mb-3 flex-row items-center" style={{ gap: 8 }}>
            <Ionicons name={getReasonIcon(request.reason_type)} size={16} color="#d97706" />
            <Text className="text-amber-800 font-semibold text-sm flex-1">
              {getReasonLabel(request.reason_type)}
            </Text>
          </View>
          {request.note ? (
            <Text className="text-slate-600 text-sm leading-6">{request.note}</Text>
          ) : (
            <Text className="text-slate-400 text-sm italic">Không có ghi chú</Text>
          )}
        </Section>

        {/* ── Minh chứng ── */}
        <Section icon="attach-outline" iconBg="#f0fdf4" iconColor="#16a34a"
          title={`Minh chứng đính kèm (${request.attachments?.length || 0})`}>
          {(request.attachments || []).length === 0 ? (
            <Text className="text-slate-400 text-sm italic">Không có minh chứng</Text>
          ) : (
            (request.attachments || []).map((att, idx) => {
              const mime = att.mimetype || att.type || '';
              const isImg = mime.startsWith('image/') || mime === 'image';
              return (
                <TouchableOpacity
                  key={att.id || idx}
                  onPress={() => handleViewImage(att)}
                  className="flex-row items-center bg-slate-50 rounded-xl p-3 mb-2"
                  style={{ gap: 12 }}
                >
                  <View className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 items-center justify-center">
                    {isImg ? (
                      <Image source={{ uri: att.url }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                      <Ionicons name="document-text-outline" size={28} color="#94a3b8" />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-slate-800 font-semibold text-sm mb-1" numberOfLines={1}>
                      {att.originalName || att.name || 'Tệp đính kèm'}
                    </Text>
                    <View className="flex-row items-center" style={{ gap: 4 }}>
                      <View className="bg-emerald-100 rounded px-2 py-0.5">
                        <Text className="text-emerald-700 text-[10px] font-bold">{isImg ? 'Ảnh' : 'PDF'}</Text>
                      </View>
                      <Text className="text-sky-600 text-xs font-medium ml-1">Nhấn để xem</Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward-outline" size={18} color="#cbd5e1" />
                </TouchableOpacity>
              );
            })
          )}
        </Section>

        {/* ── Thông tin nộp đơn ── */}
        <Section icon="information-circle-outline" iconBg="#f8fafc" iconColor="#64748b" title="Thông tin nộp đơn">
          <InfoRow icon="create-outline" label="Ngày nộp"
            value={formatDateTime(request.created_at || request.createdAt)} />
          {(request.reviewed_at || request.reviewedAt) && (
            <InfoRow icon="checkmark-done-outline" label="Ngày duyệt"
              value={formatDateTime(request.reviewed_at || request.reviewedAt)} />
          )}
          {request.status === 'pending' && hoursRemaining != null && (
            <InfoRow icon="hourglass-outline" label="Thời hạn duyệt"
              value={`Còn ${hoursRemaining}h`} last />
          )}
        </Section>

        <View className="h-6" />
      </ScrollView>

      {/* ── Action buttons ── */}
      {request.status === 'pending' && (
        <View className="bg-white px-4 py-4"
          style={{ borderTopWidth: 1, borderTopColor: '#f1f5f9', gap: 10 }}>
          <View className="flex-row" style={{ gap: 10 }}>
            <TouchableOpacity
              onPress={() => setShowRejectModal(true)}
              disabled={actionLoading}
              className="flex-1 rounded-xl py-3.5 flex-row items-center justify-center bg-red-50"
              style={{ borderWidth: 1.5, borderColor: '#fca5a5', gap: 6 }}
            >
              <Ionicons name="close-circle-outline" size={20} color="#dc2626" />
              <Text className="text-red-600 font-bold text-sm">Từ chối</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleApprove}
              disabled={actionLoading}
              className="flex-1 rounded-xl py-3.5 flex-row items-center justify-center"
              style={{ backgroundColor: '#0171a5', gap: 6, shadowColor: '#0171a5', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 }}
            >
              {actionLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="white" />
                  <Text className="text-white font-bold text-sm">Duyệt đơn</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      <RejectLeaveRequestModal
        visible={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        rejectReason={rejectReason}
        setRejectReason={setRejectReason}
        handleReject={handleReject}
        isProcessing={actionLoading}
      />

      <ImageViewerModal
        visible={showImageModal}
        onClose={() => setShowImageModal(false)}
        selectedImage={selectedImage}
        screenWidth={SCREEN_WIDTH}
      />
    </SafeAreaView>
  );
};

export default TeacherLeaveRequestDetailScreen;
