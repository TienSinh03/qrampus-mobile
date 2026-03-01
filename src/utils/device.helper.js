import * as SecureStore from 'expo-secure-store';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { v4 as uuidv4 } from 'uuid';
import * as Crypto from 'expo-crypto';

const INSTALLATION_ID_KEY = 'installation_id';

/**
 * Lấy hoặc tạo installation_id đơn giản (UUID v4), lưu vào SecureStore.
 * - Nếu đã có → trả lại giá trị cũ
 * - Nếu chưa có / xóa app → tạo mới và lưu lại
 */
export const getInstallationId = async () => {
  try {
    let id = await SecureStore.getItemAsync(INSTALLATION_ID_KEY);
    if (!id) {
      id = Crypto.randomUUID();
      await SecureStore.setItemAsync(INSTALLATION_ID_KEY, id);
    }
    return id;
  } catch (error) {
    console.warn('Không lưu được installation_id:', error);
    return Crypto.randomUUID();
  }
};

/**
 * Tạo payload thiết bị gồm installation_id và thông tin máy để gửi lên server.
 */
export async function getDevicePayload() {
  const installationId = await getInstallationId();
  return {
    installation_id: installationId,
    device: {
      brand: Device.brand,
      modelName: Device.modelName,
      osName: Device.osName,
      osVersion: Device.osVersion,
      appVersion: Application.nativeApplicationVersion,
      buildVersion: Application.nativeBuildVersion,
    },
  };
}
