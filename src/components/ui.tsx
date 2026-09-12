import { useIsFocused } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleProp,
  Text,
  TextInput,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLang } from '../i18n/LanguageProvider';
import { useTheme } from '../theme/ThemeProvider';
import { cardShadow, font, radius, space } from '../theme/tokens';
import { Icon, IconName } from './Icon';

// ── layout ────────────────────────────────────────────────────────────

/**
 * Status bar content colour, decided per screen and only while that screen is
 * focused — the home panel is dark green under the bar, every other screen is
 * light paper, so one global setting would be wrong half the time.
 */
export function ThemedStatusBar({ light = false }: { light?: boolean }) {
  const { isDark } = useTheme();
  const focused = useIsFocused();
  if (!focused) return null;
  return <StatusBar style={light || isDark ? 'light' : 'dark'} />;
}

export function Screen({
  children,
  scroll = false,
  padTop = true,
  style,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  padTop?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const base: ViewStyle = { flex: 1, backgroundColor: c.paper };

  if (scroll) {
    return (
      <View style={base}>
        <ThemedStatusBar />
        <ScrollView
          contentContainerStyle={[
            { paddingTop: padTop ? insets.top + space.sm : 0, paddingBottom: space.xxl },
            style,
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </View>
    );
  }
  return (
    <View style={[base, { paddingTop: padTop ? insets.top + space.sm : 0 }, style]}>
      <ThemedStatusBar />
      {children}
    </View>
  );
}

export function AppHeader({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  const { c } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md,
        paddingHorizontal: space.lg,
        paddingBottom: space.md,
      }}
    >
      {onBack ? (
        <Pressable
          onPress={onBack}
          hitSlop={10}
          accessibilityRole="button"
          style={{
            width: 34,
            height: 34,
            borderRadius: radius.pill,
            borderWidth: 1,
            borderColor: c.line,
            backgroundColor: c.card,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="chevronLeft" size={18} color={c.ink} />
        </Pressable>
      ) : null}
      <Text
        style={{
          flex: 1,
          fontFamily: font.display,
          fontSize: 22,
          lineHeight: 28,
          color: c.ink,
        }}
        numberOfLines={1}
      >
        {title}
      </Text>
      {right}
    </View>
  );
}

export function Card({
  children,
  style,
  lifted = false,
  onPress,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  lifted?: boolean;
  onPress?: () => void;
}) {
  const { c } = useTheme();
  const body: ViewStyle = {
    backgroundColor: c.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: c.line,
    padding: space.lg,
  };
  const composed = [body, lifted ? cardShadow(c.shadow) : null, style];
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [composed, pressed && { opacity: 0.85 }]}>
        {children}
      </Pressable>
    );
  }
  return <View style={composed}>{children}</View>;
}

