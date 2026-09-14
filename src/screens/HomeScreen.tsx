import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, IconName } from '../components/Icon';
import { Logo, LogoBlur } from '../components/Logo';
import { ThemedStatusBar, useCountdown } from '../components/ui';
import { daysUntil, USER } from '../data/mock';
import { rupees, useLang } from '../i18n/LanguageProvider';
import { StringKey } from '../i18n/strings';
import { Nav } from '../navigation/types';
import { useApp } from '../state/AppState';
import { useTheme } from '../theme/ThemeProvider';
import { font, leading, radius, space } from '../theme/tokens';

/**
 * The home screen scrolls, so the layout no longer has to fight to fit and
 * the old measure-then-degrade machinery is gone with it.
 *
 * Mode is now only about density: a small phone still wants more on screen
 * per swipe, a tall one can breathe.
 */
const COMPACT_BELOW = 720;

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

  const { height: winH } = useWindowDimensions();
  const mode: Mode = winH < COMPACT_BELOW ? 'compact' : 'full';

  const free = plan === 'FREE';
  const firstName = lang === 'hi' ? USER.firstName.hi : profile.name.split(' ')[0];
  const hour = new Date().getHours();
  const greetingKey: StringKey =
    hour < 12 ? 'home.greeting.morning' : hour < 17 ? 'home.greeting.afternoon' : 'home.greeting.evening';

  /**
   * Vehicle Expiry and Evidence Locker both report real state, not a label.
   * The vehicle tile is the reason the PUC lapse is still visible anywhere on
   * this screen — it used to live in the protection row.
   */
  const vehicleDoc = docs
    .filter((d) => d.category === 'vehicle' && d.expiryDate)
    .sort((a, b) => daysUntil(a.expiryDate!) - daysUntil(b.expiryDate!))[0];
  const vehicleDays = vehicleDoc?.expiryDate ? daysUntil(vehicleDoc.expiryDate) : null;
  const vehicleLate = vehicleDays !== null && vehicleDays < 0;
  const vehicleDesc =
    vehicleDays === null
      ? t('f.vehicle.none')
      : vehicleLate
        ? t('f.vehicle.expired')
        : lang === 'hi'
          ? `${vehicleDays} दिन में`
          : `In ${vehicleDays} days`;

  const evidenceCount = fraudCase?.evidence.length ?? 0;
  const evidenceDesc =
    evidenceCount > 0 ? `${evidenceCount} ${t('f.evidence.items')}` : t('f.evidence.desc');

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
          paddingBottom: space.md + 4,
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
            <Text style={{ fontFamily: font.bold, fontSize: 20, lineHeight: leading(20), color: c.onForest }} numberOfLines={1}>
              {`${t(greetingKey)}, `}
              <Text style={{ color: c.onForestAccent }}>{`${firstName}!`}</Text>
            </Text>
            <Text
              style={{ fontFamily: font.regular, fontSize: 12, lineHeight: leading(12), color: c.onForestDim }}
              numberOfLines={1}
            >
              {t('home.centerTitle')}
            </Text>
          </View>
          <PlanChip free={free} consultsLeft={consultsLeft} />
        </View>
      </View>

      {/*
        ══ body ══
        It scrolls now. The tab bar is outside this, so it stays put.
      */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: space.lg,
          paddingTop: mode === 'compact' ? 8 : 10,
          paddingBottom: space.xl,
          gap: mode === 'compact' ? 9 : 11,
        }}
        showsVerticalScrollIndicator={false}
      >
        <EmergencyRow mode={mode} />

        {fraudCase ? (
          <View style={{ gap: mode === 'compact' ? 6 : space.sm }}>
            <SectionRow title={t('home.myActiveCase')} />
            <ActiveCaseCard mode={mode} />
          </View>
        ) : null}

        <View style={{ gap: mode === 'compact' ? 6 : space.sm }}>
          <SectionRow
            title={t('home.help')}
            action={t('home.quickAccess')}
            onAction={() => nav.navigate('Services')}
          />
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            <Tile
              icon="scan"
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
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            <Tile
              icon="car"
              tint={c.tileRust}
              bg={c.tileRustBg}
              title={t('f.vehicle')}
              desc={vehicleDesc}
              descTint={vehicleLate ? c.siren : undefined}
              mode={mode}
              onPress={() => nav.navigate('Vault')}
            />
            <Tile
              icon="evidence"
              tint={c.tileSlate}
              bg={c.tileSlateBg}
              title={t('f.evidence')}
              desc={evidenceDesc}
              mode={mode}
              onPress={() => nav.navigate(fraudCase ? 'FraudCase' : 'Cases')}
            />
          </View>
        </View>

        <UpcomingSection mode={mode} />
        <DigiLockerCard />
        <PromoCards mode={mode} />
      </ScrollView>
    </View>
  );
}

