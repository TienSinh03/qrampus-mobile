import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch } from 'react-redux';
import { verifyFaceThunk } from '../../features/faceVerify/faceVerifyThunks';
import { resetFaceVerify } from '../../features/faceVerify/faceVerifySlice';

// ─── Screen states inside the modal ─────────────────────────────────────────
// 'camera'    → live camera + capture button
// 'verifying' → loading while calling backend
// 'result'    → show match / no-match result

// ─── Inner modal ─────────────────────────────────────────────────────────────

const CameraModal = ({ visible, onClose, onCapture, schedule, userRole }) => {
  const dispatch = useDispatch();
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [screen, setScreen] = useState('camera'); // 'camera' | 'verifying' | 'result'
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyError, setVerifyError] = useState(null);

  useEffect(() => {
    if (visible && !permission?.granted) requestPermission();
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      setCountdown(null);
      setIsCapturing(false);
      setIsCameraReady(false);
      setScreen('camera');
      setVerifyResult(null);
      setVerifyError(null);
      dispatch(resetFaceVerify());
    }
  }, [visible]);

  const startCountdown = () => {
    if (isCapturing || !isCameraReady) return;
    setIsCapturing(true);
    let count = 3;
    setCountdown(count);
    const iv = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(iv);
        setCountdown('Go!');
        setTimeout(shoot, 600);
      }
    }, 900);
  };

  const shoot = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85,
        base64: false,
        skipProcessing: false,
      });
      setIsCapturing(false);
      setCountdown(null);
      await sendForVerification(photo);
    } catch {
      setIsCapturing(false);
      setCountdown(null);
      Alert.alert('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại.');
    }
  };

  const sendForVerification = async (photo) => {
    setScreen('verifying');
    try {
      const result = await dispatch(
        verifyFaceThunk({
          imageUri:     photo.uri,
          attendanceId: schedule?.attendanceId ?? null,
        })
      ).unwrap();
      setVerifyResult(result);
      setScreen('result');
      onCapture?.({ photo, result });
    } catch (err) {
      setVerifyError(typeof err === 'string' ? err : 'Không thể xác thực. Vui lòng thử lại.');
      setScreen('result');
    }
  };

  const isPractice = schedule?.isPractice && !schedule?.isTheory;
  const accent = isPractice ? '#059669' : '#2563eb';
  const gradient = isPractice ? ['#059669', '#10b981'] : ['#1d4ed8', '#2563eb'];

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <SafeAreaView style={s.root} edges={['top', 'bottom']}>

        {/* ── Header ── */}
        <LinearGradient colors={gradient} style={s.header}>
          <TouchableOpacity style={s.closeBtn} onPress={onClose}>
            <Ionicons name="chevron-down" size={26} color="white" />
          </TouchableOpacity>
          <View style={s.headerMid}>
            <View style={s.headerLabel}>
              <Ionicons name="shield-checkmark" size={16} color="rgba(255,255,255,0.85)" />
              <Text style={s.headerSub}>Xác thực điểm danh</Text>
            </View>
            <Text style={s.headerCourse} numberOfLines={1}>
              {schedule?.courseName || 'Môn học'}
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </LinearGradient>

        {/* ── Info pills ── */}
        <View style={s.pills}>
          {!!schedule?.courseCode && (
            <Pill icon="barcode-outline" text={schedule.courseCode} color={accent} tinted />
          )}
          {!!schedule?.startHour && (
            <Pill icon="time-outline" text={`${schedule.startHour} – ${schedule.endHour}`} />
          )}
          {!!schedule?.room && (
            <Pill icon="location-outline" text={schedule.room} />
          )}
          {!!schedule?.teacherName && (
            <Pill icon="person-outline" text={schedule.teacherName} />
          )}
        </View>

        {/* ── Screen: Camera ── */}
        {screen === 'camera' && (
          <>
            <View style={s.cam}>
              {!permission ? (
                <Center><ActivityIndicator size="large" color="white" /></Center>
              ) : !permission.granted ? (
                <Center>
                  <Ionicons name="camera-off-outline" size={52} color="rgba(255,255,255,0.45)" />
                  <Text style={s.permTxt}>Cần quyền truy cập camera</Text>
                  <TouchableOpacity
                    style={[s.permBtn, { backgroundColor: accent }]}
                    onPress={requestPermission}
                  >
                    <Text style={s.permBtnTxt}>Cấp quyền</Text>
                  </TouchableOpacity>
                </Center>
              ) : (
                <CameraView
                  ref={cameraRef}
                  style={StyleSheet.absoluteFill}
                  facing="front"
                  onCameraReady={() => setIsCameraReady(true)}
                />
              )}

              {permission?.granted && (
                <View pointerEvents="none" style={s.overlay}>
                  <View style={s.faceRing} />
                </View>
              )}

              {countdown !== null && (
                <View pointerEvents="none" style={s.countdownOverlay}>
                  <Text style={s.countdownTxt}>{countdown}</Text>
                </View>
              )}
            </View>

            <View style={s.bottom}>
              <Text style={s.hint}>
                {userRole === 'teacher'
                  ? 'Nhìn thẳng vào camera để xác thực'
                  : 'Nhìn thẳng vào camera khi thấy 3, 2, 1, Go!\nHệ thống sẽ tự động chụp ảnh bạn'}
              </Text>
              <TouchableOpacity
                style={[s.shutter, (!isCameraReady || isCapturing) && s.shutterOff]}
                onPress={startCountdown}
                disabled={!isCameraReady || isCapturing}
                activeOpacity={0.8}
              >
                {isCapturing && countdown === null
                  ? <ActivityIndicator size="large" color={accent} />
                  : (
                    <View style={[s.shutterInner, { borderColor: accent }]}>
                      <Ionicons name="camera" size={30} color={accent} />
                    </View>
                  )}
              </TouchableOpacity>
              <Text style={s.subHint}>Nhấn để bắt đầu đếm ngược</Text>
            </View>
          </>
        )}

        {/* ── Screen: Verifying ── */}
        {screen === 'verifying' && (
          <View style={s.resultScreen}>
            <ActivityIndicator size="large" color={accent} style={{ marginBottom: 20 }} />
            <Text style={s.verifyingTitle}>Đang xác thực khuôn mặt...</Text>
            <Text style={s.verifyingSub}>Vui lòng chờ trong giây lát</Text>
          </View>
        )}

        {/* ── Screen: Result ── */}
        {screen === 'result' && (
          <View style={s.resultScreen}>
            {verifyError ? (
              <>
                <View style={[s.resultIcon, { backgroundColor: '#fef2f2' }]}>
                  <Ionicons name="close-circle" size={64} color="#ef4444" />
                </View>
                <Text style={[s.resultTitle, { color: '#dc2626' }]}>Xác thực thất bại</Text>
                <Text style={s.resultSub}>{verifyError}</Text>
                <TouchableOpacity
                  style={[s.resultBtn, { backgroundColor: accent }]}
                  onPress={() => {
                    setScreen('camera');
                    setVerifyError(null);
                    setVerifyResult(null);
                  }}
                >
                  <Ionicons name="refresh" size={18} color="white" />
                  <Text style={s.resultBtnTxt}>Thử lại</Text>
                </TouchableOpacity>
              </>
            ) : verifyResult?.match ? (
              <>
                <View style={[s.resultIcon, { backgroundColor: '#f0fdf4' }]}>
                  <Ionicons name="checkmark-circle" size={64} color="#16a34a" />
                </View>
                <Text style={[s.resultTitle, { color: '#15803d' }]}>Xác thực thành công!</Text>
                <Text style={s.resultName}>{verifyResult.full_name}</Text>
                <Text style={s.resultCode}>{verifyResult.student_code}</Text>
                <View style={s.distanceBadge}>
                  <Text style={s.distanceTxt}>
                    Độ tương đồng: {((1 - verifyResult.distance) * 100).toFixed(1)}%
                  </Text>
                </View>
                <TouchableOpacity
                  style={[s.resultBtn, { backgroundColor: '#16a34a' }]}
                  onPress={onClose}
                >
                  <Ionicons name="checkmark" size={18} color="white" />
                  <Text style={s.resultBtnTxt}>Hoàn tất</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={[s.resultIcon, { backgroundColor: '#fff7ed' }]}>
                  <Ionicons name="warning" size={64} color="#ea580c" />
                </View>
                <Text style={[s.resultTitle, { color: '#c2410c' }]}>Khuôn mặt không khớp</Text>
                <Text style={s.resultSub}>
                  Không nhận diện được khuôn mặt. Hãy đảm bảo ánh sáng tốt và nhìn thẳng vào camera.
                </Text>
                {verifyResult?.distance !== undefined && (
                  <View style={[s.distanceBadge, { backgroundColor: '#fff7ed' }]}>
                    <Text style={[s.distanceTxt, { color: '#ea580c' }]}>
                      Độ tương đồng: {((1 - verifyResult.distance) * 100).toFixed(1)}%
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  style={[s.resultBtn, { backgroundColor: accent }]}
                  onPress={() => {
                    setScreen('camera');
                    setVerifyResult(null);
                  }}
                >
                  <Ionicons name="refresh" size={18} color="white" />
                  <Text style={s.resultBtnTxt}>Chụp lại</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

      </SafeAreaView>
    </Modal>
  );
};

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

const Pill = ({ icon, text, color = '#374151', tinted = false }) => (
  <View style={[sp.pill, tinted && { backgroundColor: `${color}15` }]}>
    <Ionicons name={icon} size={13} color={color} />
    <Text style={[sp.pillTxt, { color }]} numberOfLines={1}>{text}</Text>
  </View>
);

const Center = ({ children }) => <View style={s.center}>{children}</View>;

// ─── Default export: self-contained trigger + modal ───────────────────────────

const FaceCameraModal = ({ schedule = null, userRole = 'student', onCapture }) => {
  const [open, setOpen] = useState(false);
  const isPractice = schedule?.isPractice && !schedule?.isTheory;
  const roleColor = userRole === 'teacher' ? '#0171a5' : (isPractice ? '#059669' : '#2563eb');

  const handleCapture = ({ photo, result }) => {
    onCapture?.({ photo, result });
  };

  return (
    <View>
      <TouchableOpacity style={st.card} activeOpacity={0.8} onPress={() => setOpen(true)}>
        <Image
          source={require('../../../assets/images/Face_id.png')}
          style={st.faceImg}
          resizeMode="contain"
        />
        <Text style={st.cardTitle}>Xác thực khuôn mặt</Text>
        <Text style={st.cardSub}>
          {userRole === 'teacher'
            ? 'Nhấn để xác thực khuôn mặt (tuỳ chọn)'
            : 'Nhấn để mở camera xác thực điểm danh'}
        </Text>
        <View style={[st.btn, { backgroundColor: roleColor }]}>
          <Ionicons name="camera-outline" size={16} color="white" />
          <Text style={st.btnTxt}>Mở camera</Text>
        </View>
      </TouchableOpacity>

      <CameraModal
        visible={open}
        onClose={() => setOpen(false)}
        onCapture={handleCapture}
        schedule={schedule}
        userRole={userRole}
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerMid: { flex: 1, alignItems: 'center' },
  headerLabel: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
  headerSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '500' },
  headerCourse: { color: 'white', fontSize: 17, fontWeight: '700', textAlign: 'center' },
  pills: {
    flexDirection: 'row', flexWrap: 'wrap',
    backgroundColor: 'white',
    paddingHorizontal: 12, paddingVertical: 10, gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e5e7eb',
  },
  cam: { flex: 1, backgroundColor: '#111', overflow: 'hidden' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  faceRing: {
    width: 210, height: 270, borderRadius: 105,
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.55)', borderStyle: 'dashed',
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center', justifyContent: 'center',
  },
  countdownTxt: {
    fontSize: 96, fontWeight: '800', color: 'white',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 4 }, textShadowRadius: 12,
  },
  bottom: {
    backgroundColor: 'white',
    paddingTop: 20, paddingBottom: 24, paddingHorizontal: 24,
    alignItems: 'center', gap: 12,
  },
  hint: { fontSize: 13, color: '#6b7280', textAlign: 'center', lineHeight: 20 },
  shutter: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: 'white', alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 6,
    borderWidth: 3, borderColor: '#e5e7eb',
  },
  shutterOff: { opacity: 0.4 },
  shutterInner: {
    width: 68, height: 68, borderRadius: 34,
    backgroundColor: '#f9fafb', borderWidth: 2.5,
    alignItems: 'center', justifyContent: 'center',
  },
  subHint: { fontSize: 11, color: '#9ca3af' },
  permTxt: { color: 'rgba(255,255,255,0.7)', fontSize: 14, textAlign: 'center', marginTop: 8 },
  permBtn: { borderRadius: 12, paddingHorizontal: 24, paddingVertical: 10, marginTop: 4 },
  permBtnTxt: { color: 'white', fontWeight: '700', fontSize: 14 },

  // ── Result / Verifying screens ──
  resultScreen: {
    flex: 1, backgroundColor: 'white',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 32, gap: 12,
  },
  verifyingTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  verifyingSub: { fontSize: 14, color: '#6b7280' },
  resultIcon: {
    width: 110, height: 110, borderRadius: 55,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 4,
  },
  resultTitle: { fontSize: 22, fontWeight: '800', textAlign: 'center' },
  resultSub: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 22 },
  resultName: { fontSize: 18, fontWeight: '700', color: '#111827' },
  resultCode: { fontSize: 14, color: '#6b7280', fontWeight: '500' },
  distanceBadge: {
    backgroundColor: '#f0fdf4', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 6, marginTop: 4,
  },
  distanceTxt: { fontSize: 13, fontWeight: '600', color: '#16a34a' },
  resultBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 12, paddingHorizontal: 28, paddingVertical: 12,
    borderRadius: 999,
  },
  resultBtnTxt: { color: 'white', fontWeight: '700', fontSize: 15 },
});

const sp = StyleSheet.create({
  pill: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f3f4f6', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 4, gap: 4,
  },
  pillTxt: { fontSize: 12, fontWeight: '600', color: '#374151' },
});

const st = StyleSheet.create({
  card: {
    backgroundColor: 'white', borderRadius: 20,
    padding: 32, alignItems: 'center', justifyContent: 'center',
  },
  faceImg: { width: 64, height: 64 },
  cardTitle: { color: '#111827', fontWeight: '700', fontSize: 16, marginTop: 12, marginBottom: 4 },
  cardSub: { color: '#6b7280', fontSize: 13, textAlign: 'center' },
  btn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 16, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 999,
  },
  btnTxt: { color: 'white', fontWeight: '700', fontSize: 14 },
});

export default FaceCameraModal;