export function SectionLabel({
  children,
  action,
  onAction,
  style,
}: {
  children: string;
  action?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { c } = useTheme();
  return (
    <View
      style={[
        { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: space.sm },
        style,
      ]}
    >
      <Text
        style={{
          fontFamily: font.semibold,
          fontSize: 10.5,
          letterSpacing: 1.2,
          textTransform: 'uppercase',
          color: c.ink3,
        }}
      >
        {children}
      </Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={{ fontFamily: font.semibold, fontSize: 11.5, color: c.leaf }}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Title({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  const { c } = useTheme();
  return (
    <Text style={[{ fontFamily: font.display, fontSize: 24, lineHeight: 30, color: c.ink }, style]}>
      {children}
    </Text>
  );
}

export function Body({
  children,
  style,
  dim = false,
  size = 13.5,
}: {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  dim?: boolean;
  size?: number;
}) {
  const { c } = useTheme();
  return (
    <Text
      style={[
        { fontFamily: font.regular, fontSize: size, lineHeight: size * 1.5, color: dim ? c.ink3 : c.ink2 },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Mono({
  children,
  style,
  size = 11,
}: {
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  size?: number;
}) {
  const { c } = useTheme();
  return (
    <Text
      style={[
        { fontFamily: font.monoMedium, fontSize: size, color: c.ink2, fontVariant: ['tabular-nums'] },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

// ── controls ──────────────────────────────────────────────────────────

export function PrimaryButton({
  label,
  onPress,
  icon,
  disabled = false,
  busy = false,
  tone = 'forest',
  style,
}: {
  label: string;
  onPress: () => void;
  icon?: IconName;
  disabled?: boolean;
  busy?: boolean;
  tone?: 'forest' | 'siren' | 'light';
  style?: StyleProp<ViewStyle>;
}) {
  const { c } = useTheme();
  const bg = tone === 'siren' ? c.siren : tone === 'light' ? c.card : c.forest;
  const fg = tone === 'light' ? c.ink : tone === 'siren' ? c.onSiren : c.onForest;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || busy}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || busy }}
      style={({ pressed }) => [
        {
          backgroundColor: bg,
          borderRadius: radius.md,
          paddingVertical: 14,
          paddingHorizontal: space.lg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: space.sm,
          borderWidth: tone === 'light' ? 1 : 0,
          borderColor: c.line,
          opacity: disabled ? 0.45 : pressed ? 0.88 : 1,
        },
        style,
      ]}
    >
      {busy ? <ActivityIndicator size="small" color={fg} /> : icon ? <Icon name={icon} size={17} color={fg} /> : null}
      <Text style={{ fontFamily: font.semibold, fontSize: 14.5, color: fg }}>{label}</Text>
    </Pressable>
  );
}

export function GhostButton({
  label,
  onPress,
  icon,
  style,
}: {
  label: string;
  onPress: () => void;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: space.sm,
          paddingVertical: 12,
          paddingHorizontal: space.lg,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: c.line,
          backgroundColor: c.card2,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {icon ? <Icon name={icon} size={16} color={c.ink} /> : null}
      <Text style={{ fontFamily: font.semibold, fontSize: 13, color: c.ink }}>{label}</Text>
    </Pressable>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  style,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { c } = useTheme();
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          backgroundColor: c.card2,
          borderWidth: 1,
          borderColor: c.line,
          borderRadius: radius.md,
          padding: 3,
          gap: 3,
        },
        style,
      ]}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={{
              flex: 1,
              paddingVertical: 9,
              borderRadius: radius.sm,
              alignItems: 'center',
              backgroundColor: active ? c.forest : 'transparent',
            }}
          >
            <Text
              style={{
                fontFamily: active ? font.semibold : font.medium,
                fontSize: 12.5,
                color: active ? c.onForest : c.ink2,
              }}
              numberOfLines={1}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  multiline = false,
  maxLength,
  secure = false,
  mono = false,
  autoFocus = false,
  hint,
  error,
}: {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'number-pad' | 'phone-pad' | 'email-address' | 'url';
  multiline?: boolean;
  maxLength?: number;
  secure?: boolean;
  mono?: boolean;
  autoFocus?: boolean;
  hint?: string;
  error?: string;
}) {
  const { c } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <Text
          style={{
            fontFamily: font.semibold,
            fontSize: 10.5,
            letterSpacing: 1,
            textTransform: 'uppercase',
            color: c.ink3,
          }}
        >
          {label}
        </Text>
      ) : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={c.ink3}
        keyboardType={keyboardType}
        multiline={multiline}
        maxLength={maxLength}
        secureTextEntry={secure}
        autoFocus={autoFocus}
        style={{
          backgroundColor: c.card,
          borderWidth: 1,
          borderColor: error ? c.siren : c.line,
          borderRadius: radius.md,
          paddingHorizontal: space.md,
          paddingVertical: multiline ? space.md : 13,
          minHeight: multiline ? 110 : undefined,
          textAlignVertical: multiline ? 'top' : 'center',
          fontFamily: mono ? font.monoMedium : font.regular,
          fontSize: mono ? 15 : 15,
          letterSpacing: mono ? 1.5 : 0,
          color: c.ink,
        }}
      />
      {error ? (
        <Text style={{ fontFamily: font.medium, fontSize: 11.5, color: c.siren }}>{error}</Text>
      ) : hint ? (
        <Text style={{ fontFamily: font.regular, fontSize: 11.5, color: c.ink3 }}>{hint}</Text>
      ) : null}
    </View>
  );
}

export function ListRow({
  icon,
  iconTone = 'plain',
  title,
  sub,
  right,
  rightText,
  onPress,
  last = false,
}: {
  icon?: IconName;
  iconTone?: 'plain' | 'leaf' | 'brass' | 'siren';
  title: string;
  sub?: string;
  right?: React.ReactNode;
  rightText?: string;
  onPress?: () => void;
  last?: boolean;
}) {
  const { c } = useTheme();
  const tones = {
    plain: { bg: c.card2, fg: c.ink2, border: c.line },
    leaf: { bg: c.leafBg, fg: c.leaf, border: 'transparent' },
    brass: { bg: c.brassBg, fg: c.brass, border: 'transparent' },
    siren: { bg: c.siren, fg: c.onSiren, border: 'transparent' },
  }[iconTone];

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md,
        paddingVertical: space.md,
        paddingHorizontal: space.lg,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: c.line2,
        backgroundColor: pressed && onPress ? c.card2 : 'transparent',
      })}
    >
      {icon ? (
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: radius.sm + 2,
            backgroundColor: tones.bg,
            borderWidth: 1,
            borderColor: tones.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={icon} size={18} color={tones.fg} />
        </View>
      ) : null}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: font.medium, fontSize: 14, color: c.ink }}>{title}</Text>
        {sub ? (
          <Text style={{ fontFamily: font.regular, fontSize: 11.5, lineHeight: 16, color: c.ink3, marginTop: 1 }}>
            {sub}
          </Text>
        ) : null}
      </View>
      {rightText ? (
        <Text style={{ fontFamily: font.semibold, fontSize: 11.5, color: c.leaf }}>{rightText}</Text>
      ) : null}
      {right ?? (onPress ? <Icon name="chevronRight" size={17} color={c.ink3} /> : null)}
    </Pressable>
  );
}

