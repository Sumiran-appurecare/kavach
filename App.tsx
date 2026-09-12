// Imported from the per-variant subpaths on purpose: the package roots require
// every weight and italic, which would drag ~3 MB of unused faces into the
// bundle and eat into the download-size budget (NFR-16).
import { Hind_400Regular } from '@expo-google-fonts/hind/400Regular';
import { Hind_500Medium } from '@expo-google-fonts/hind/500Medium';
import { Hind_600SemiBold } from '@expo-google-fonts/hind/600SemiBold';
import { Hind_700Bold } from '@expo-google-fonts/hind/700Bold';
import { IBMPlexMono_400Regular } from '@expo-google-fonts/ibm-plex-mono/400Regular';
import { IBMPlexMono_500Medium } from '@expo-google-fonts/ibm-plex-mono/500Medium';
import { IBMPlexMono_600SemiBold } from '@expo-google-fonts/ibm-plex-mono/600SemiBold';
import { DefaultTheme, NavigationContainer, Theme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider } from './src/i18n/LanguageProvider';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AppStateProvider } from './src/state/AppState';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';

export default function App() {
  const [fontsLoaded] = useFonts({
    Hind_400Regular,
    Hind_500Medium,
    Hind_600SemiBold,
    Hind_700Bold,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
  });

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AppStateProvider>{fontsLoaded ? <Navigation /> : <Splash />}</AppStateProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

/**
 * Held until the Devanagari faces are in memory. Letting the app paint first
 * would show a Latin fallback and then reflow every Hindi string, which is
 * exactly the "translation layer" feel Hindi-first users notice.
 */
function Splash() {
  const { c } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: c.forest, alignItems: 'center', justifyContent: 'center' }}>
      <StatusBar style="light" />
      <ActivityIndicator color={c.onForest} />
    </View>
  );
}

function Navigation() {
  const { c, isDark } = useTheme();

  const navTheme: Theme = {
    ...DefaultTheme,
    dark: isDark,
    colors: {
      ...DefaultTheme.colors,
      primary: c.forest,
      background: c.paper,
      card: c.card,
      text: c.ink,
      border: c.line,
      notification: c.siren,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      {/* Status bar colour is set per screen by ThemedStatusBar, since the home
          panel sits under the bar in dark green and the rest of the app does not. */}
      <RootNavigator />
    </NavigationContainer>
  );
}