// ── shared pieces ─────────────────────────────────────────────────────

function SectionRow({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md }}>
      <Text style={{ fontFamily: font.bold, fontSize: 12.5, lineHeight: leading(12.5), color: c.ink }}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ fontFamily: font.semibold, fontSize: 11, color: c.accent }}>{action}</Text>
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
 * The emergency dial, and the reason it is a circle in the middle of the grid.
 *
 * Someone who has just lost money is not reading the screen top to bottom;
 * their thumb is already resting near the centre. A circle is the shape that
 * says "press me" without a label, it can be hit without aiming, and it is
 * the only round thing on a screen of rectangles — so it cannot be mistaken
 * for one more service.
 *
 * It is also the only red on the screen and the only thing that moves: the
 * dial pops, a beacon swells out from behind it, and the dot on the label
 * blinks. All of it stops when the phone asks for reduced motion (NFR-18).
 */
function EmergencyDial({ mode }: { mode: Mode }) {
  const { c } = useTheme();
  const { t } = useLang();
  const nav = useNavigation<Nav>();
  const { fraudCase } = useApp();
  const { value, running } = usePulse();

  const size = mode === 'compact' ? 118 : 134;

  const beacon = {
    opacity: value.interpolate({ inputRange: [0, 1], outputRange: [0.45, 0] }),
    transform: [{ scale: value.interpolate({ inputRange: [0, 1], outputRange: [1, 1.19] }) }],
  };
  const blink = running
    ? { opacity: value.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.15, 1] }) }
    : { opacity: 1 };
  /**
   * The pop is capped at 1.05 — about 3px of growth on each side, which fits
   * inside the box the beacon already reserves. Loud to the eye, invisible to
   * the layout, so it can never shove a tile.
   */
  const pop = running
    ? { transform: [{ scale: value.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 1.05, 1] }) }] }
    : {};

  const sub = fraudCase ? t('emg.dialCase') : t('emg.dialTap');
  const box = Math.round(size * 1.19);

  return (
    <View style={{ width: box, height: box, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            width: size,
            height: size,
            borderRadius: radius.pill,
            backgroundColor: c.siren,
          },
          beacon,
        ]}
      />
      <Animated.View style={pop}>
        <Pressable
          onPress={() => nav.navigate('Emergency')}
          accessibilityRole="button"
          accessibilityLabel={[t('emg.dial'), t('emg.titleShort'), sub].join('. ')}
          style={({ pressed }) => ({
            width: size,
            height: size,
            borderRadius: radius.pill,
            backgroundColor: c.siren,
            borderWidth: 4,
            borderColor: '#FFFFFF',
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            shadowColor: c.sirenDeep,
            shadowOpacity: 0.45,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
            elevation: 12,
            opacity: pressed ? 0.92 : 1,
          })}
        >
          {/*
            Two marks, not one. This white one is clipped inside the red so
            the button itself has some depth; the navy one on the paper
            behind the dial carries the band around it. Both are faint enough
            that the siren and the word EMERGENCY still read first.
          */}
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LogoBlur size={Math.round(size * 1.12)} color="#FFFFFF" />
          </View>

          <Icon name="siren" size={mode === 'compact' ? 24 : 28} color={c.onSiren} strokeWidth={1.8} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Animated.View
              style={[{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#FFFFFF' }, blink]}
            />
            <Text
              style={{
                fontFamily: font.bold,
                fontSize: mode === 'compact' ? 11 : 12,
                letterSpacing: 0.6,
                color: c.onSiren,
              }}
              numberOfLines={1}
            >
              {t('emg.dial')}
            </Text>
          </View>
          <Text
            style={{ fontFamily: font.regular, fontSize: 8.5, lineHeight: leading(8.5), color: '#FFE0E3' }}
            numberOfLines={1}
          >
            {sub}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

/**
 * Welded under the dial, because the moment someone reaches for it is the
 * moment they are most likely to be talked into reading an OTP out loud
 * (FR-CMP-04).
 */
function OtpNotice() {
  const { c } = useTheme();
  const { t } = useLang();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: c.sirenBg,
        borderRadius: radius.pill,
        paddingHorizontal: space.md,
        paddingVertical: 4,
      }}
    >
      <Icon name="shieldCheck" size={11} color={c.sirenDeep} strokeWidth={1.9} />
      <Text style={{ fontFamily: font.semibold, fontSize: 9.5, color: c.sirenDeep }} numberOfLines={1}>
        {t('common.otpNotice')}
      </Text>
    </View>
  );
}

