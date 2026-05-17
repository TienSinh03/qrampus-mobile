import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

export const BIOMETRIC_ENABLED_KEY = 'biometricEnabled';
export const BIOMETRIC_ROLE_KEY = 'biometricRole';
const BIOMETRIC_REFRESH_TOKEN_KEY = 'biometricRefreshToken';

export const checkBiometricAvailable = async () => {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && isEnrolled;
};

export const authenticateBiometric = async (message = 'Xác thực vân tay để tiếp tục') => {
  return await LocalAuthentication.authenticateAsync({
    promptMessage: message,
    cancelLabel: 'Hủy',
    fallbackLabel: 'Dùng mật khẩu máy',
    disableDeviceFallback: false,
  });
};

// Lưu refreshToken với bảo vệ sinh trắc học ở tầng OS — cần truyền refreshToken vào
export const enableBiometricLogin = async ({ role, refreshToken }) => {
  await SecureStore.setItemAsync(BIOMETRIC_REFRESH_TOKEN_KEY, refreshToken, {
    requireAuthentication: true,
    authenticationPrompt: 'Xác thực sinh trắc học',
  });
  await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
  await SecureStore.setItemAsync(BIOMETRIC_ROLE_KEY, role);
};

export const disableBiometricLogin = async () => {
  await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
  await SecureStore.deleteItemAsync(BIOMETRIC_ROLE_KEY);
  try {
    await SecureStore.deleteItemAsync(BIOMETRIC_REFRESH_TOKEN_KEY);
  } catch (_) {}
};

// OS tự hiện prompt sinh trắc học khi đọc — không cần gọi authenticateBiometric() thêm
export const getBiometricRefreshToken = async () => {
  return await SecureStore.getItemAsync(BIOMETRIC_REFRESH_TOKEN_KEY, {
    requireAuthentication: true,
    authenticationPrompt: 'Xác thực vân tay để đăng nhập',
  });
};

// Đồng bộ biometricRefreshToken sau mỗi lần refresh thành công — không cần biometric để ghi
export const updateBiometricRefreshToken = async (newRefreshToken) => {
  const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
  if (enabled !== 'true') return;
  await SecureStore.setItemAsync(BIOMETRIC_REFRESH_TOKEN_KEY, newRefreshToken, {
    requireAuthentication: true,
    authenticationPrompt: 'Xác thực sinh trắc học',
  });
};

export const getBiometricConfig = async () => {
  const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
  const role = await SecureStore.getItemAsync(BIOMETRIC_ROLE_KEY);
  return {
    enabled: enabled === 'true',
    role,
  };
};
