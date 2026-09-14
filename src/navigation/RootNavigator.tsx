import { BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, IconName } from '../components/Icon';
import { useLang } from '../i18n/LanguageProvider';
import { StringKey } from '../i18n/strings';
import { AssistantScreen } from '../screens/AssistantScreen';
import { CasesScreen } from '../screens/CasesScreen';
import { ConsultScreen } from '../screens/ConsultScreen';
import { DocIntelScreen } from '../screens/DocIntelScreen';
import { DocumentScreen } from '../screens/DocumentScreen';
import { EmergencyScreen } from '../screens/EmergencyScreen';
import { FraudCaseScreen } from '../screens/FraudCaseScreen';
import { GuidesScreen } from '../screens/GuidesScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { InsuranceScreen } from '../screens/InsuranceScreen';
import { MoreScreen } from '../screens/MoreScreen';
import { ServicesScreen } from '../screens/ServicesScreen';
import { ShieldScreen } from '../screens/ShieldScreen';
import { VaultScreen } from '../screens/VaultScreen';
import { VehicleScreen } from '../screens/VehicleScreen';
import {
  CarouselScreen,
  KitScreen,
  OnboardParamList,
  OtpScreen,
  PassphraseScreen,
  PhoneScreen,
  PlanScreen,
  ProfileScreen,
} from '../screens/onboarding';
import { useApp } from '../state/AppState';
import { useTheme } from '../theme/ThemeProvider';
import { font, space } from '../theme/tokens';
import { RootStackParamList, TabParamList } from './types';

const Tabs = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();
const Onboard = createNativeStackNavigator<OnboardParamList>();

/** Four tabs, per the wireframe. Everything else is pushed on top of them. */
const TAB_META: { name: keyof TabParamList; icon: IconName; label: StringKey }[] = [
  { name: 'Home', icon: 'home', label: 'tab.home' },
  { name: 'Safety', icon: 'shieldCheck', label: 'tab.safety' },
  { name: 'Cases', icon: 'folder', label: 'tab.cases' },
  { name: 'Services', icon: 'grid', label: 'tab.services' },
];

function TabBar({ state, navigation }: BottomTabBarProps) {
  const { c, isDark } = useTheme();
  const { t } = useLang();
  const insets = useSafeAreaInsets();
  const active = isDark ? c.accent : c.accent;

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: c.card,
        borderTopWidth: 1,
        borderTopColor: c.line,
        paddingTop: space.sm - 1,
        paddingBottom: Math.max(insets.bottom, space.md),
      }}
    >
      {state.routes.map((route, index) => {
        const meta = TAB_META.find((m) => m.name === route.name);
        if (!meta) return null;
        const focused = state.index === index;
        return (
          <Pressable
            key={route.key}
            onPress={() => {
              if (!focused) navigation.navigate(route.name);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={t(meta.label)}
            style={{ flex: 1, alignItems: 'center', gap: 3, paddingVertical: 3 }}
          >
            <Icon name={meta.icon} size={21} color={focused ? active : c.ink3} strokeWidth={focused ? 1.95 : 1.6} />
            <Text
              style={{
                fontFamily: focused ? font.semibold : font.medium,
                fontSize: 9.5,
                color: focused ? active : c.ink3,
              }}
            >
              {t(meta.label)}
            </Text>
            <View
              style={{
                width: 16,
                height: 2.5,
                borderRadius: 2,
                marginTop: 1,
                backgroundColor: focused ? active : 'transparent',
              }}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

function MainTabs() {
  return (
    <Tabs.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Safety" component={ShieldScreen} />
      <Tabs.Screen name="Cases" component={CasesScreen} />
      <Tabs.Screen name="Services" component={ServicesScreen} />
    </Tabs.Navigator>
  );
}

function OnboardingFlow() {
  return (
    <Onboard.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Onboard.Screen name="Carousel" component={CarouselScreen} />
      <Onboard.Screen name="Phone" component={PhoneScreen} />
      <Onboard.Screen name="Otp" component={OtpScreen} />
      <Onboard.Screen name="Profile" component={ProfileScreen} />
      {/* Passphrase and Kit have no back-out to Home: a user cannot reach the
          app without completing them (FR-AUTH-06, and the acceptance criteria
          for the onboarding flow). */}
      <Onboard.Screen name="Passphrase" component={PassphraseScreen} />
      <Onboard.Screen name="Kit" component={KitScreen} />
      <Onboard.Screen name="Plan" component={PlanScreen} options={{ gestureEnabled: false }} />
    </Onboard.Navigator>
  );
}

export function RootNavigator() {
  const { onboarded } = useApp();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {onboarded ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="Emergency" component={EmergencyScreen} />
          <Stack.Screen name="FraudCase" component={FraudCaseScreen} />
          <Stack.Screen name="Consult" component={ConsultScreen} />
          <Stack.Screen name="Document" component={DocumentScreen} />
          <Stack.Screen name="Guides" component={GuidesScreen} />
          <Stack.Screen name="Vault" component={VaultScreen} />
          <Stack.Screen name="Assistant" component={AssistantScreen} />
          <Stack.Screen name="Insurance" component={InsuranceScreen} />
          <Stack.Screen name="Vehicle" component={VehicleScreen} />
          <Stack.Screen name="DocIntel" component={DocIntelScreen} />
          <Stack.Screen name="More" component={MoreScreen} />
        </>
      ) : (
        <Stack.Screen name="Onboarding" component={OnboardingFlow} />
      )}
    </Stack.Navigator>
  );
}
