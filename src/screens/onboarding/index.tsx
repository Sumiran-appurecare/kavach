import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon } from '../../components/Icon';
import { Logo } from '../../components/Logo';
import {
  Body,
  Card,
  Field,
  GhostButton,
  Mono,
  PrimaryButton,
  Screen,
  SectionLabel,
  Segmented,
  Title,
} from '../../components/ui';
import { USER } from '../../data/mock';
import { useLang } from '../../i18n/LanguageProvider';
import { StringKey } from '../../i18n/strings';
import { useApp } from '../../state/AppState';
import { useTheme } from '../../theme/ThemeProvider';
import { font, leading, radius, space } from '../../theme/tokens';

export type OnboardParamList = {
  Carousel: undefined;
  Phone: undefined;
  Otp: { phone: string };
  Profile: undefined;
  Passphrase: undefined;
  Kit: undefined;
  Plan: undefined;
};

type OnboardNav = NativeStackNavigationProp<OnboardParamList>;

// ── shared step frame ─────────────────────────────────────────────────

function Step({
  step,
  total = 5,
  title,
  body,
  children,
  footer,
  onBack,
}: {
  step: number;
  total?: number;
  title: string;
  body?: string;
  children?: React.ReactNode;
  footer: React.ReactNode;
  onBack?: () => void;
}) {
  const { c } = useTheme();
  return (
    <Screen>
      <View style={{ flex: 1, paddingHorizontal: space.lg, gap: space.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingTop: space.sm }}>
          {onBack ? (
            <Pressable onPress={onBack} hitSlop={10} accessibilityRole="button">
              <Icon name="chevronLeft" size={20} color={c.ink2} />
            </Pressable>
          ) : null}
          <View style={{ flex: 1, flexDirection: 'row', gap: 5 }}>
            {Array.from({ length: total }, (_, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  height: 3,
                  borderRadius: 2,
                  backgroundColor: i < step ? c.forest : c.line,
                }}
              />
            ))}
          </View>
          <Mono size={10}>{`${step}/${total}`}</Mono>
        </View>

        <View style={{ gap: space.sm, paddingTop: space.sm }}>
          <Title>{title}</Title>
          {body ? <Body size={14}>{body}</Body> : null}
        </View>

        <View style={{ flex: 1, gap: space.md }}>{children}</View>
        <View style={{ gap: space.sm, paddingBottom: space.lg }}>{footer}</View>
      </View>
    </Screen>
  );
}

// ── 1. value carousel ─────────────────────────────────────────────────

const SLIDES: { title: StringKey; body: StringKey; icon: Parameters<typeof Icon>[0]['name'] }[] = [
  { title: 'ob.slide1.title', body: 'ob.slide1.body', icon: 'lock' },
  { title: 'ob.slide2.title', body: 'ob.slide2.body', icon: 'shieldCheck' },
  { title: 'ob.slide3.title', body: 'ob.slide3.body', icon: 'phone' },
];

export function CarouselScreen() {
  const { c } = useTheme();
  const { t, lang, setLang } = useLang();
  const nav = useNavigation<OnboardNav>();
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const last = index === SLIDES.length - 1;

  return (
    <Screen>
      <View style={{ flex: 1, paddingHorizontal: space.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, paddingTop: space.sm }}>
          <Logo size={38} shield={c.forest} scales={c.paper} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: font.display, fontSize: 19, color: c.ink }}>{t('app.name')}</Text>
            <Text style={{ fontFamily: font.regular, fontSize: 10.5, color: c.ink3 }}>{t('app.tagline')}</Text>
          </View>
          <Segmented
            options={[
              { value: 'en', label: 'EN' },
              { value: 'hi', label: 'हिं' },
            ]}
            value={lang}
            onChange={(next) => setLang(next as 'en' | 'hi')}
            style={{ width: 108 }}
          />
        </View>

        <View style={{ flex: 1, justifyContent: 'center', gap: space.lg }}>
          <View
            style={{
              width: 62,
              height: 62,
              borderRadius: radius.xl,
              backgroundColor: c.leafBg,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name={slide.icon} size={30} color={c.leaf} />
          </View>
          <Text style={{ fontFamily: font.display, fontSize: 32, lineHeight: leading(32), color: c.ink }}>
            {t(slide.title)}
          </Text>
          <Body size={15}>{t(slide.body)}</Body>
        </View>

        <View style={{ gap: space.md, paddingBottom: space.lg }}>
          <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }}>
            {SLIDES.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === index ? 18 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: i === index ? c.forest : c.line,
                }}
              />
            ))}
          </View>
          <PrimaryButton
            label={last ? t('ob.getStarted') : t('common.continue')}
            onPress={() => (last ? nav.navigate('Phone') : setIndex(index + 1))}
          />
          {last ? null : (
            <GhostButton label={t('common.skip')} onPress={() => nav.navigate('Phone')} />
          )}
        </View>
      </View>
    </Screen>
  );
}