// ── feature tiles ─────────────────────────────────────────────────────

function Tile({
  icon,
  title,
  desc,
  descTint,
  tint,
  bg,
  mode,
  onPress,
}: {
  icon: IconName;
  title: string;
  desc: string;
  descTint?: string;
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
        paddingVertical: tight ? 6 : 7,
        gap: tight ? 3 : 5,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View
          style={{
            width: tight ? 25 : 29,
            height: tight ? 25 : 29,
            borderRadius: radius.pill,
            backgroundColor: tint,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={icon} size={tight ? 14 : 16} color="#FFFFFF" strokeWidth={1.8} />
        </View>
        <Icon name="arrowRight" size={14} color={tint} strokeWidth={2} />
      </View>
      <View>
        <Text
          style={{
            fontFamily: font.bold,
            fontSize: tight ? 11.5 : 12.5,
            lineHeight: tight ? leading(11.5) : leading(12.5),
            color: c.ink,
          }}
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text
          style={{ fontFamily: font.regular, fontSize: 9.5, lineHeight: leading(9.5), color: descTint ?? c.ink2 }}
          numberOfLines={1}
        >
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
          <Text style={{ fontFamily: font.bold, fontSize: 13, lineHeight: leading(13), color: c.ink }} numberOfLines={1}>
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

// ── upcoming ──────────────────────────────────────────────────────────

const CATEGORY_ICON: Record<string, IconName> = {
  identity: 'user',
  property: 'doc',
  financial: 'bank',
  insurance: 'cover',
  family: 'users',
  vehicle: 'car',
  contracts: 'letter',
  business: 'globe',
};

/**
 * Every document in the vault that runs out inside the next three months,
 * soonest first. This is the only place on the screen that is ordered by time
 * rather than by importance, which is the point: a renewal date does not care
 * how important the paper is.
 */
function UpcomingSection({ mode }: { mode: Mode }) {
  const { c } = useTheme();
  const { t, lang } = useLang();
  const nav = useNavigation<Nav>();
  const { docs } = useApp();
  const tight = mode === 'compact';

  const soon = docs
    .filter((d) => d.expiryDate && daysUntil(d.expiryDate) <= 90)
    .sort((a, b) => daysUntil(a.expiryDate!) - daysUntil(b.expiryDate!))
    .slice(0, 3);

  return (
    <View style={{ gap: tight ? 6 : space.sm }}>
      <SectionRow title={t('home.upcoming')} action={t('common.viewAll')} onAction={() => nav.navigate('Vault')} />
      <View
        style={{
          backgroundColor: c.card,
          borderWidth: 1,
          borderColor: c.line,
          borderRadius: radius.lg,
          paddingHorizontal: space.md,
        }}
      >
        {soon.length === 0 ? (
          <Text
            style={{
              fontFamily: font.regular,
              fontSize: 11.5,
              lineHeight: leading(11.5),
              color: c.ink3,
              paddingVertical: space.md,
            }}
          >
            {t('up.none')}
          </Text>
        ) : (
          soon.map((doc, i) => {
            const days = daysUntil(doc.expiryDate!);
            const late = days < 0;
            const tint = late ? c.siren : days <= 30 ? c.brass : c.ink2;
            const chipBg = late ? c.sirenBg : days <= 30 ? c.brassBg : c.card2;
            const chip = late
              ? t('up.expired')
              : `${days} ${days === 1 ? t('up.dayLeft') : t('up.daysLeft')}`;
            return (
              <Pressable
                key={doc.id}
                onPress={() => nav.navigate('Document', { id: doc.id })}
                accessibilityRole="button"
                accessibilityLabel={`${lang === 'hi' ? doc.title.hi : doc.title.en}. ${chip}`}
                style={({ pressed }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: space.sm + 2,
                  paddingVertical: tight ? 8 : 10,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: c.line2,
                  opacity: pressed ? 0.75 : 1,
                })}
              >
                <View
                  style={{
                    width: tight ? 28 : 31,
                    height: tight ? 28 : 31,
                    borderRadius: radius.sm + 2,
                    backgroundColor: chipBg,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon
                    name={CATEGORY_ICON[doc.category] ?? 'doc'}
                    size={tight ? 15 : 16}
                    color={tint}
                    strokeWidth={1.7}
                  />
                </View>
                <Text
                  style={{
                    flex: 1,
                    minWidth: 0,
                    fontFamily: font.semibold,
                    fontSize: tight ? 12 : 12.5,
                    lineHeight: tight ? leading(12) : leading(12.5),
                    color: c.ink,
                  }}
                  numberOfLines={1}
                >
                  {lang === 'hi' ? doc.title.hi : doc.title.en}
                </Text>
                <View
                  style={{
                    backgroundColor: chipBg,
                    borderRadius: radius.pill,
                    paddingHorizontal: space.sm + 1,
                    paddingVertical: 3,
                  }}
                >
                  <Text style={{ fontFamily: font.semibold, fontSize: 9.5, color: tint }} numberOfLines={1}>
                    {chip}
                  </Text>
                </View>
                <Icon name="chevronRight" size={13} color={c.ink3} />
              </Pressable>
            );
          })
        )}
      </View>
    </View>
  );
}

// ── digilocker ────────────────────────────────────────────────────────

/**
 * DigiLocker import. NOT in Product Scope v1 — it needs a change request
 * before it is built for real, so this is wired to the vault rather than
 * pretending to hold a government session it does not have.
 */
function DigiLockerCard() {
  const { c } = useTheme();
  const { t } = useLang();
  const nav = useNavigation<Nav>();
  return (
    <Pressable
      onPress={() => nav.navigate('Vault')}
      accessibilityRole="button"
      accessibilityLabel={`${t('dl.title')}. ${t('dl.sub')}`}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md - 1,
        backgroundColor: c.accentBg,
        borderWidth: 1,
        borderColor: c.line,
        borderRadius: radius.lg,
        paddingHorizontal: space.md,
        paddingVertical: space.md - 2,
        opacity: pressed ? 0.9 : 1,
      })}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: radius.sm + 2,
          backgroundColor: c.card,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name="folder" size={18} color={c.accent} strokeWidth={1.7} />
      </View>
      <View style={{ flex: 1, minWidth: 0, gap: 1 }}>
        <Text style={{ fontFamily: font.bold, fontSize: 13, lineHeight: leading(13), color: c.ink }} numberOfLines={1}>
          {t('dl.title')}
        </Text>
        <Text style={{ fontFamily: font.regular, fontSize: 10.5, lineHeight: leading(10.5), color: c.ink2 }} numberOfLines={2}>
          {t('dl.sub')}
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          backgroundColor: c.accent,
          borderRadius: radius.md - 2,
          paddingHorizontal: space.md,
          paddingVertical: 8,
        }}
      >
        <Text style={{ fontFamily: font.bold, fontSize: 12, color: '#FFFFFF' }}>{t('dl.cta')}</Text>
        <Icon name="arrowRight" size={12} color="#FFFFFF" strokeWidth={2.2} />
      </View>
    </Pressable>
  );
}

