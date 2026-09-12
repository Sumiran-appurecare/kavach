import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  LayoutChangeEvent,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, IconName } from '../components/Icon';
import { Logo } from '../components/Logo';
import { ThemedStatusBar } from '../components/ui';
import { daysUntil, USER } from '../data/mock';
import { rupees, useLang } from '../i18n/LanguageProvider';
import { StringKey } from '../i18n/strings';
import { Nav } from '../navigation/types';
import { useApp } from '../state/AppState';
import { useTheme } from '../theme/ThemeProvider';
import { font, radius, space } from '../theme/tokens';

/**
 * Nothing on this screen is sized for one device. The body measures the height
 * it was actually handed and picks the richest layout that fits inside it, so
 * a short window loses detail instead of overlapping.
 *
 * These are the heights each layout needs, measured against the real content.
 */
const NEEDS = { full: 526, compact: 478 };
const CASE_BLOCK = 126;

type Mode = 'full' | 'compact';

/** The five milestones a fraud case is measured against (FR-EMG-05/06/08/09). */
function caseProgress(args: { bank: boolean; portal: boolean; evidence: boolean; letter: boolean }) {
  const steps = [
    { done: true, next: null },
    { done: args.bank, next: 'case.next.portal' as StringKey },
    { done: args.portal, next: 'case.next.portal' as StringKey },
    { done: args.evidence, next: 'case.next.letter' as StringKey },
    { done: args.letter, next: 'case.next.letter' as StringKey },
  ];
  const done = steps.filter((s) => s.done).length;
  const pending = steps.find((s) => !s.done);
  return { done, total: steps.length, nextKey: pending?.next ?? ('case.next.followup' as StringKey) };
}