// ── 2. phone ──────────────────────────────────────────────────────────

export function PhoneScreen() {
  const { c } = useTheme();
  const { t } = useLang();
  const nav = useNavigation<OnboardNav>();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | undefined>();

  const valid = /^[6-9]\d{9}$/.test(phone);

  return (
    <Step
      step={1}
      title={t('ob.phone.title')}
      body={t('ob.phone.body')}
      onBack={() => nav.goBack()}
      footer={
        <PrimaryButton
          label={t('ob.phone.send')}
          disabled={!phone}
          onPress={() => {
            if (!valid) {
              setError(t('ob.phone.invalid'));
              return;
            }
            setError(undefined);
            nav.navigate('Otp', { phone });
          }}
        />
      }
    >
      <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'flex-end' }}>
        <View
          style={{
            borderWidth: 1,
            borderColor: c.line,
            borderRadius: radius.md,
            backgroundColor: c.card,
            paddingHorizontal: space.md,
            paddingVertical: 14,
          }}
        >
          <Text style={{ fontFamily: font.monoMedium, fontSize: 15, color: c.ink2 }}>+91</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Field
            label={t('ob.phone.label')}
            value={phone}
            onChangeText={(text) => setPhone(text.replace(/\D/g, '').slice(0, 10))}
            keyboardType="phone-pad"
            maxLength={10}
            mono
            autoFocus
            error={error}
          />
        </View>
      </View>
    </Step>
  );
}

// ── 3. OTP ────────────────────────────────────────────────────────────

