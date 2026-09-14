import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  Emergency: undefined;
  FraudCase: undefined;
  Consult: undefined;
  Document: { id: string };
  Guides: undefined;
  /** Reachable from the home tiles and the Services tab, not a tab itself. */
  Vault: undefined;
  Assistant: undefined;
  Insurance: undefined;
  Vehicle: undefined;
  DocIntel: undefined;
  More: undefined;
};

/** Four tabs, per the wireframe: Home · Safety · Cases · Services. */
export type TabParamList = {
  Home: undefined;
  Safety: undefined;
  Cases: undefined;
  Services: undefined;
};

/**
 * Screens live inside a tab navigator nested in a stack, so a `navigate` call
 * may target either. React Navigation bubbles an unknown route name up to the
 * parent, so one combined param list gives us type safety without threading
 * composite navigation props through every screen.
 */
export type AppParamList = RootStackParamList & TabParamList;

export type Nav = NativeStackNavigationProp<AppParamList>;