export function HomeScreen() {
  const { c } = useTheme();
  const { t, lang } = useLang();
  const insets = useSafeAreaInsets();
  const nav = useNavigation<Nav>();
  const { plan, profile, fraudCase, docs, consultsLeft, scamChecksLeft } = useApp();

  const [bodyH, setBodyH] = useState(0);
  const onBodyLayout = (e: LayoutChangeEvent) => {
    const h = Math.round(e.nativeEvent.layout.height);
    setBodyH((prev) => (Math.abs(prev - h) > 1 ? h : prev));
  };

  const extra = fraudCase ? CASE_BLOCK : 0;
  const mode: Mode = bodyH === 0 || bodyH >= NEEDS.full + extra ? 'full' : 'compact';

  const free = plan === 'FREE';
  const firstName = lang === 'hi' ? USER.firstName.hi : profile.name.split(' ')[0];
  const hour = new Date().getHours();
  const greetingKey: StringKey =
    hour < 12 ? 'home.greeting.morning' : hour < 17 ? 'home.greeting.afternoon' : 'home.greeting.evening';

  return (
    <View style={{ flex: 1, backgroundColor: c.paper }}>
      <ThemedStatusBar light />

      {/* ══ header ══ */}
      <View
        style={{
          backgroundColor: c.forest,
          borderBottomLeftRadius: radius.xl + 4,
          borderBottomRightRadius: radius.xl + 4,
          paddingTop: insets.top + space.md,
          paddingHorizontal: space.lg + 2,
          paddingBottom: space.xl + 6,
          gap: space.md - 2,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm + 2 }}>
          <Logo size={32} shield={c.onForest} scales={c.forest3} />
          <Text style={{ flex: 1, fontFamily: font.bold, fontSize: 16.5, color: c.onForest }} numberOfLines={1}>
            {t('app.name')}
          </Text>
          <LanguageToggle />
          <RoundButton icon="bell" badge onPress={() => nav.navigate('More')} />
          <Avatar name={profile.name} onPress={() => nav.navigate('More')} />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: space.md }}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontFamily: font.bold, fontSize: 20, lineHeight: 26, color: c.onForest }} numberOfLines={1}>
              {`${t(greetingKey)}, `}
              <Text style={{ color: c.onForestAccent }}>{`${firstName}!`}</Text>
            </Text>
            <Text
              style={{ fontFamily: font.regular, fontSize: 12, lineHeight: 16, color: c.onForestDim }}
              numberOfLines={1}
            >
              {t('home.centerTitle')}
            </Text>
          </View>
          <PlanChip free={free} consultsLeft={consultsLeft} />
        </View>
      </View>

      {/* ══ body ══ */}
      <View
        onLayout={onBodyLayout}
        style={{ flex: 1, paddingHorizontal: space.lg, gap: mode === 'compact' ? 7 : 9 }}
      >
        <EmergencyBlock mode={mode} />

        <SectionRow
          title={t('home.help')}
          action={t('home.quickAccess')}
          onAction={() => nav.navigate('Services')}
        />

        <View style={{ gap: mode === 'compact' ? 6 : space.sm }}>
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            <Tile
              icon="shieldCheck"
              tint={c.leaf}
              bg={c.leafBg}
              title={t('f.scam')}
              desc={scamChecksLeft === 'unlimited' ? t('f.scam.desc') : `${scamChecksLeft} ${t('scm.left')}`}
              mode={mode}
              onPress={() => nav.navigate('Safety')}
            />
            <Tile
              icon="vault"
              tint={c.tileBlue}
              bg={c.tileBlueBg}
              title={t('f.vault')}
              desc={free ? t('f.vault.desc') : `${docs.length} ${t('f.vault.meta')}`}
              mode={mode}
              onPress={() => nav.navigate('Vault')}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            <Tile
              icon="chat"
              tint={c.tileViolet}
              bg={c.tileVioletBg}
              title={t('f.aiAssistant')}
              desc={t('f.ai.desc')}
              mode={mode}
              onPress={() => nav.navigate('Assistant')}
            />
            <Tile
              icon="docSearch"
              tint={c.tileTeal}
              bg={c.tileTealBg}
              title={t('f.docIntel')}
              desc={t('f.docIntel.desc')}
              mode={mode}
              onPress={() => nav.navigate('Vault')}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            <Tile
              icon="scales"
              tint={c.tilePurple}
              bg={c.tilePurpleBg}
              title={t('f.advocateConsult')}
              desc={free ? t('f.advocate.desc') : `${consultsLeft} ${t('con.entitlement.left')}`}
              mode={mode}
              onPress={() => nav.navigate('Consult')}
            />
            <Tile
              icon="cover"
              tint={c.brass}
              bg={c.brassBg}
              title={t('f.insurance')}
              desc={t('f.insurance.desc')}
              mode={mode}
              onPress={() => nav.navigate('Insurance')}
            />
          </View>
        </View>

        <View style={{ flex: 1, justifyContent: 'flex-end', gap: space.sm, paddingBottom: 6 }}>
          {fraudCase ? (
            <>
              <SectionRow title={t('home.myActiveCase')} />
              <ActiveCaseCard mode={mode} />
            </>
          ) : null}
          <LegalProtection mode={mode} />
        </View>
      </View>
    </View>
  );
}

// ── shared pieces ─────────────────────────────────────────────────────

function SectionRow({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md }}>
      <Text style={{ fontFamily: font.bold, fontSize: 14, lineHeight: 18, color: c.ink }}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ fontFamily: font.semibold, fontSize: 11.5, color: c.accent }}>{action}</Text>
          <Icon name="arrowRight" size={12} color={c.accent} strokeWidth={2} />
        </Pressable>
      ) : null}
    </View>
  );
}