export function OtpScreen() {
  const { c } = useTheme();
  const { t } = useLang();
  const nav = useNavigation<OnboardNav>();
  const route = useRoute<RouteProp<OnboardParamList, 'Otp'>>();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | undefined>();

  return (
    <Step
      step={1}
      title={t('ob.otp.title')}
      body={`${t('ob.otp.sentTo')} +91 ${route.params.phone}`}
      onBack={() => nav.goBack()}
      footer={
        <>
          <PrimaryButton
            label={t('ob.otp.verify')}
            disabled={code.length < 6}
            onPress={() => {
              if (code.length !== 6) {
                setError(t('ob.otp.wrong'));
                return;
              }
              nav.navigate('Profile');
            }}
          />
          <GhostButton label={t('ob.otp.resend')} onPress={() => setCode('')} />
        </>
      }
    >
      <Field
        value={code}
        onChangeText={(text) => setCode(text.replace(/\D/g, '').slice(0, 6))}
        keyboardType="number-pad"
        maxLength={6}
        mono
        autoFocus
        placeholder="••••••"
        error={error}
        hint={t('ob.otp.demoHint')}
      />
      {/* The app reads the code from the SMS itself on Android; it never asks a
          person to pass one on, and no screen ever requests an existing OTP. */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <Icon name="shieldCheck" size={14} color={c.leaf} />
        <Text style={{ flex: 1, fontFamily: font.medium, fontSize: 11.5, lineHeight: leading(11.5), color: c.ink3 }}>
          {t('common.otpNotice')}
        </Text>
      </View>
    </Step>
  );
}

// ── 4. profile ────────────────────────────────────────────────────────

export function ProfileScreen() {
  const { t, lang, setLang } = useLang();
  const nav = useNavigation<OnboardNav>();
  const { setProfile } = useApp();
  const [name, setName] = useState('');
  const [city, setCity] = useState('');

  return (
    <Step
      step={2}
      title={t('ob.profile.title')}
      body={t('ob.profile.body')}
      onBack={() => nav.goBack()}
      footer={
        <PrimaryButton
          label={t('common.continue')}
          disabled={!name.trim() || !city.trim()}
          onPress={() => {
            setProfile({
              name: name.trim(),
              city: { en: city.trim(), hi: city.trim() },
              state: USER.state,
            });
            nav.navigate('Passphrase');
          }}
        />
      }
    >
      <Field label={t('ob.profile.name')} value={name} onChangeText={setName} autoFocus />
      <Field label={t('ob.profile.city')} value={city} onChangeText={setCity} placeholder="Indore" />
      <View style={{ gap: 6 }}>
        <SectionLabel>{t('ob.profile.langLabel')}</SectionLabel>
        <Segmented
          options={[
            { value: 'en', label: 'English' },
            { value: 'hi', label: 'हिंदी' },
          ]}
          value={lang}
          onChange={(next) => setLang(next as 'en' | 'hi')}
        />
      </View>
    </Step>
  );
}

// ── 5. passphrase ─────────────────────────────────────────────────────

export function PassphraseScreen() {
  const { c } = useTheme();
  const { t } = useLang();
  const nav = useNavigation<OnboardNav>();
  const [pass, setPass] = useState('');

  const score = useMemo(() => {
    let n = 0;
    if (pass.length >= 10) n++;
    if (pass.length >= 16) n++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) n++;
    if (/\d/.test(pass)) n++;
    if (/[^A-Za-z0-9]/.test(pass)) n++;
    return n;
  }, [pass]);

  const label: StringKey =
    score >= 4 ? 'ob.pass.strength.strong' : score >= 3 ? 'ob.pass.strength.fair' : 'ob.pass.strength.weak';
  const colour = score >= 4 ? c.leaf : score >= 3 ? c.brass : c.siren;

  return (
    <Step
      step={3}
      title={t('ob.pass.title')}
      body={t('ob.pass.body')}
      onBack={() => nav.goBack()}
      footer={
        <>
          <PrimaryButton
            label={t('common.continue')}
            disabled={pass.length < 10}
            onPress={() => nav.navigate('Kit')}
          />
          {/* FR-AUTH-06: no skip control exists on this screen. */}
          <Text
            style={{
              textAlign: 'center',
              fontFamily: font.medium,
              fontSize: 11.5,
              color: c.ink3,
            }}
          >
            {t('ob.pass.cannotSkip')}
          </Text>
        </>
      }
    >
      <Field
        label={t('ob.pass.label')}
        value={pass}
        onChangeText={setPass}
        secure
        autoFocus
        hint={t('ob.pass.hint')}
      />
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                backgroundColor: i < score ? colour : c.line,
              }}
            />
          ))}
        </View>
        {pass.length > 0 ? (
          <Text style={{ fontFamily: font.semibold, fontSize: 11.5, color: colour }}>{t(label)}</Text>
        ) : null}
      </View>

      {/* The uncomfortable consequence, stated at the moment it is created. */}
      <Card
        style={{
          flexDirection: 'row',
          gap: space.sm + 2,
          borderColor: c.brass,
          backgroundColor: c.brassBg,
        }}
      >
        <Icon name="alert" size={16} color={c.brass} />
        <Text style={{ flex: 1, fontFamily: font.medium, fontSize: 13, lineHeight: 19, color: c.ink }}>
          {t('ob.pass.warning')}
        </Text>
      </Card>
    </Step>
  );
}

// ── 6. recovery kit ───────────────────────────────────────────────────

const WORDLIST = [
  'anchor', 'basil', 'candle', 'dune', 'ember', 'fable', 'garnet', 'harbour',
  'indigo', 'jasmine', 'kite', 'lantern', 'marble', 'nectar', 'orchid', 'pepper',
  'quartz', 'ribbon', 'saffron', 'tamarind', 'umber', 'valley', 'willow', 'yarrow',
  'almond', 'bronze', 'cedar', 'dahlia', 'elm', 'fennel', 'ginger', 'hazel',
  'ivory', 'juniper', 'kalash', 'lotus', 'mango', 'neem', 'olive', 'papaya',
  'quince', 'rosewood', 'sandal', 'teak', 'urchin', 'vetiver', 'walnut', 'zinnia',
];

