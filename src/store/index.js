import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import studentReducer from '../features/student/studentSlice';
import teacherReducer from '../features/teacher/teacherSlice';
import imageSessionReducer from '../features/imageSession/ImageSessionSlice';
import attendanceImageReducer from '../features/attendanceImage/attendanceImageSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    student: studentReducer,
    teacher: teacherReducer,
    imageSession: imageSessionReducer,
    attendanceImage: attendanceImageReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