function LanguageToggle() {
  const { c } = useTheme();
  const { lang, setLang } = useLang();
  return (
    <View
      style={{
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: c.onForestLine,
        borderRadius: radius.pill,
        overflow: 'hidden',
      }}
    >
      {(['en', 'hi'] as const).map((code) => {
        const active = lang === code;
        return (
          <Pressable
            key={code}
            onPress={() => setLang(code)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={{
              paddingHorizontal: space.sm,
              paddingVertical: 5,
              backgroundColor: active ? c.onForest : 'transparent',
            }}
          >
            <Text style={{ fontFamily: font.semibold, fontSize: 10.5, color: active ? c.forest3 : c.onForestDim }}>
              {code === 'en' ? 'EN' : 'हिं'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function RoundButton({ icon, onPress, badge }: { icon: IconName; onPress: () => void; badge?: boolean }) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      style={{
        width: 31,
        height: 31,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: c.onForestLine,
        backgroundColor: 'rgba(255,255,255,0.10)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={icon} size={16} color={c.onForest} />
      {badge ? (
        <View
          style={{
            position: 'absolute',
            top: 3,
            right: 4,
            width: 7,
            height: 7,
            borderRadius: 4,
            backgroundColor: c.siren,
            borderWidth: 1.5,
            borderColor: c.forest,
          }}
        />
      ) : null}
    </Pressable>
  );
}

function Avatar({ name, onPress }: { name: string; onPress: () => void }) {
  const { c } = useTheme();
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      hitSlop={8}
      style={{
        width: 31,
        height: 31,
        borderRadius: radius.pill,
        backgroundColor: c.accent,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontFamily: font.semibold, fontSize: 11, color: '#FFFFFF' }}>{initials}</Text>
    </Pressable>
  );
}

function PlanChip({ free, consultsLeft }: { free: boolean; consultsLeft: number }) {
  const { c } = useTheme();
  const nav = useNavigation<Nav>();
  return (
    <Pressable
      onPress={() => nav.navigate('More')}
      hitSlop={6}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderWidth: 1,
        borderColor: c.onForestLine,
        borderRadius: radius.pill,
        paddingHorizontal: space.md - 2,
        paddingVertical: 6,
      }}
    >
      <Icon name="shield" size={12} color={c.leaf} strokeWidth={1.8} />
      <Text style={{ fontFamily: font.monoSemibold, fontSize: 9.5, color: c.onForest }}>
        {free ? 'FREE' : 'SHIELD'}
      </Text>
      {free ? null : (
        <Text style={{ fontFamily: font.medium, fontSize: 10, color: c.onForestDim }}>{`· ${consultsLeft}`}</Text>
      )}
    </Pressable>
  );
}

// ── emergency ─────────────────────────────────────────────────────────

/** One slow beacon loop, stopped when the OS asks for reduced motion. */
function usePulse() {
  const value = useRef(new Animated.Value(0)).current;
  const [allowed, setAllowed] = useState(true);

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (alive) setAllowed(!reduce);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (reduce) => setAllowed(!reduce));
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);

  useEffect(() => {
    if (!allowed) {
      value.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(value, {
          toValue: 1,
          duration: 950,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(value, { toValue: 0, duration: 220, easing: Easing.linear, useNativeDriver: true }),
        Animated.delay(320),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [allowed, value]);

  return { value, running: allowed };
}

/**
 * The emergency block: the only red on the screen, and the only thing that
 * moves. A beacon ring swells out from behind the siren and the dot on the
 * ALERT badge blinks, so the eye lands here first when someone is panicking.
 */
function EmergencyBlock({ mode }: { mode: Mode }) {
  const { c } = useTheme();
  const { t } = useLang();
  const nav = useNavigation<Nav>();
  const { plan, fraudCase } = useApp();
  const free = plan === 'FREE';
  const tight = mode === 'compact';

  const { value, running } = usePulse();

  const ringStyle = {
    opacity: value.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }),
    transform: [{ scale: value.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] }) }],
  };
  const dotStyle = running
    ? { opacity: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.15, 1] }) }
    : { opacity: 1 };

  const title = fraudCase ? t('case.reportTo1930') : t('emg.titleShort');
  const body = fraudCase ? t('case.zeroLiability') : free ? t('emg.sub.free') : t('emg.bodyShort');
  const cta = fraudCase ? t('case.call') : free ? t('emg.cta.free') : t('emg.cta.paid');

  return (
    <View
      style={{
        marginTop: -18,
        borderRadius: radius.xl - 2,
        overflow: 'hidden',
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.6)',
        shadowColor: c.sirenDeep,
        shadowOpacity: 0.38,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 9 },
        elevation: 10,
      }}
    >
      <Pressable
        onPress={() => nav.navigate('Emergency')}
        accessibilityRole="button"
        accessibilityLabel={`${t('emg.alertLabel')}. ${title}. ${cta}`}
        style={({ pressed }) => ({
          backgroundColor: c.siren,
          paddingHorizontal: space.md + 2,
          paddingTop: tight ? space.sm + 2 : space.md,
          paddingBottom: tight ? space.sm : space.md - 2,
          gap: tight ? 5 : space.sm - 1,
          opacity: pressed ? 0.93 : 1,
        })}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm + 2 }}>
          <View style={{ width: 34, height: 34, alignItems: 'center', justifyContent: 'center' }}>
            <Animated.View
              pointerEvents="none"
              style={[
                {
                  position: 'absolute',
                  width: 34,
                  height: 34,
                  borderRadius: radius.pill,
                  backgroundColor: '#FFFFFF',
                },
                ringStyle,
              ]}
            />
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: radius.pill,
                backgroundColor: 'rgba(255,255,255,0.25)',
                borderWidth: 1.5,
                borderColor: 'rgba(255,255,255,0.55)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="siren" size={17} color={c.onSiren} strokeWidth={1.9} />
            </View>
          </View>

          <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
            <View
              style={{
                alignSelf: 'flex-start',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                backgroundColor: '#FFFFFF',
                borderRadius: radius.pill,
                paddingLeft: 6,
                paddingRight: 8,
                paddingVertical: 2.5,
              }}
            >
              <Animated.View
                style={[{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.siren }, dotStyle]}
              />
              <Text style={{ fontFamily: font.bold, fontSize: 8.5, letterSpacing: 0.9, color: c.sirenDeep }}>
                {t('emg.alertLabel')}
              </Text>
            </View>
            <Text
              style={{
                fontFamily: font.bold,
                fontSize: tight ? 15 : 16.5,
                lineHeight: tight ? 19 : 21,
                letterSpacing: 0.3,
                color: c.onSiren,
              }}
              numberOfLines={1}
            >
              {title}
            </Text>
          </View>
        </View>

        <Text
          style={{ fontFamily: font.regular, fontSize: 11.5, lineHeight: 16, color: '#FFE0E3' }}
          numberOfLines={2}
        >
          {body}
        </Text>

        <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
          <View
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: radius.md - 1,
              paddingHorizontal: space.lg,
              paddingVertical: tight ? space.sm : space.sm + 3,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 7,
            }}
          >
            <Text style={{ fontFamily: font.bold, fontSize: 13.5, color: c.siren }}>{cta}</Text>
            <Icon name="arrowRight" size={14} color={c.siren} strokeWidth={2.2} />
          </View>
        </View>
      </Pressable>

      <View
        style={{
          backgroundColor: c.sirenDeep,
          paddingHorizontal: space.md + 2,
          paddingVertical: space.sm - 2,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 7,
        }}
      >
        <Icon name="shieldCheck" size={12} color="#FFFFFF" />
        <Text style={{ flex: 1, fontFamily: font.semibold, fontSize: 10, color: '#FFFFFF' }} numberOfLines={1}>
          {t('common.otpNotice')}
        </Text>
      </View>
    </View>
  );
}