export function KitScreen() {
  const { c } = useTheme();
  const { t } = useLang();
  const nav = useNavigation<OnboardNav>();
  const [phase, setPhase] = useState<'show' | 'confirm'>('show');
  const [answers, setAnswers] = useState(['', '', '']);
  const [error, setError] = useState<string | undefined>();

  const words = useMemo(() => {
    const pool = [...WORDLIST];
    const out: string[] = [];
    for (let i = 0; i < 24; i++) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    return out;
  }, []);

  const asked = useMemo(() => {
    const picks = new Set<number>();
    while (picks.size < 3) picks.add(Math.floor(Math.random() * 24));
    return [...picks].sort((a, b) => a - b);
  }, []);

  if (phase === 'show') {
    return (
      <Step
        step={4}
        title={t('ob.kit.title')}
        body={t('ob.kit.body')}
        onBack={() => nav.goBack()}
        footer={<PrimaryButton label={t('ob.kit.saved')} icon="check" onPress={() => setPhase('confirm')} />}
      >
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: space.sm,
            backgroundColor: c.card,
            borderWidth: 1,
            borderColor: c.line,
            borderRadius: radius.lg,
            padding: space.md,
          }}
        >
          {words.map((word, i) => (
            <View
              key={`${word}-${i}`}
              style={{
                flexDirection: 'row',
                alignItems: 'baseline',
                gap: 5,
                width: '30%',
              }}
            >
              <Text style={{ fontFamily: font.mono, fontSize: 9.5, color: c.ink3 }}>{i + 1}</Text>
              <Text style={{ fontFamily: font.monoMedium, fontSize: 12.5, color: c.ink }}>{word}</Text>
            </View>
          ))}
        </View>
      </Step>
    );
  }

  return (
    <Step
      step={4}
      title={t('ob.kit.confirmTitle')}
      body={t('ob.kit.confirmBody')}
      onBack={() => setPhase('show')}
      footer={
        <PrimaryButton
          label={t('common.continue')}
          disabled={answers.some((a) => !a.trim())}
          onPress={() => {
            const ok = asked.every((index, i) => answers[i].trim().toLowerCase() === words[index]);
            if (!ok) {
              setError(t('ob.kit.mismatch'));
              return;
            }
            nav.navigate('Plan');
          }}
        />
      }
    >
      {asked.map((index, i) => (
        <Field
          key={index}
          label={`${t('ob.kit.word')} ${index + 1}`}
          value={answers[i]}
          onChangeText={(text) =>
            setAnswers((prev) => prev.map((value, j) => (j === i ? text : value)))
          }
          mono
          autoFocus={i === 0}
          error={i === 2 ? error : undefined}
        />
      ))}
    </Step>
  );
}

// ── 7. plan ───────────────────────────────────────────────────────────

export function PlanScreen() {
  const { c } = useTheme();
  const { t } = useLang();
  const { finishOnboarding, setPlan } = useApp();

  const included: StringKey[] = ['ob.plan.free1', 'ob.plan.free2', 'ob.plan.free3', 'ob.plan.free4'];

  return (
    <Step
      step={5}
      title={t('ob.plan.title')}
      body={t('ob.plan.body')}
      footer={
        <>
          <PrimaryButton
            label={t('ob.plan.enter')}
            icon="vault"
            onPress={() => {
              setPlan('FREE');
              finishOnboarding();
            }}
          />
          {/* No price and no purchase control: checkout lives on the web (FR-SUB-02). */}
          <Text style={{ textAlign: 'center', fontFamily: font.regular, fontSize: 11.5, lineHeight: leading(11.5), color: c.ink3 }}>
            {t('ob.plan.webNote')}
          </Text>
        </>
      }
    >
      <Card style={{ gap: space.md }}>
        <SectionLabel>{t('ob.plan.freeIncludes')}</SectionLabel>
        {included.map((key) => (
          <View key={key} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.sm + 2 }}>
            <Icon name="check" size={15} color={c.leaf} />
            <Text style={{ flex: 1, fontFamily: font.regular, fontSize: 13.5, lineHeight: 19, color: c.ink }}>
              {t(key)}
            </Text>
          </View>
        ))}
      </Card>
    </Step>
  );
}
