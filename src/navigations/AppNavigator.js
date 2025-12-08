import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import IntroCarouselScreen from '../screens/IntroCarouselScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import LoginScreen from '../screens/LoginScreen';
import StudentTabNavigator from './StudentTabNavigator';
import TeacherTabNavigator from './TeacherTabNavigator';
import NotificationScreen from '../screens/NotificationScreen';
import QRScanScreen from '../screens/student/QRScanScreen';
import ScheduleDetailScreen from '../screens/student/ScheduleDetailScreen';
import CreateQRSessionScreen from '../screens/teacher/CreateQRSessionScreen';
import SessionListScreen from '../screens/teacher/SessionListScreen';
import StudentListScreen from '../screens/teacher/StudentListScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="IntroCarousel"
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
