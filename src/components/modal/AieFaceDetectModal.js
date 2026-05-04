import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const AIE_KEY = '159c2d483212f618b7f3910190691675';

// HTML được inject vào WebView - tải 1aie.com Face Detection SDK
// postMessage về RN với các action: detect | exit | error
const buildHtml = () => `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:100vw;height:100vh;background:#000;overflow:hidden}
  </style>
</head>
<body>
<script>
  var _lastSend = 0;
  function rn(d){ window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(d)); }
  window.onerror = function(m){ rn({action:'error',msg:String(m)}); };

  function initAIE(){
    if(typeof aie_aic === 'undefined'){
      rn({action:'error', msg:'SDK 1aie.com chưa tải được. Kiểm tra kết nối mạng.'});
      return;
    }
    aie_aic("body", {
      type: "fd",
      option: {
        confidence: 0.5,
        age_gender: true,
        draw_box: true,
        scan_speed: 0
      },
      brand: "QRampus",
      width: "100%",
      video: "front",
      ratio: 0,
      file: false,
      mode: true,
      mini: true,
      border: true,
      control: true,
      snap: true,
      torch: true,
      zoom: { start: 1, step: 0.5 },
      exit: function(){ rn({action:'exit'}); },
      lang: { show: false, set: "vi" },
      opacity: 1
    }, function(res){
      var now = Date.now();
      if(res && res.length > 0 && now - _lastSend > 400){
        _lastSend = now;
        rn({action:'detect', data:res});
      }
    });
  }
<\/script>
<script
  src="https://api.1aie.com/?key=${AIE_KEY}&active=aic"
  onload="initAIE()"
  onerror="rn({action:'error',msg:'Không thể tải script từ api.1aie.com'})"
><\/script>
</body>
</html>`;

// ─── Inner modal ──────────────────────────────────────────────────────────────

const AieModal = ({ visible, onClose, avatarUrl }) => {
  const [loading, setLoading] = useState(true);
  const [sdkError, setSdkError] = useState(null);
  const [detection, setDetection] = useState(null);
  const htmlRef = useRef(buildHtml());

  const reset = () => {
    setSdkError(null);
    setDetection(null);
    setLoading(true);
    htmlRef.current = buildHtml(); // force WebView re-render key
  };

  const handleMessage = useCallback((event) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.action === 'detect') {
        setDetection(msg.data);
      } else if (msg.action === 'exit') {
        onClose?.();
      } else if (msg.action === 'error') {
        setSdkError(msg.msg || 'Lỗi không xác định');
        setLoading(false);
      }
    } catch {}
  }, [onClose]);

  const handleWebViewClose = () => {
    setLoading(true);
    setDetection(null);
    setSdkError(null);
    onClose?.();
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleWebViewClose}
    >
      <SafeAreaView style={s.root} edges={['top', 'bottom']}>

        {/* ── Header ── */}
        <View style={s.header}>
          <TouchableOpacity style={s.closeBtn} onPress={handleWebViewClose}>
            <Ionicons name="chevron-down" size={26} color="white" />
          </TouchableOpacity>

          <View style={s.headerMid}>
            <View style={s.headerLabelRow}>
              <Ionicons name="scan-outline" size={14} color="rgba(255,255,255,0.85)" />
              <Text style={s.headerSub}>AI Face Detection · 1AIE.com</Text>
            </View>
            <Text style={s.headerTitle}>Check Khuôn Mặt API</Text>
          </View>

          {/* Avatar người dùng để đối chiếu */}
          <View style={s.avatarWrap}>
            {avatarUrl
              ? <Image source={{ uri: avatarUrl }} style={s.avatarImg} />
              : (
                <View style={[s.avatarImg, s.avatarPlaceholder]}>
                  <Ionicons name="person" size={18} color="rgba(255,255,255,0.7)" />
                </View>
              )
            }
          </View>
        </View>

        {/* ── WebView ── */}
        <View style={{ flex: 1 }}>
          {!sdkError && (
            <WebView
              key={htmlRef.current.length} // re-mount on retry
              source={{ html: htmlRef.current }}
              style={s.webview}
              javaScriptEnabled
              domStorageEnabled
              mediaPlaybackRequiresUserAction={false}
              allowsInlineMediaPlayback
              originWhitelist={['*']}
              mixedContentMode="always"
              androidLayerType="hardware"
              setSupportMultipleWindows={false}
              allowsFullscreenVideo={false}
              onLoad={() => setLoading(false)}
              onMessage={handleMessage}
              onError={(e) => {
                setSdkError(e.nativeEvent.description || 'WebView lỗi');
                setLoading(false);
              }}
            />
          )}

          {/* Loading overlay */}
          {loading && !sdkError && (
            <View style={s.loadingOverlay} pointerEvents="none">
              <ActivityIndicator size="large" color="white" />
              <Text style={s.loadingTxt}>Đang tải SDK nhận diện khuôn mặt...</Text>
              <Text style={s.loadingNote}>Cần kết nối Internet để tải 1aie.com SDK</Text>
            </View>
          )}

          {/* SDK error state */}
          {sdkError && (
            <View style={s.errorWrap}>
              <Ionicons name="warning-outline" size={52} color="#fbbf24" />
              <Text style={s.errorTitle}>Không thể khởi động SDK</Text>
              <Text style={s.errorMsg}>{sdkError}</Text>
              <TouchableOpacity style={s.retryBtn} onPress={reset}>
                <Ionicons name="refresh" size={16} color="white" />
                <Text style={s.retryTxt}>Thử lại</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── Detection result bar ── */}
        {detection && !loading && (
          <View style={s.resultBar} pointerEvents="none">
            <Ionicons name="checkmark-circle" size={16} color="#4ade80" />
            <Text style={s.resultTxt} numberOfLines={1}>
              {detection.length} khuôn mặt phát hiện
              {detection[0]?.age != null ? ` · ~${Math.round(detection[0].age)} tuổi` : ''}
              {detection[0]?.gender ? ` · ${detection[0].gender === 'male' ? 'Nam' : 'Nữ'}` : ''}
              {detection[0]?.confidence != null
                ? ` · ${(detection[0].confidence * 100).toFixed(0)}% tin cậy`
                : ''}
            </Text>
          </View>
        )}

        {/* ── Avatar reference panel (khi có avatar_url) ── */}
        {avatarUrl && !loading && (
          <View style={s.refBar} pointerEvents="none">
            <Image source={{ uri: avatarUrl }} style={s.refAvatar} />
            <View style={{ flex: 1 }}>
              <Text style={s.refLabel}>Ảnh đại diện tham chiếu</Text>
              <Text style={s.refNote}>
                {detection
                  ? 'Đang phát hiện khuôn mặt → đối chiếu thủ công với ảnh trái'
                  : 'Hướng mặt vào camera để nhận diện'}
              </Text>
            </View>
          </View>
        )}

      </SafeAreaView>
    </Modal>
  );
};

