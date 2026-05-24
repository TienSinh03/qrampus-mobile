import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch, useSelector } from 'react-redux';
import { verifyFaceThunk } from '../../features/faceVerify/faceVerifyThunks';
import {
  resetFaceVerify,
  selectFaceVerifyStatus,
  selectFaceVerifyResult,
  selectFaceVerifyError,
} from '../../features/faceVerify/faceVerifySlice';

/**
 * ArcFaceModal
 * - avatarUrl: URL ảnh gốc của SV (truyền từ parent, không cần gọi API)
 * - attendanceId: UUID điểm danh (tuỳ chọn)
 */
const ArcFaceModal = ({ visible, onClose, userRole = 'student', avatarUrl, attendanceId, courseName, courseCode, room }) => {
  const dispatch = useDispatch();
  const status = useSelector(selectFaceVerifyStatus);
  const result = useSelector(selectFaceVerifyResult);
  const error = useSelector(selectFaceVerifyError);

  const [screen, setScreen] = useState('capture'); // 'capture' | 'preview' | 'loading' | 'result' | 'error'
  const [selfieUri, setSelfieUri] = useState(null);

  const roleColor = userRole === 'teacher' ? '#0171a5' : '#2563eb';
  const gradient = [roleColor, '#1e40af'];

  // Sync Redux status → screen
  useEffect(() => {
    if (status === 'loading') setScreen('loading');
    else if (status === 'success') setScreen('result');
    else if (status === 'error') setScreen('error');
  }, [status]);

  // Reset khi đóng modal
  useEffect(() => {
    if (!visible) {
      const t = setTimeout(() => {
        setScreen('capture');
        setSelfieUri(null);
        dispatch(resetFaceVerify());
      }, 300);
      return () => clearTimeout(t);
    }
  }, [visible]);

  const pickFromLibrary = async () => {
    const { status: perm } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm !== 'granted') {
      Alert.alert('Quyền truy cập', 'Cần quyền truy cập thư viện ảnh để tiếp tục.');
      return;
    }
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!picked.canceled && picked.assets?.length) {
      setSelfieUri(picked.assets[0].uri);
      setScreen('preview');
    }
  };

  const takePhoto = async () => {
    const { status: perm } = await ImagePicker.requestCameraPermissionsAsync();
    if (perm !== 'granted') {
      Alert.alert('Quyền truy cập', 'Cần quyền truy cập camera để tiếp tục.');
      return;
    }
    const taken = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
      cameraType: ImagePicker.CameraType?.front ?? 'front',
    });
    if (!taken.canceled && taken.assets?.length) {
      setSelfieUri(taken.assets[0].uri);
      setScreen('preview');
    }
  };

  const handleVerify = () => {
    if (!selfieUri) return;
    dispatch(verifyFaceThunk({ imageUri: selfieUri, attendanceId: attendanceId || null }));
  };

  const handleRetry = () => {
    setSelfieUri(null);
    setScreen('capture');
    dispatch(resetFaceVerify());
  };

  const renderConfidenceBadge = (confidence) => {
    const map = {
      HIGH:   { bg: '#f0fdf4', text: '#16a34a', label: 'CAO' },
      MEDIUM: { bg: '#fffbeb', text: '#d97706', label: 'TRUNG BÌNH' },
      LOW:    { bg: '#fff7ed', text: '#ea580c', label: 'THẤP' },
    };
    const s = map[confidence] || { bg: '#f3f4f6', text: '#6b7280', label: confidence ?? '—' };
    return (
      <View style={[styles.badge, { backgroundColor: s.bg }]}>
        <Text style={[styles.badgeText, { color: s.text }]}>{s.label}</Text>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        {/* Header */}
        <LinearGradient colors={gradient} style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <Ionicons name="chevron-down" size={26} color="white" />
          </TouchableOpacity>
          <View style={styles.headerMid}>
            <View style={styles.headerLabel}>
              <Ionicons name="scan" size={16} color="rgba(255,255,255,0.85)" />
              <Text style={styles.headerSub}>Xác thực khuôn mặt</Text>
            </View>
            <Text style={styles.headerTitle}>Nhận diện ArcFace</Text>
          </View>
          <View style={{ width: 40 }} />
        </LinearGradient>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── CAPTURE ── */}
          {screen === 'capture' && (
            <View>

              {(courseName || courseCode) && (
                <View style={styles.courseBox}>
                  <Ionicons name="book-outline" size={16} color="#0171a5" />
                  
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    {courseName && <Text style={styles.courseName}>{courseName}</Text>}
                    
                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 2 }}>
                      {courseCode && <Text style={styles.courseMeta}>Mã lớp: {courseCode}</Text>}
                      {room && <Text style={styles.courseMeta}>Phòng: {room}</Text>}
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={18} color={roleColor} />
                <Text style={[styles.infoText, { color: roleColor }]}>
                  Chụp hoặc tải ảnh khuôn mặt của bạn để xác thực danh tính sau điểm danh
                </Text>
              </View>

              {/* Avatar gốc */}
              <Text style={styles.sectionLabel}>Ảnh đại diện đã đăng ký</Text>
              <View style={styles.avatarWrap}>
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
                ) : (
                  <View style={[styles.avatarImg, styles.avatarPlaceholder]}>
                    <Ionicons name="person" size={48} color="#9ca3af" />
                    <Text style={styles.placeholderText}>Chưa có ảnh đại diện</Text>
                  </View>
                )}
              </View>

              <Text style={styles.sectionLabel}>Chọn ảnh để xác thực</Text>

              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: roleColor }]}
                onPress={takePhoto}
                activeOpacity={0.8}
              >
                <Ionicons name="camera" size={22} color="white" />
                <Text style={styles.actionBtnText}>Chụp ảnh ngay</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnOutline, { borderColor: roleColor }]}
                onPress={pickFromLibrary}
                activeOpacity={0.8}
              >
                <Ionicons name="images" size={22} color={roleColor} />
                <Text style={[styles.actionBtnText, { color: roleColor }]}>Chọn từ thư viện</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── PREVIEW ── */}
          {screen === 'preview' && (
            <View>
              <Text style={styles.sectionLabel}>So sánh khuôn mặt</Text>
              <View style={styles.compareRow}>
                <View style={styles.compareItem}>
                  <Text style={styles.compareLabel}>Ảnh gốc</Text>
                  {avatarUrl ? (
                    <Image source={{ uri: avatarUrl }} style={styles.compareImg} />
                  ) : (
                    <View style={[styles.compareImg, styles.avatarPlaceholder]}>
                      <Ionicons name="person" size={36} color="#9ca3af" />
                    </View>
                  )}
                </View>
                <View style={styles.compareArrow}>
                  <Ionicons name="swap-horizontal" size={28} color="#6b7280" />
                </View>
                <View style={styles.compareItem}>
                  <Text style={styles.compareLabel}>Ảnh của bạn</Text>
                  <Image source={{ uri: selfieUri }} style={styles.compareImg} />
                </View>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.btn, styles.btnOutline, { borderColor: '#6b7280' }]}
                  onPress={handleRetry}
                  activeOpacity={0.7}
                >
                  <Ionicons name="camera-reverse" size={18} color="#6b7280" />
                  <Text style={[styles.btnText, { color: '#6b7280' }]}>Chụp lại</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, styles.btnPrimary, { backgroundColor: roleColor }]}
                  onPress={handleVerify}
                  activeOpacity={0.8}
                >
                  <Ionicons name="scan" size={18} color="white" />
                  <Text style={[styles.btnText, { color: 'white' }]}>Xác thực ngay</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ── LOADING ── */}
          {screen === 'loading' && (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color={roleColor} />
              <Text style={styles.loadingText}>Đang phân tích khuôn mặt...</Text>
              <Text style={styles.loadingSubText}>ArcFace đang xử lý, vui lòng chờ</Text>
            </View>
          )}

          {/* ── RESULT ── */}
          {screen === 'result' && result && (
            <View>
              <View style={styles.resultIconWrap}>
                <View
                  style={[
                    styles.resultIconCircle,
                    { backgroundColor: result.match ? '#f0fdf4' : '#fff7ed' },
                  ]}
                >
                  <Ionicons
                    name={result.match ? 'checkmark-circle' : 'close-circle'}
                    size={72}
                    color={result.match ? '#16a34a' : '#ea580c'}
                  />
                </View>
                <Text style={[styles.verdictText, { color: result.match ? '#15803d' : '#c2410c' }]}>
                  {result.ket_qua ?? (result.match ? 'Nhận dạng thành công' : 'Không nhận dạng được')}
                </Text>
                {result.confidence && renderConfidenceBadge(result.confidence)}
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Kết quả</Text>
                <MetaRow label="Sinh viên" value={result.full_name} />
                <MetaRow label="Mã SV" value={result.student_code} />

                {courseName && <MetaRow label="Môn học" value={courseName} />}
                {courseCode && <MetaRow label="Mã lớp" value={courseCode} />}
                {room && <MetaRow label="Phòng" value={room} />}
                
                <MetaRow
                  label="Cosine similarity"
                  value={result.cosine_similarity != null ? result.cosine_similarity.toFixed(6) : null}
                  highlight={result.match}
                />
                <MetaRow
                  label="Euclidean distance"
                  value={result.euclidean_distance != null ? result.euclidean_distance.toFixed(6) : null}
                />
                <MetaRow label="Trạng thái" value={result.status} />
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.btn, styles.btnOutline, { borderColor: roleColor }]}
                  onPress={handleRetry}
                  activeOpacity={0.7}
                >
                  <Ionicons name="refresh" size={18} color={roleColor} />
                  <Text style={[styles.btnText, { color: roleColor }]}>Thử lại</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, styles.btnPrimary, { backgroundColor: roleColor }]}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Ionicons name="checkmark" size={18} color="white" />
                  <Text style={[styles.btnText, { color: 'white' }]}>Hoàn tất</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ── ERROR ── */}
          {screen === 'error' && (
            <View style={styles.centerContent}>
              <View style={styles.errorCircle}>
                <Ionicons name="warning" size={64} color="#dc2626" />
              </View>
              <Text style={styles.errorTitle}>Xác thực thất bại</Text>
              <Text style={styles.errorMessage}>{error}</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.btn, styles.btnPrimary, { backgroundColor: roleColor }]}
                  onPress={handleRetry}
                  activeOpacity={0.7}
                >
                  <Ionicons name="refresh" size={18} color="white" />
                  <Text style={[styles.btnText, { color: 'white' }]}>Thử lại</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.btn, styles.btnOutline, { borderColor: '#dc2626' }]}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={18} color="#dc2626" />
                  <Text style={[styles.btnText, { color: '#dc2626' }]}>Đóng</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const MetaRow = ({ label, value, highlight = false }) => (
  <View style={styles.metaRow}>
    <Text style={styles.metaLabel}>{label}</Text>
    <Text style={[styles.metaValue, highlight && styles.metaValueHighlight]}>
      {value ?? '—'}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f9fafb' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerMid: { flex: 1, marginHorizontal: 12 },
  headerLabel: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '500' },
  headerTitle: { fontSize: 16, color: 'white', fontWeight: 'bold', marginTop: 4 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  courseBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0f9ff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#0171a5',
  },
  courseName: { fontSize: 14, fontWeight: '700', color: '#0c4a6e' },
  courseMeta: { fontSize: 12, color: '#0369a1', fontWeight: '500' },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#eff6ff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18, fontWeight: '500' },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 10 },
  avatarWrap: { alignItems: 'center', marginBottom: 24 },
  avatarImg: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: '#e5e7eb',
  },
  avatarPlaceholder: {
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: { fontSize: 12, color: '#9ca3af', marginTop: 8 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionBtnOutline: {
    backgroundColor: 'white',
    borderWidth: 2,
  },
  actionBtnText: { fontSize: 15, fontWeight: 'bold', color: 'white' },
  compareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  compareItem: { alignItems: 'center', flex: 1 },
  compareLabel: { fontSize: 12, color: '#6b7280', marginBottom: 8, fontWeight: '500' },
  compareImg: {
    width: 130,
    height: 130,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#f3f4f6',
  },
  compareArrow: { alignItems: 'center', justifyContent: 'center' },
  centerContent: { alignItems: 'center', paddingVertical: 40 },
  loadingText: { fontSize: 16, fontWeight: '600', color: '#111827', marginTop: 20 },
  loadingSubText: { fontSize: 13, color: '#6b7280', marginTop: 8, textAlign: 'center' },
  resultIconWrap: { alignItems: 'center', marginBottom: 24 },
  resultIconCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  verdictText: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  badge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginBottom: 8 },
  badgeText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  card: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 12 },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  metaLabel: { fontSize: 13, color: '#6b7280', flex: 1 },
  metaValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    flexShrink: 0,
    maxWidth: '55%',
    textAlign: 'right',
  },
  metaValueHighlight: { color: '#16a34a', fontSize: 14 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 10,
    gap: 8,
  },
  btnPrimary: {},
  btnOutline: { backgroundColor: 'white', borderWidth: 2 },
  btnText: { fontSize: 15, fontWeight: '600' },
  errorCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorTitle: { fontSize: 20, fontWeight: 'bold', color: '#dc2626', marginBottom: 8 },
  errorMessage: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 28,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
});

export default ArcFaceModal;
