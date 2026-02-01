import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import studentReducer from '../features/student/studentSlice';
import teacherReducer from '../features/teacher/teacherSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    student: studentReducer,
    teacher: teacherReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