// ── feature tiles ─────────────────────────────────────────────────────

function Tile({
  icon,
  title,
  desc,
  tint,
  bg,
  mode,
  onPress,
}: {
  icon: IconName;
  title: string;
  desc: string;
  tint: string;
  bg: string;
  mode: Mode;
  onPress: () => void;
}) {
  const { c } = useTheme();
  const tight = mode === 'compact';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${desc}`}
      style={({ pressed }) => ({
        flex: 1,
        minWidth: 0,
        backgroundColor: bg,
        borderRadius: radius.lg - 1,
        paddingHorizontal: space.md - 1,
        paddingVertical: tight ? 7 : 9,
        gap: tight ? 4 : 6,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View
          style={{
            width: tight ? 27 : 32,
            height: tight ? 27 : 32,
            borderRadius: radius.pill,
            backgroundColor: tint,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={icon} size={tight ? 15 : 17} color="#FFFFFF" strokeWidth={1.8} />
        </View>
        <Icon name="arrowRight" size={14} color={tint} strokeWidth={2} />
      </View>
      <View>
        <Text
          style={{ fontFamily: font.bold, fontSize: tight ? 12 : 13, lineHeight: tight ? 15 : 16, color: c.ink }}
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text style={{ fontFamily: font.regular, fontSize: 10, lineHeight: 13, color: c.ink2 }} numberOfLines={1}>
          {desc}
        </Text>
      </View>
    </Pressable>
  );
}

// ── active case ───────────────────────────────────────────────────────

function ActiveCaseCard({ mode }: { mode: Mode }) {
  const { c } = useTheme();
  const { t, lang } = useLang();
  const nav = useNavigation<Nav>();
  const { fraudCase } = useApp();
  if (!fraudCase) return null;

  const tight = mode === 'compact';
  const { done, total, nextKey } = caseProgress({
    bank: Boolean(fraudCase.bankAckNo),
    portal: Boolean(fraudCase.portalAckNo),
    evidence: fraudCase.evidence.length > 0,
    letter: fraudCase.letterSent,
  });
  const complete = done === total;

  return (
    <Pressable
      onPress={() => nav.navigate('FraudCase')}
      style={({ pressed }) => ({
        backgroundColor: c.card,
        borderWidth: 1,
        borderColor: c.line,
        borderRadius: radius.lg,
        paddingHorizontal: space.md + 1,
        paddingVertical: tight ? space.sm : space.md - 2,
        gap: tight ? 6 : space.sm + 1,
        opacity: pressed ? 0.92 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm + 2 }}>
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: radius.sm + 2,
            backgroundColor: c.sirenBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="folder" size={17} color={c.siren} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontFamily: font.bold, fontSize: 13, lineHeight: 17, color: c.ink }} numberOfLines={1}>
            {t('case.cyberFraud')}
          </Text>
          <Text style={{ fontFamily: font.mono, fontSize: 9, color: c.ink3 }} numberOfLines={1}>
            {`${rupees(fraudCase.amountPaise)} · ${fraudCase.channel[lang]}`}
          </Text>
        </View>
        <Text style={{ fontFamily: font.monoSemibold, fontSize: 11, color: complete ? c.leaf : c.brass }}>
          {`${done}/${total} ${t('case.doneCount')}`}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 3 }}>
        {Array.from({ length: total }, (_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 3,
              backgroundColor: i < done ? (complete ? c.leaf : c.accent) : c.trackFill,
            }}
          />
        ))}
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <Icon name={complete ? 'checkCircle' : 'clock'} size={13} color={complete ? c.leaf : c.brass} />
        <Text
          style={{ flex: 1, fontFamily: font.medium, fontSize: 11.5, color: complete ? c.leaf : c.brass }}
          numberOfLines={1}
        >
          {complete ? t('case.allDone') : t(nextKey)}
        </Text>
        <View
          style={{
            backgroundColor: c.forest,
            borderRadius: radius.sm + 2,
            paddingHorizontal: space.md,
            paddingVertical: 7,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
          }}
        >
          <Text style={{ fontFamily: font.semibold, fontSize: 11.5, color: '#FFFFFF' }}>{t('case.continue')}</Text>
          <Icon name="arrowRight" size={12} color="#FFFFFF" strokeWidth={2.2} />
        </View>
      </View>
    </Pressable>
  );
}


// ── legal protection ──────────────────────────────────────────────────

type Health = 'ok' | 'warn' | 'bad';

/**
 * A standing status line for the four things the app is quietly watching.
 *
 * Every value is read off real state — how many documents are in the vault,
 * when the next insurance and vehicle papers run out, how many consultations
 * are left. The tick only stays green while that is genuinely true; a date
 * inside two weeks turns amber and a lapsed one turns red, so the row is a
 * status report rather than four reassuring ticks.
 */
function LegalProtection({ mode }: { mode: Mode }) {
  const { c } = useTheme();
  const { t, lang } = useLang();
  const nav = useNavigation<Nav>();
  const { docs, consultsLeft, plan } = useApp();
  const { value: wave, running } = useWave();
  const tight = mode === 'compact';

  /** Soonest-expiring document in a category, if there is one. */
  const soonest = (category: string) =>
    docs
      .filter((d) => d.category === category && d.expiryDate)
      .sort((a, b) => daysUntil(a.expiryDate!) - daysUntil(b.expiryDate!))[0];

  const dateLine = (doc?: { expiryDate?: string }): { value: string; health: Health } => {
    if (!doc?.expiryDate) return { value: t('prot.notAdded'), health: 'warn' };
    const days = daysUntil(doc.expiryDate);
    if (days < 0) return { value: t('prot.expired'), health: 'bad' };
    return {
      value: lang === 'hi' ? `${days} दिन में` : `In ${days} days`,
      health: days <= 15 ? 'warn' : 'ok',
    };
  };

  const insurance = dateLine(soonest('insurance'));
  const vehicle = dateLine(soonest('vehicle'));

  const items: { label: string; value: string; health: Health }[] = [
    {
      label: t('prot.documents'),
      value: `${docs.length} ${t('prot.files')}`,
      health: docs.length > 0 ? 'ok' : 'warn',
    },
    { label: t('prot.insurance'), value: insurance.value, health: insurance.health },
    { label: t('prot.vehicle'), value: vehicle.value, health: vehicle.health },
    {
      label: t('prot.consultation'),
      value: plan === 'FREE' ? t('prot.none') : `${consultsLeft} ${t('prot.left')}`,
      health: plan === 'FREE' || consultsLeft === 0 ? 'warn' : 'ok',
    },
  ];

  const badge = tight ? 18 : 20;

  return (
    <Pressable
      onPress={() => nav.navigate('Services')}
      accessibilityRole="button"
      style={({ pressed }) => ({
        backgroundColor: c.card,
        borderWidth: 1,
        borderColor: c.line,
        borderRadius: radius.lg,
        paddingHorizontal: space.md,
        paddingVertical: tight ? 6 : 7,
        gap: tight ? 6 : 7,
        opacity: pressed ? 0.92 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Icon name="shieldCheck" size={13} color={c.accent} strokeWidth={1.8} />
        <Text
          style={{ flex: 1, fontFamily: font.bold, fontSize: 12.5, lineHeight: tight ? 14 : 15, color: c.ink }}
          numberOfLines={1}
        >
          {t('home.protection')}
        </Text>
        {!tight && (
          <Text style={{ fontFamily: font.medium, fontSize: 10, color: c.ink3 }} numberOfLines={1}>
            {t('home.protectionSub')}
          </Text>
        )}
        <Icon name="chevronRight" size={13} color={c.ink3} />
      </View>

      <View style={{ flexDirection: 'row', gap: space.xs }}>
        {items.map((item, i) => {
          const tint = item.health === 'bad' ? c.siren : item.health === 'warn' ? c.brass : c.accent;
          return (
            <View key={item.label} style={{ flex: 1, minWidth: 0, alignItems: 'center', gap: 2 }}>
              <ProtBadge
                driver={wave}
                running={running}
                index={i}
                size={badge}
                tint={tint}
                icon={item.health === 'ok' ? 'check' : item.health === 'warn' ? 'clock' : 'alert'}
                urgent={item.health !== 'ok'}
              />
              <Text
                style={{ fontFamily: font.semibold, fontSize: 9.5, lineHeight: tight ? 11 : 12, color: c.ink }}
                numberOfLines={1}
              >
                {item.label}
              </Text>
              <Text
                style={{ fontFamily: font.regular, fontSize: 8.5, lineHeight: tight ? 10 : 11, color: tint }}
                numberOfLines={1}
              >
                {item.value}
              </Text>
            </View>
          );
        })}
      </View>
    </Pressable>
  );
}

/**
 * One linear driver for the whole row: each badge reads its own slice of it, so
 * the four symbols fire in sequence off a single animation rather than four
 * competing ones. Stopped outright when the OS asks for reduced motion.
 */
function useWave() {
  const value = useRef(new Animated.Value(0)).current;
  const [allowed, setAllowed] = useState(true);

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (alive) setAllowed(!reduce);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (reduce) => setAllowed(!reduce));
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);

  useEffect(() => {
    if (!allowed) {
      value.setValue(0);
      return;
    }
    value.setValue(0);
    const loop = Animated.loop(
      Animated.timing(value, {
        toValue: 1,
        duration: CYCLE,
        easing: Easing.linear,
        // There is no native animated module on web; asking for it there only
        // logs a warning and falls back to the JS driver anyway.
        useNativeDriver: Platform.OS !== 'web',
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [allowed, value]);

  return { value, running: allowed };
}

/** One full pass of the wave, in milliseconds. */
const CYCLE = 2600;
/** How far apart the four badges fire, as a fraction of the cycle. */
const POP_STEP = 0.1;
/**
 * The halo is capped at 1.45× — a ~4.5px ring on a 20px badge, which stays
 * inside the 7px gap above it and the label's own leading below. The blink
 * does the work of being noticed; it costs no pixels at all, so nothing on
 * this row ever reaches into its neighbour.
 */
const RING_MAX = 1.45;

function ProtBadge(props: {
  driver: Animated.Value;
  running: boolean;
  index: number;
  size: number;
  tint: string;
  icon: IconName;
  urgent: boolean;
}) {
  const { driver, running, index, size, tint, icon, urgent } = props;

  /**
   * Each badge blinks twice — off hard, back, off softer, back — and swells as
   * it goes. One blink alone reads as a rendering glitch; two read as a signal.
   * The amber and red badges blink deeper and swell further than the blue ones,
   * so the row can be understood without being read.
   */
  const s = 0.02 + index * POP_STEP;
  const frames = [0, s, s + 0.04, s + 0.09, s + 0.13, s + 0.17, 1];
  const scale = driver.interpolate({
    inputRange: frames,
    outputRange: [1, 1, urgent ? 1.34 : 1.24, 1, urgent ? 1.18 : 1.12, 1, 1],
  });
  const opacity = driver.interpolate({
    inputRange: frames,
    outputRange: [1, 1, urgent ? 0.12 : 0.22, 1, urgent ? 0.3 : 0.42, 1, 1],
  });
  const ringOpacity = driver.interpolate({
    inputRange: [0, s, s + 0.005, s + 0.09, 1],
    outputRange: [0, 0, 0.5, 0, 0],
  });
  const ringScale = driver.interpolate({
    inputRange: [0, s, s + 0.09, 1],
    outputRange: [1, 1, RING_MAX, RING_MAX],
  });

  const glyph = (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: radius.pill,
        backgroundColor: tint,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={icon} size={size - 8} color="#FFFFFF" strokeWidth={2.3} />
    </View>
  );

  if (!running) return glyph;

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: size,
          height: size,
          borderRadius: radius.pill,
          backgroundColor: tint,
          opacity: ringOpacity,
          transform: [{ scale: ringScale }],
        }}
      />
      <Animated.View style={{ opacity, transform: [{ scale }] }}>{glyph}</Animated.View>
    </View>
  );
}
