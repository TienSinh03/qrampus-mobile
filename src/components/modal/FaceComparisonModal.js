import React, { useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { compareWithAvatar } from '../../api/faceRecognitionService';

/**
 * FaceComparisonModal - Compare captured photo with user's avatar
 * Shows: similarity score, verdict (same/different), annotations
 */
const FaceComparisonModal = ({
  visible,
  onClose,
  avatarUrl,
  capturedPhotoUri,
  userName = 'Người dùng',
  userRole = 'student',
}) => {
  const [screen, setScreen] = useState('loading'); // 'loading' | 'result' | 'error'
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    if (visible && capturedPhotoUri && avatarUrl) {
      handleComparison();
    }
  }, [visible, capturedPhotoUri, avatarUrl]);

  React.useEffect(() => {
    if (!visible) {
      setTimeout(() => {
        setScreen('loading');
        setResult(null);
        setError(null);
      }, 300);
    }
  }, [visible]);

  const handleComparison = async () => {
    try {
      setScreen('loading');
      setError(null);

      // Call face recognition API
      const comparisonResult = await compareWithAvatar(
        avatarUrl,
        capturedPhotoUri,
        0.5 // threshold
      );

      setResult(comparisonResult);
      setScreen('result');
    } catch (err) {
      setError(err.message || 'Lỗi so sánh khuôn mặt');
      setScreen('error');
      console.error('Comparison error:', err);
    }
  };

  const roleColor = userRole === 'teacher' ? '#0171a5' : '#2563eb';
  const gradient = [roleColor, '#1e40af'];

  const handleRetry = () => {
    handleComparison();
  };

  const handleClose = () => {
    onClose?.({ result });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        {/* Header */}
        <LinearGradient colors={gradient} style={styles.header}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-down" size={26} color="white" />
          </TouchableOpacity>

          <View style={styles.headerMid}>
            <View style={styles.headerLabel}>
              <Ionicons name="scan" size={16} color="rgba(255,255,255,0.85)" />
              <Text style={styles.headerSub}>So sánh khuôn mặt</Text>
            </View>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {userName}
            </Text>
          </View>

          <View style={{ width: 40 }} />
        </LinearGradient>

        {/* Content */}
        <View style={styles.container}>
          {screen === 'loading' && (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color={roleColor} />
              <Text style={styles.loadingText}>Đang phân tích khuôn mặt...</Text>
              <Text style={styles.loadingSubText}>Vui lòng chờ trong giây lát</Text>
            </View>
          )}

          {screen === 'result' && result && (
            <View style={styles.resultContent}>
              {/* Result Icon */}
              <View
                style={[
                  styles.resultIcon,
                  {
                    backgroundColor: result.is_same_person ? '#f0fdf4' : '#fff7ed',
                  },
                ]}
              >
                <Ionicons
                  name={
                    result.is_same_person
                      ? 'checkmark-circle'
                      : 'alert-circle'
                  }
                  size={64}
                  color={result.is_same_person ? '#16a34a' : '#ea580c'}
                />
              </View>

              {/* Verdict */}
              <Text
                style={[
                  styles.resultTitle,
                  {
                    color: result.is_same_person ? '#15803d' : '#c2410c',
                  },
                ]}
              >
                {result.verdict}
              </Text>

              {/* Similarity Score */}
              <View style={styles.scoreCard}>
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreLabel}>Độ tương đồng:</Text>
                  <Text
                    style={[
                      styles.scoreValue,
                      {
                        color: result.is_same_person ? '#16a34a' : '#ea580c',
                      },
                    ]}
                  >
                    {(result.cosine_similarity * 100).toFixed(1)}%
                  </Text>
                </View>
                <View style={styles.scoreRow}>
                  <Text style={styles.scoreLabel}>Ngưỡng:</Text>
                  <Text style={styles.scoreValue}>
                    {(result.threshold * 100).toFixed(1)}%
                  </Text>
                </View>
              </View>

              {/* Status Badge */}
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: result.is_same_person
                      ? 'rgba(22, 163, 74, 0.1)'
                      : 'rgba(234, 88, 12, 0.1)',
                  },
                ]}
              >
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: result.is_same_person
                        ? '#16a34a'
                        : '#ea580c',
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.statusText,
                    {
                      color: result.is_same_person ? '#16a34a' : '#ea580c',
                    },
                  ]}
                >
                  {result.is_same_person
                    ? 'Xác thực thành công'
                    : 'Khuôn mặt không khớp'}
                </Text>
              </View>

              {/* Buttons */}
              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.secondaryButton,
                    { borderColor: roleColor },
                  ]}
                  onPress={handleRetry}
                  activeOpacity={0.7}
                >
                  <Ionicons name="refresh" size={18} color={roleColor} />
                  <Text style={[styles.buttonText, { color: roleColor }]}>
                    Thử lại
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.primaryButton,
                    { backgroundColor: roleColor },
                  ]}
                  onPress={handleClose}
                  activeOpacity={0.7}
                >
                  <Ionicons name="checkmark" size={18} color="white" />
                  <Text style={[styles.buttonText, { color: 'white' }]}>
                    Hoàn tất
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {screen === 'error' && (
            <View style={styles.centerContent}>
              <View style={styles.errorIcon}>
                <Ionicons name="warning" size={64} color="#dc2626" />
              </View>
              <Text style={styles.errorTitle}>Lỗi so sánh khuôn mặt</Text>
              <Text style={styles.errorMessage}>{error}</Text>

              <View style={styles.buttonGroup}>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.primaryButton,
                    { backgroundColor: roleColor },
                  ]}
                  onPress={handleRetry}
                >
                  <Ionicons name="refresh" size={18} color="white" />
                  <Text style={[styles.buttonText, { color: 'white' }]}>
                    Thử lại
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.secondaryButton,
                    { borderColor: '#dc2626' },
                  ]}
                  onPress={onClose}
                >
                  <Ionicons name="close" size={18} color="#dc2626" />
                  <Text style={[styles.buttonText, { color: '#dc2626' }]}>
                    Đóng
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
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
  headerMid: {
    flex: 1,
    marginHorizontal: 12,
  },
  headerLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 4,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 20,
    textAlign: 'center',
  },
  loadingSubText: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  resultContent: {
    alignItems: 'center',
  },
  resultIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  scoreCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 24,
    gap: 10,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 2,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  errorIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fef2f2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default FaceComparisonModal;