// ── the two closing offers ────────────────────────────────────────────

/**
 * Both of these end at the advocate, and deliberately so: drafting a will or
 * a legal notice is advocate work, and the compliance rules are explicit that
 * the assistant gives information rather than advice (FR-AIA-02/03). Document
 * drafting itself is not in Scope v1 either, so this is an entry point to a
 * consultation, not a drafting engine.
 */
function PromoCards({ mode }: { mode: Mode }) {
  const { c } = useTheme();
  const { t } = useLang();
  const nav = useNavigation<Nav>();
  const tight = mode === 'compact';

  const card = {
    flex: 1,
    minWidth: 0,
    borderRadius: radius.lg,
    paddingHorizontal: space.md,
    paddingVertical: tight ? space.md - 2 : space.md,
    gap: tight ? 6 : space.sm,
  } as const;

  return (
    <View style={{ flexDirection: 'row', gap: space.sm }}>
      <Pressable
        onPress={() => nav.navigate('Consult')}
        accessibilityRole="button"
        accessibilityLabel={`${t('promo.draft.title')} ${t('promo.draft.sub')} ${t('promo.draft.cta')}`}
        style={({ pressed }) => ({ ...card, backgroundColor: c.forest, opacity: pressed ? 0.92 : 1 })}
      >
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: radius.sm,
            backgroundColor: 'rgba(255,255,255,0.16)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="letter" size={16} color={c.onForest} strokeWidth={1.7} />
        </View>
        <View style={{ gap: 2 }}>
          <Text
            style={{
              fontFamily: font.bold,
              fontSize: tight ? 12.5 : 13.5,
              lineHeight: tight ? leading(12.5) : leading(13.5),
              color: c.onForest,
            }}
          >
            {t('promo.draft.title')}
          </Text>
          <Text style={{ fontFamily: font.regular, fontSize: 10, lineHeight: leading(10), color: c.onForestDim }}>
            {t('promo.draft.sub')}
          </Text>
        </View>
        <View
          style={{
            alignSelf: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            backgroundColor: c.onForest,
            borderRadius: radius.pill,
            paddingHorizontal: space.md - 1,
            paddingVertical: 6,
          }}
        >
          <Text style={{ fontFamily: font.bold, fontSize: 11, color: c.forest }}>{t('promo.draft.cta')}</Text>
          <Icon name="arrowRight" size={11} color={c.forest} strokeWidth={2.2} />
        </View>
      </Pressable>

      <Pressable
        onPress={() => nav.navigate('Consult')}
        accessibilityRole="button"
        accessibilityLabel={`${t('promo.advice.title')} ${t('promo.advice.sub')} ${t('promo.advice.cta')}`}
        style={({ pressed }) => ({ ...card, backgroundColor: c.brassBg, opacity: pressed ? 0.92 : 1 })}
      >
        <View
          style={{
            width: 30,
            height: 30,
            borderRadius: radius.sm,
            backgroundColor: c.card,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="scales" size={16} color={c.brass} strokeWidth={1.7} />
        </View>
        <View style={{ gap: 2 }}>
          <Text
            style={{
              fontFamily: font.bold,
              fontSize: tight ? 12.5 : 13.5,
              lineHeight: tight ? leading(12.5) : leading(13.5),
              color: c.ink,
            }}
          >
            {t('promo.advice.title')}
          </Text>
          <Text style={{ fontFamily: font.regular, fontSize: 10, lineHeight: leading(10), color: c.ink2 }}>
            {t('promo.advice.sub')}
          </Text>
        </View>
        <View
          style={{
            alignSelf: 'flex-start',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 5,
            backgroundColor: c.brass,
            borderRadius: radius.pill,
            paddingHorizontal: space.md - 1,
            paddingVertical: 6,
          }}
        >
          <Text style={{ fontFamily: font.bold, fontSize: 11, color: '#FFFFFF' }}>{t('promo.advice.cta')}</Text>
          <Icon name="arrowRight" size={11} color="#FFFFFF" strokeWidth={2.2} />
        </View>
      </Pressable>
    </View>
  );
}

// ── the two actions either side of the dial ───────────────────────────

/** A date the countdown will always read as expired, for the no-case state. */
const NO_WINDOW = new Date(0).toISOString();

/**
 * The dial answers "I do not know what to do". These two answer "I know
 * exactly what to do" — and they are the two reports that actually decide
 * whether the money comes back: the bank, and 1930 (FR-EMG-01/04/05). Until
 * now both were three taps away.
 *
 * They are deliberately not filled red. The dial has to stay the only
 * saturated red on the screen, because that is what makes it findable when
 * someone is panicking; these sit in the pale tint of the same family so they
 * read as part of the emergency path without competing with it.
 */
function EmergencyFlank({
  icon,
  title,
  sub,
  subTint,
  onPress,
  mode,
}: {
  icon: IconName;
  title: string;
  sub: string;
  subTint?: string;
  onPress: () => void;
  mode: Mode;
}) {
  const { c } = useTheme();
  const tight = mode === 'compact';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${sub}`}
      style={({ pressed }) => ({
        flex: 1,
        minWidth: 0,
        alignItems: 'center',
        gap: tight ? 3 : 4,
        backgroundColor: c.peach,
        borderWidth: 1,
        borderColor: c.sirenLine,
        borderRadius: radius.lg,
        paddingHorizontal: 4,
        paddingVertical: tight ? 8 : 10,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Icon name={icon} size={tight ? 16 : 17} color={c.sirenDeep} strokeWidth={1.8} />
      <Text
        style={{
          fontFamily: font.bold,
          fontSize: tight ? 10 : 10.5,
          lineHeight: tight ? leading(10) : leading(10.5),
          color: c.sirenDeep,
          textAlign: 'center',
        }}
        numberOfLines={2}
      >
        {title}
      </Text>
      <Text
        style={{
          fontFamily: font.regular,
          fontSize: 8,
          lineHeight: leading(8),
          color: subTint ?? c.ink2,
          textAlign: 'center',
        }}
        numberOfLines={2}
      >
        {sub}
      </Text>
    </Pressable>
  );
}

/**
 * The whole emergency row: 1930 on the left, the dial in the middle, the bank
 * on the right, with the mark washed across the paper behind all three.
 *
 * The dial keeps its own reserved square, so the beacon ring expands inside
 * that square and never reaches either button.
 */
function EmergencyRow({ mode }: { mode: Mode }) {
  const { c } = useTheme();
  const { t } = useLang();
  const nav = useNavigation<Nav>();
  const { fraudCase } = useApp();
  const left = useCountdown(fraudCase?.windowExpiresAt ?? NO_WINDOW);

  const bankDone = Boolean(fraudCase?.bankReportedAt);
  const windowSub = left.expired
    ? t('emg.flank.windowGone')
    : left.d > 0
      ? `${left.d}d ${left.h}h ${t('emg.flank.left')}`
      : `${left.h}h ${left.m}m ${t('emg.flank.left')}`;

  const tight = mode === 'compact';

  return (
    <View
      style={{
        backgroundColor: c.cardWarm,
        borderWidth: 1,
        borderColor: c.line,
        borderRadius: radius.xl,
        overflow: 'hidden',
        paddingHorizontal: 10,
        paddingVertical: tight ? 10 : 12,
        alignItems: 'center',
        justifyContent: 'center',
        gap: tight ? 7 : 8,
      }}
    >
      {/*
        The mark is bigger than the card on purpose. The card clips it, so it
        bleeds off every edge the way a watermark on letterhead does, and the
        outline flanks let it read straight through them. overflow hidden is
        what keeps it inside the rounded corners.
      */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <LogoBlur
          size={tight ? 300 : 340}
          color={c.forest}
          layers={6}
          spread={0.05}
          step={0.035}
        />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <EmergencyFlank
          icon="phone"
          title={t('emg.flank.1930')}
          sub={fraudCase ? windowSub : t('emg.flank.1930sub')}
          subTint={fraudCase ? c.sirenDeep : undefined}
          onPress={() => nav.navigate('Emergency')}
          mode={mode}
        />
        <EmergencyDial mode={mode} />
        <EmergencyFlank
          icon="bank"
          title={t('emg.flank.bank')}
          sub={
            !fraudCase
              ? t('emg.flank.bankSub')
              : bankDone
                ? t('emg.flank.bankDone')
                : t('emg.flank.bankPending')
          }
          subTint={fraudCase && !bankDone ? c.sirenDeep : fraudCase ? c.leaf : undefined}
          onPress={() => nav.navigate(fraudCase ? 'FraudCase' : 'Emergency')}
          mode={mode}
        />
      </View>

      <OtpNotice />
    </View>
  );
}
