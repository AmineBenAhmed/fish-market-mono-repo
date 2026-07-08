import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, Platform } from 'react-native';

import { HomeScreen } from '../screens/home/HomeScreen';
import { DeliveryWorkflowScreen } from '../screens/deliveries/DeliveryWorkflowScreen';
import { DeliveryDetailScreen } from '../screens/deliveries/DeliveryDetailScreen';
import { HistoryScreen } from '../screens/history/HistoryScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import type { DeliveryStatusValue } from '../types';

export type HomeStackParamList = {
  HomeMain: undefined;
  ActiveDelivery: { deliveryId: string };
};

export type DeliveriesStackParamList = {
  Workflow: { deliveryId: string };
  DeliveryDetail: { deliveryId: string };
};

export type HistoryStackParamList = {
  HistoryMain: undefined;
  HistoryDetail: { deliveryId: string };
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
};

const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const DeliveriesStack = createNativeStackNavigator<DeliveriesStackParamList>();
const HistoryStack = createNativeStackNavigator<HistoryStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const Tab = createBottomTabNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="ActiveDelivery" component={DeliveryWorkflowScreen} />
    </HomeStack.Navigator>
  );
}

function DeliveriesStackScreen() {
  return (
    <DeliveriesStack.Navigator screenOptions={{ headerShown: false }}>
      <DeliveriesStack.Screen name="Workflow" component={DeliveryWorkflowScreen} />
      <DeliveriesStack.Screen name="DeliveryDetail" component={DeliveryDetailScreen} />
    </DeliveriesStack.Navigator>
  );
}

function HistoryStackScreen() {
  return (
    <HistoryStack.Navigator screenOptions={{ headerShown: false }}>
      <HistoryStack.Screen name="HistoryMain" component={HistoryScreen} />
      <HistoryStack.Screen name="HistoryDetail" component={DeliveryDetailScreen} />
    </HistoryStack.Navigator>
  );
}

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
    </ProfileStack.Navigator>
  );
}

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Accueil: '🏠',
    Livraisons: '📦',
    Historique: '📋',
    Notifications: '🔔',
    Profil: '👤',
  };
  return (
    <Text style={{ fontSize: Platform.OS === 'ios' ? 22 : 20, opacity: focused ? 1 : 0.5 }}>
      {icons[label] || '•'}
    </Text>
  );
}

export function DriverTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 6,
          height: Platform.OS === 'ios' ? 85 : 65,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen name="Accueil" component={HomeStackScreen} />
      <Tab.Screen name="Livraisons" component={DeliveriesStackScreen} />
      <Tab.Screen name="Historique" component={HistoryStackScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profil" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
}
