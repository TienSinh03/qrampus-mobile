import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { View, ActivityIndicator } from 'react-native';
import { loadSessionThunk } from '../features/auth/authThunks';
import { 
  selectIsAuthenticated, 
  selectLoginRole,
  selectIsLoading,
} from '../features/auth/authSlice';
import { useSocket } from '../hooks/useSocket';
import { usePushNotification } from '../hooks/usePushNotification';

import IntroCarouselScreen from '../screens/IntroCarouselScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import LoginScreen from '../screens/LoginScreen';
import StudentTabNavigator from './StudentTabNavigator';
import TeacherTabNavigator from './TeacherTabNavigator';
import NotificationScreen from '../screens/NotificationScreen';
import NotificationDetailScreen from '../screens/NotificationDetailScreen';
import QRScanScreen from '../screens/student/QRScanScreen';
import ScheduleDetailScreen from '../screens/student/ScheduleDetailScreen';
import LeaveRequestScreen from '../screens/student/LeaveRequestScreen';
import LeaveRequestListScreen from '../screens/student/LeaveRequestListScreen';
import AttendanceHistoryScreen from '../screens/student/AttendanceHistoryScreen';
import SurveyScreen from '../screens/student/SurveyScreen';
import CourseDetailScreen from '../screens/CourseDetailScreen';
import CreateQRSessionScreen from '../screens/teacher/CreateQRSessionScreen';
import SessionListScreen from '../screens/teacher/SessionListScreen';
import StudentListScreen from '../screens/teacher/StudentListScreen';
import TeacherLeaveRequestListScreen from '../screens/teacher/TeacherLeaveRequestListScreen';
import TeacherLeaveRequestDetailScreen from '../screens/teacher/TeacherLeaveRequestDetailScreen';
import TeacherScheduleDetailScreen from '../screens/teacher/TeacherScheduleDetailScreen';
import AttendancePhotoScreen from '../screens/teacher/AttendancePhotoScreen';
import ImageSessionListScreen from '../screens/teacher/ImageSessionListScreen';
import AttendanceImageScreen from '../screens/teacher/AttendanceImageScreen';
import SurveyListScreen from '../screens/student/SurveyListScreen';
import SurveyQuestionScreen from '../screens/student/SurveyQuestionScreen';
import ProfileScreen from '../screens/ProfileScreen';
import StudentChangePasswordScreen from '../screens/student/StudentChangePasswordScreen';
import DeviceChangeHistoryScreen from '../screens/student/DeviceChangeHistoryScreen';
import TermsPoliciesScreen from '../screens/TermsPoliciesScreen';
import TeacherNotificationScreen from '../screens/teacher/TeacherNotificationScreen';
import TeacherMyNotificationScreen from '../screens/teacher/TeacherMyNotificationScreen';
import TeacherSurveyScreen from '../screens/teacher/SurveyScreen';
import TeacherMyClassesScreen from '../screens/teacher/TeacherMyClassesScreen';
import SettingScreen from '../screens/SettingScreen';
import StudentAvatarGateScreen from '../screens/student/StudentAvatarGateScreen';
import TeacherAttendanceHistoryScreen from '../screens/teacher/TeacherAttendanceHistoryScreen';
import TeacherCourseAttendanceSessionsScreen from '../screens/teacher/TeacherCourseAttendanceSessionsScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loginRole = useSelector(selectLoginRole);
  const isLoading = useSelector(selectIsLoading);
  const [isSessionLoaded, setIsSessionLoaded] = React.useState(false);

  // Kích hoạt Socket.IO realtime 
  useSocket();
  // Kích hoạt Expo Push Notification (đăng ký token + listen)
  usePushNotification();

  // Load session khi app khởi động
  useEffect(() => {
    const loadSession = async () => {
      await dispatch(loadSessionThunk());
      setIsSessionLoaded(true);
    };
    loadSession();
  }, [dispatch]);

  // Xác định màn hình khởi đầu dựa trên trạng thái auth
  const getInitialRouteName = () => {
    if (!isSessionLoaded) return 'IntroCarousel';
    if (isAuthenticated && loginRole) {
      
      return loginRole === 'student' ? 'StudentAvatarGate' : 'TeacherHome';
    }
    return 'IntroCarousel';
  };

  // Hiển thị loading khi đang load session
  if (!isSessionLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2563eb' }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={getInitialRouteName()}
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen 
          name="IntroCarousel" 
          component={IntroCarouselScreen}
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen 
          name="RoleSelection" 
          component={RoleSelectionScreen} 
        />
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
        />
        
        <Stack.Screen
          name="StudentAvatarGate"
          component={StudentAvatarGateScreen}
          options={{
            gestureEnabled: false,
          }}
        />

        <Stack.Screen
          name="StudentHome"
          component={StudentTabNavigator}
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="TeacherHome"
          component={TeacherTabNavigator}
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="Notification"
          component={NotificationScreen}
          options={{
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="NotificationDetail"
          component={NotificationDetailScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="QRScan"
          component={QRScanScreen}
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="ScheduleDetail"
          component={ScheduleDetailScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="LeaveRequest"
          component={LeaveRequestScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="LeaveRequestList"
          component={LeaveRequestListScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="AttendanceHistory"
          component={AttendanceHistoryScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="Survey"
          component={SurveyScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="CourseDetail"
          component={CourseDetailScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="SessionList"
          component={SessionListScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="StudentList"
          component={StudentListScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="CreateQRSession"
          component={CreateQRSessionScreen}
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="TeacherLeaveRequestList"
          component={TeacherLeaveRequestListScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="TeacherLeaveRequestDetail"
          component={TeacherLeaveRequestDetailScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="TeacherScheduleDetail"
          component={TeacherScheduleDetailScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="ImageSessionList"
          component={ImageSessionListScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="AttendanceImage"
          component={AttendanceImageScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="AttendancePhoto"
          component={AttendancePhotoScreen}
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
            animation: 'fade',
          }}
        />

        <Stack.Screen
          name="SurveyList"
          component={SurveyListScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="SurveyQuestion"
          component={SurveyQuestionScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="ProfileDetail"
          component={ProfileScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="ChangePassword"
          component={StudentChangePasswordScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="DeviceChangeHistory"
          component={DeviceChangeHistoryScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="TermsPolicies"
          component={TermsPoliciesScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="TeacherNotification"
          component={TeacherNotificationScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="TeacherMyNotification"
          component={TeacherMyNotificationScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="SurveyScreen"
          component={TeacherSurveyScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="Setting"
          component={SettingScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="TeacherMyClasses"
          component={TeacherMyClassesScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="TeacherAttendanceHistory"
          component={TeacherAttendanceHistoryScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="TeacherCourseAttendanceSessions"
          component={TeacherCourseAttendanceSessionsScreen}
          options={{
            headerShown: false,
          }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