// ─── Trigger + modal wrapper (default export) ─────────────────────────────────

const AieFaceDetectModal = ({ avatarUrl = null, userRole = 'student' }) => {
  const [open, setOpen] = useState(false);
  const roleColor = '#7c3aed';

  return (
    <View>
      <TouchableOpacity style={st.card} activeOpacity={0.8} onPress={() => setOpen(true)}>
        <View style={[st.iconWrap, { backgroundColor: `${roleColor}18` }]}>
          <Ionicons name="scan-outline" size={30} color={roleColor} />
        </View>

        <Text style={st.cardTitle}>AI Face Detection</Text>
        <Text style={st.cardSub}>
          Nhận diện khuôn mặt thời gian thực{'\n'}Powered by 1AIE.com API
        </Text>

        {avatarUrl && (
          <View style={st.avatarRow}>
            <Image source={{ uri: avatarUrl }} style={[st.avatarPreview, { borderColor: roleColor }]} />
            <Text style={[st.avatarHint, { color: roleColor }]}>Ảnh tham chiếu của bạn</Text>
          </View>
        )}

        <View style={[st.btn, { backgroundColor: roleColor }]}>
          <Ionicons name="scan" size={16} color="white" />
          <Text style={st.btnTxt}>Mở Camera AI</Text>
        </View>
      </TouchableOpacity>

      <AieModal
        visible={open}
        onClose={() => setOpen(false)}
        avatarUrl={avatarUrl}
      />
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#7c3aed',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerMid: { flex: 1, alignItems: 'center' },
  headerLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
  headerSub: { color: 'rgba(255,255,255,0.85)', fontSize: 11, fontWeight: '500' },
  headerTitle: { color: 'white', fontSize: 17, fontWeight: '700' },

  avatarWrap: {
    width: 40, height: 40, borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarImg: { width: 40, height: 40, borderRadius: 20 },
  avatarPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },

  webview: { flex: 1, backgroundColor: '#000' },

  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  loadingTxt: { color: 'rgba(255,255,255,0.85)', fontSize: 15, fontWeight: '600' },
  loadingNote: { color: 'rgba(255,255,255,0.45)', fontSize: 12, textAlign: 'center', paddingHorizontal: 32 },

  errorWrap: {
    flex: 1, backgroundColor: '#111',
    alignItems: 'center', justifyContent: 'center',
    padding: 32, gap: 12,
  },
  errorTitle: { color: 'white', fontSize: 18, fontWeight: '700' },
  errorMsg: { color: 'rgba(255,255,255,0.55)', fontSize: 13, textAlign: 'center', lineHeight: 20 },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#7c3aed', borderRadius: 999,
    paddingHorizontal: 24, paddingVertical: 10, marginTop: 8,
  },
  retryTxt: { color: 'white', fontWeight: '700', fontSize: 14 },

  resultBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  resultTxt: { color: 'white', fontSize: 13, flex: 1, fontWeight: '500' },

  refBar: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(124,58,237,0.15)',
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(124,58,237,0.4)',
    paddingHorizontal: 16, paddingVertical: 10,
  },
  refAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#7c3aed' },
  refLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600' },
  refNote: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 },
});

const st = StyleSheet.create({
  card: {
    backgroundColor: 'white', borderRadius: 20,
    padding: 28, alignItems: 'center',
  },
  iconWrap: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  cardTitle: { color: '#111827', fontWeight: '700', fontSize: 16, marginTop: 8, marginBottom: 4 },
  cardSub: { color: '#6b7280', fontSize: 13, textAlign: 'center', lineHeight: 19 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 },
  avatarPreview: { width: 44, height: 44, borderRadius: 22, borderWidth: 2 },
  avatarHint: { fontSize: 12, fontWeight: '600' },
  btn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 16, paddingHorizontal: 22, paddingVertical: 9, borderRadius: 999,
  },
  btnTxt: { color: 'white', fontWeight: '700', fontSize: 14 },
});

export default AieFaceDetectModal;
