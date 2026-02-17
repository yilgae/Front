import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import ArchiveScreen from '../screens/ArchiveScreen';
import ArchiveDetailScreen from '../screens/ArchiveDetailScreen';
import CounselingScreen from '../screens/CounselingScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import FAQScreen from '../screens/FAQScreen';
import ContactScreen from '../screens/ContactScreen';
import TermsScreen from '../screens/TermsScreen';
import OpenSourceScreen from '../screens/OpenSourceScreen';
import MembershipScreen from '../screens/MembershipScreen';
import PaymentMethodScreen from '../screens/PaymentMethodScreen';
import UploadScreen from '../screens/UploadScreen';
import AnalysisResultScreen from '../screens/AnalysisResultScreen';
import { Colors, FontSize } from '../constants/theme';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const SettingsStack = createNativeStackNavigator();
const ArchiveStack = createNativeStackNavigator();

// 홈 탭 내부 스택 네비게이터 (홈 → 업로드 → 분석결과)
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="Upload" component={UploadScreen} />
      <HomeStack.Screen name="AnalysisResult" component={AnalysisResultScreen} />
    </HomeStack.Navigator>
  );
}

// 설정 탭 내부 스택 네비게이터
function SettingsStackNavigator() {
  return (
    <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStack.Screen name="SettingsMain" component={SettingsScreen} />
      <SettingsStack.Screen name="EditProfile" component={EditProfileScreen} />
      <SettingsStack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <SettingsStack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <SettingsStack.Screen name="FAQ" component={FAQScreen} />
      <SettingsStack.Screen name="Contact" component={ContactScreen} />
      <SettingsStack.Screen name="Terms" component={TermsScreen} />
      <SettingsStack.Screen name="OpenSource" component={OpenSourceScreen} />
      <SettingsStack.Screen name="Membership" component={MembershipScreen} />
      <SettingsStack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
    </SettingsStack.Navigator>
  );
}

function ArchiveStackNavigator() {
  return (
    <ArchiveStack.Navigator screenOptions={{ headerShown: false }}>
      <ArchiveStack.Screen name="ArchiveMain" component={ArchiveScreen} />
      <ArchiveStack.Screen name="ArchiveDetail" component={ArchiveDetailScreen} />
    </ArchiveStack.Navigator>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primaryDark,
        tabBarInactiveTintColor: Colors.stone400,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 4,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.stone100,
          borderTopWidth: 1,
          height: 76,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: '홈',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Archive"
        component={ArchiveStackNavigator}
        options={{
          tabBarLabel: '보관함',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="folder-open" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Counseling"
        component={CounselingScreen}
        options={{
          tabBarLabel: '상담',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="support-agent" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{
          tabBarLabel: '설정',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