export function Chip({
  label,
  tone = 'plain',
  style,
}: {
  label: string;
  tone?: 'plain' | 'leaf' | 'brass' | 'siren';
  style?: StyleProp<ViewStyle>;
}) {
  const { c } = useTheme();
  const map = {
    plain: { bg: c.card2, fg: c.ink2, bd: c.line },
    leaf: { bg: c.leafBg, fg: c.leaf, bd: 'transparent' },
    brass: { bg: c.brassBg, fg: c.brass, bd: 'transparent' },
    siren: { bg: c.siren, fg: c.onSiren, bd: 'transparent' },
  }[tone];
  return (
    <View
      style={[
        {
          alignSelf: 'flex-start',
          backgroundColor: map.bg,
          borderWidth: 1,
          borderColor: map.bd,
          borderRadius: radius.sm - 2,
          paddingHorizontal: space.sm + 1,
          paddingVertical: 5,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontFamily: font.semibold,
          fontSize: 10,
          letterSpacing: 1,
          textTransform: 'uppercase',
          color: map.fg,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

// ── compliance furniture ──────────────────────────────────────────────

/**
 * FR-CMP-08 / CMP-T06. Required on every emergency and assistant surface.
 * Kept as one component so QA has a single thing to look for, and so the
 * wording cannot drift between screens.
 */
export function OtpNotice({ onDark = false }: { onDark?: boolean }) {
  const { c } = useTheme();
  const { t } = useLang();
  const fg = onDark ? c.onSiren : c.ink2;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.sm,
        paddingHorizontal: space.md,
        paddingVertical: space.sm + 1,
        borderRadius: radius.sm + 2,
        backgroundColor: onDark ? 'rgba(0,0,0,0.18)' : c.card2,
        borderWidth: 1,
        borderColor: onDark ? 'rgba(255,255,255,0.24)' : c.line,
      }}
    >
      <Icon name="shieldCheck" size={15} color={fg} />
      <Text style={{ flex: 1, fontFamily: font.semibold, fontSize: 11.5, lineHeight: 16, color: fg }}>
        {t('common.otpNotice')}
      </Text>
    </View>
  );
}

/** FR-CMP-04. AI and assistant output always carries this, never a seal. */
export function InfoDisclaimer({ style }: { style?: StyleProp<ViewStyle> }) {
  const { c } = useTheme();
  const { t } = useLang();
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 6 }, style]}>
      <Icon name="bulb" size={13} color={c.ink3} />
      <Text style={{ fontFamily: font.medium, fontSize: 11, color: c.ink3 }}>{t('common.aiDisclaimer')}</Text>
    </View>
  );
}

// ── live countdown ────────────────────────────────────────────────────

function remaining(target: string) {
  const ms = Math.max(0, new Date(target).getTime() - Date.now());
  const s = Math.floor(ms / 1000);
  return {
    expired: ms === 0,
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60,
  };
}

const pad = (n: number) => n.toString().padStart(2, '0');

/** The RBI window, ticking (FR-EMG-04). */
export function Countdown({
  target,
  size = 19,
  color,
}: {
  target: string;
  size?: number;
  color: string;
}) {
  const [now, setNow] = useState(() => remaining(target));

  useEffect(() => {
    const id = setInterval(() => setNow(remaining(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <Text
      style={{
        fontFamily: font.monoSemibold,
        fontSize: size,
        color,
        fontVariant: ['tabular-nums'],
      }}
    >
      {`${now.d}d ${pad(now.h)}h ${pad(now.m)}m ${pad(now.s)}s`}
    </Text>
  );
}

export function useCountdown(target: string) {
  const [value, setValue] = useState(() => remaining(target));
  useEffect(() => {
    const id = setInterval(() => setValue(remaining(target)), 1000);
    return () => clearInterval(id);
  }, [target]);
  return value;
}
