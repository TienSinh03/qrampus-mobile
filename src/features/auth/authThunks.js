import { setAccessToken, clearToken, instance } from "../../api/axiosInstance";
import { createAsyncThunk } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";
import { getDevicePayload } from "../../utils/device.helper";
import { resetNotifications } from "../notification/notificationSlice";
import { unregisterPushTokenThunk } from "../notification/notificationThunks";

// Định nghĩa các role hợp lệ cho từng loại đăng nhập
const ALLOWED_ROLES = {
  student: ['student'],
  teacher: ['teacher', 'admin'], // admin cũng có thể đăng nhập như teacher
};

/**
 * Kiểm tra role có hợp lệ với loại đăng nhập không
 */
const validateRole = (userRoles, loginRole) => {
  const allowedRoles = ALLOWED_ROLES[loginRole] || [];
  return userRoles.some(role => allowedRoles.includes(role));
};

/**
 * Lấy thông báo lỗi role không hợp lệ
 */
const getRoleErrorMessage = (loginRole) => {
  if (loginRole === 'student') {
    return 'Tài khoản này không phải là sinh viên. Vui lòng sử dụng trang đăng nhập dành cho giảng viên.';
  }
  if (loginRole === 'teacher') {
    return 'Tài khoản này không phải là giảng viên. Vui lòng sử dụng trang đăng nhập dành cho sinh viên.';
  }
  return 'Role không hợp lệ.';
};

export const loadSessionThunk = createAsyncThunk('auth/loadSession', async () => {
  const accessToken = await SecureStore.getItemAsync('accessToken');
  const userStr = await SecureStore.getItemAsync('userLogin');
  const loginRole = await SecureStore.getItemAsync('loginRole');
  
  return {
    accessToken: accessToken || null,
    user: userStr ? JSON.parse(userStr) : null,
    loginRole: loginRole || null,
  };
});

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ user_name, password, loginRole }, { rejectWithValue }) => {
    try {
      const device_payload = loginRole === 'student' ? await getDevicePayload() : null;
      console.log('Device payload for login: ', device_payload);
      const res = await instance.post('/auth/login', { user_name, password, device_payload: device_payload });
      const response = res?.data || {};
      // console.log('Login response:', response);
      
      if (!response.success) {
        throw new Error(response.message || 'Đăng nhập thất bại');
      }

      const data = response.data || {};
      const accessToken = data?.accessToken || null;
      const refreshToken = data?.refreshToken || null;
      
      if (!accessToken) {
        throw new Error('Không nhận được token từ server');
      }

      // Lấy thông tin user từ response
      const userFromApi = data?.user || {};
      const userRoles = userFromApi?.roles || [];

      // Kiểm tra role có hợp lệ với loại đăng nhập không
      if (!validateRole(userRoles, loginRole)) {
        return rejectWithValue(getRoleErrorMessage(loginRole));
      }

      const user = {
        userId: userFromApi?.id || null,
        userName: userFromApi?.user_name || '',
        roles: userRoles,
      };
      console.log('Logged in user:', user);

      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);
      await SecureStore.setItemAsync('userLogin', JSON.stringify(user));
      await SecureStore.setItemAsync('loginRole', loginRole);

      setAccessToken(accessToken);
      
      return { accessToken, refreshToken, user };
    } catch (err) {
      if (err?.response?.data) {
        const errorData = err.response.data;
        // Bắt lỗi DEVICE_MISMATCH riêng
        if (errorData?.error_code === 'DEVICE_MISMATCH') {
          return rejectWithValue({ message: errorData.message, error_code: 'DEVICE_MISMATCH' });
        }
        return rejectWithValue(errorData?.message || 'Đăng nhập thất bại');
      }
      
      const msg = err?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      return rejectWithValue(msg);
    }
  }
);

export const logoutThunk = createAsyncThunk('auth/logout', async (_, { dispatch }) => {
  // Hủy đăng ký push token trước khi xóa session
  // try {
  //   await dispatch(unregisterPushTokenThunk()).unwrap();
  // } catch (_e) {
  //   // Không block logout nếu unregister fail
  // }

  await SecureStore.deleteItemAsync('accessToken');
  await SecureStore.deleteItemAsync('refreshToken');
  await SecureStore.deleteItemAsync('userLogin');
  await SecureStore.deleteItemAsync('loginRole');
  clearToken();

  // Reset notification state
  dispatch(resetNotifications());

  return true;
});