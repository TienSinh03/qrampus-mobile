import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

export const BIOMETRIC_ENABLED_KEY = 'biometricEnabled';
export const REFRESH_TOKEN_KEY = 'refreshToken';
export const BIOMETRIC_ROLE_KEY = 'biometricRole';

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

export const enableBiometricLogin = async ({ role }) => {
  await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');
  await SecureStore.setItemAsync(BIOMETRIC_ROLE_KEY, role);

};

export const disableBiometricLogin = async () => {
  await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
  await SecureStore.deleteItemAsync(BIOMETRIC_ROLE_KEY);
};

export const getBiometricConfig = async () => {
  const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
  const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  const role = await SecureStore.getItemAsync(BIOMETRIC_ROLE_KEY);

  return {
    enabled: enabled === 'true',
    refreshToken,
    role,
  };
};