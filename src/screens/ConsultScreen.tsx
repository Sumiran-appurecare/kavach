import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Icon } from '../components/Icon';
import { SealMark } from '../components/Logo';
import {
  AppHeader,
  Body,
  Card,
  Chip,
  Field,
  GhostButton,
  Mono,
  PrimaryButton,
  Screen,
  SectionLabel,
} from '../components/ui';
import { ConsultCategory } from '../data/types';
import { useLang } from '../i18n/LanguageProvider';
import { StringKey } from '../i18n/strings';
import { Nav } from '../navigation/types';
import { useApp } from '../state/AppState';
import { useTheme } from '../theme/ThemeProvider';
import { font, radius, space } from '../theme/tokens';

const CATEGORIES: { value: ConsultCategory; label: StringKey }[] = [
  { value: 'property', label: 'con.cat.property' },
  { value: 'family', label: 'con.cat.family' },
  { value: 'consumer', label: 'con.cat.consumer' },
  { value: 'employment', label: 'con.cat.employment' },
  { value: 'cyber', label: 'con.cat.cyber' },
  { value: 'other', label: 'con.cat.other' },
];

/**
 * Consultation, end to end.
 *
 * The user never sees a list of advocates, never a rating, never a photo
 * (FR-CMP-01). Allocation is system-driven, the engagement note is blocking
 * (FR-CMP-06), and the advocate's identity appears only after they accept
 * (FR-CON-07).
 */
export function ConsultScreen() {
  const { t } = useLang();
  const nav = useNavigation<Nav>();
  const { consultation, endConsultation } = useApp();

  return (
    <Screen scroll>
      <AppHeader
        title={t('con.title')}
        onBack={() => {
          if (consultation?.stage === 'describe') endConsultation();
          nav.goBack();
        }}
      />
      {!consultation ? <Describe /> : consultation.stage === 'consent' ? <Consent /> : <Allocation />}
    </Screen>
  );
}

// ── 1. describe ───────────────────────────────────────────────────────

function Describe() {
  const { c } = useTheme();
  const { t } = useLang();
  const { plan, consultsLeft, startConsultation } = useApp();
  const [text, setText] = useState('');
  const [category, setCategory] = useState<ConsultCategory | null>(null);

  const free = plan === 'FREE';
  const exhausted = !free && consultsLeft === 0;

  // Standing in for the triage call that proposes a category (FR-CON-01).
  const suggested: ConsultCategory | null = (() => {
    const q = text.toLowerCase();
    if (/(rent|landlord|deposit|मकान|किराया)/.test(q)) return 'property';
    if (/(upi|fraud|debited|धोखा|पैसा)/.test(q)) return 'cyber';
    if (/(salary|notice period|employer|नौकरी|वेतन)/.test(q)) return 'employment';
    if (/(refund|seller|product|सामान|शिकायत)/.test(q)) return 'consumer';
    return null;
  })();

  const chosen = category ?? suggested;

  return (
    <View style={{ paddingHorizontal: space.lg, gap: space.md }}>
      <Steps current={0} />

      {free ? (
        <Card style={{ gap: space.sm, borderColor: c.brass }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
            <Icon name="scales" size={17} color={c.brass} />
            <Text style={{ fontFamily: font.semibold, fontSize: 14, color: c.ink }}>
              {t('con.entitlement.none')}
            </Text>
          </View>
          <Body size={12.5}>{t('con.entitlement.free')}</Body>
        </Card>
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
          <Chip
            label={exhausted ? t('con.entitlement.none') : `${consultsLeft} ${t('con.entitlement.left')}`}
            tone={exhausted ? 'brass' : 'leaf'}
          />
        </View>
      )}

      {exhausted ? <Body size={12.5}>{t('con.entitlement.paid')}</Body> : null}

      <Body size={13}>{t('con.describeBody')}</Body>
      <Field
        value={text}
        onChangeText={setText}
        placeholder={t('con.describePlaceholder')}
        multiline
      />

      <SectionLabel>{suggested && !category ? t('con.categorySuggested') : t('con.category')}</SectionLabel>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {CATEGORIES.map((cat) => {
          const active = chosen === cat.value;
          return (
            <Pressable
              key={cat.value}
              onPress={() => setCategory(cat.value)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={{
                paddingHorizontal: space.md,
                paddingVertical: space.sm + 2,
                borderRadius: radius.pill,
                borderWidth: 1,
                borderColor: active ? 'transparent' : c.line,
                backgroundColor: active ? c.forest : c.card,
              }}
            >
              <Text
                style={{
                  fontFamily: font.medium,
                  fontSize: 12.5,
                  color: active ? c.onForest : c.ink,
                }}
              >
                {t(cat.label)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <PrimaryButton
        label={t('common.continue')}
        disabled={free || !text.trim() || !chosen}
        onPress={() => chosen && startConsultation(text.trim(), chosen)}
      />
      <View style={{ height: space.lg }} />
    </View>
  );
}

// ── 2. the engagement note, which blocks everything ───────────────────

function Consent() {
  const { c } = useTheme();
  const { t } = useLang();
  const { acceptEngagement } = useApp();

  return (
    <View style={{ paddingHorizontal: space.lg, gap: space.md }}>
      <Steps current={1} />
      <Card style={{ gap: space.md }}>
        <Text style={{ fontFamily: font.display, fontSize: 20, lineHeight: 26, color: c.ink }}>
          {t('con.engagement.title')}
        </Text>
        {(['con.engagement.b1', 'con.engagement.b2', 'con.engagement.b3', 'con.engagement.b4'] as const).map(
          (key, i) => (
            <View key={key} style={{ flexDirection: 'row', gap: space.sm + 2 }}>
              <Text style={{ fontFamily: font.monoMedium, fontSize: 11, color: c.ink3, marginTop: 3 }}>
                {`0${i + 1}`}
              </Text>
              <Text style={{ flex: 1, fontFamily: font.regular, fontSize: 13.5, lineHeight: 20, color: c.ink }}>
                {t(key)}
              </Text>
            </View>
          ),
        )}
      </Card>
      <PrimaryButton label={t('con.engagement.accept')} icon="check" onPress={acceptEngagement} />
      <Body size={11} dim>
        {t('con.reassignNote')}
      </Body>
      <View style={{ height: space.lg }} />
    </View>
  );
}

// ── 3 & 4. allocation, then the advocate ──────────────────────────────

function Allocation() {
  const { c } = useTheme();
  const { t, lang } = useLang();
  const { consultation, allocateAdvocate, reassignAdvocate } = useApp();
  const allocating = consultation?.stage === 'allocating';

  // Stands in for the allocation worker: retainer first, then panel by quality
  // score, widening jurisdiction and then language (FR-CON-05).
  useEffect(() => {
    if (!allocating) return;
    const id = setTimeout(allocateAdvocate, 2600);
    return () => clearTimeout(id);
  }, [allocating, allocateAdvocate]);

  if (!consultation) return null;

  if (consultation.stage === 'allocating') {
    return (
      <View style={{ paddingHorizontal: space.lg, gap: space.md }}>
        <Steps current={2} />
        <Card style={{ gap: space.md, alignItems: 'center', paddingVertical: space.xxl }}>
          <ActivityIndicator color={c.forest} />
          <Text style={{ fontFamily: font.display, fontSize: 19, lineHeight: 25, color: c.ink, textAlign: 'center' }}>
            {t('con.allocating')}
          </Text>
          <Body size={12.5} style={{ textAlign: 'center' }}>
            {t('con.allocatingSub')}
          </Body>
        </Card>
      </View>
    );
  }

  const advocate = consultation.advocate!;

  return (
    <View style={{ paddingHorizontal: space.lg, gap: space.md }}>
      <Steps current={2} />

      <Card style={{ gap: space.md, overflow: 'hidden' }}>
        <View style={{ position: 'absolute', right: -18, top: -18, opacity: 0.05 }}>
          <SealMark size={110} color={c.ink} />
        </View>
        <Chip label={t('con.allocated')} tone="leaf" />
        <View>
          <Text style={{ fontFamily: font.display, fontSize: 22, lineHeight: 28, color: c.ink }}>
            {advocate.name}
          </Text>
          <Mono size={11}>{`${t('con.enrolment')} ${advocate.enrolmentNo}`}</Mono>
        </View>
        <View style={{ gap: 6 }}>
          <Detail icon="bank" value={advocate.barCouncil[lang]} />
          <Detail icon="pin" value={advocate.district[lang]} />
          <Detail icon="globe" value={advocate.languages.map((l) => l[lang]).join(' · ')} />
          <Detail icon="scales" value={advocate.practiceAreas.map((a) => a[lang]).join(' · ')} />
        </View>
      </Card>

      <PrimaryButton label={t('con.callNow')} icon="phone" onPress={() => undefined} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
        <Icon name="lock" size={13} color={c.ink3} />
        <Text style={{ fontFamily: font.medium, fontSize: 11.5, color: c.ink3 }}>{t('con.masked')}</Text>
      </View>

      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <Icon name="letter" size={19} color={c.ink3} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: font.medium, fontSize: 13.5, color: c.ink }}>{t('con.opinion')}</Text>
          <Text style={{ fontFamily: font.regular, fontSize: 11.5, color: c.ink3, marginTop: 1 }}>
            {t('con.opinionPending')}
          </Text>
        </View>
      </Card>

      {consultation.reassignedOnce ? null : (
        <GhostButton label={t('con.reassign')} icon="users" onPress={reassignAdvocate} />
      )}
      <Body size={11} dim>
        {t('con.reassignNote')}
      </Body>
      <View style={{ height: space.lg }} />
    </View>
  );
}

function Detail({ icon, value }: { icon: Parameters<typeof Icon>[0]['name']; value: string }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
      <Icon name={icon} size={14} color={c.ink3} />
      <Text style={{ flex: 1, fontFamily: font.regular, fontSize: 12.5, color: c.ink2 }}>{value}</Text>
    </View>
  );
}

function Steps({ current }: { current: number }) {
  const { c } = useTheme();
  const { t } = useLang();
  const labels: StringKey[] = ['con.step.describe', 'con.step.consent', 'con.step.allocate'];
  return (
    <View style={{ flexDirection: 'row', gap: space.sm }}>
      {labels.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <View key={label} style={{ flex: 1, gap: 5 }}>
            <View
              style={{
                height: 3,
                borderRadius: 2,
                backgroundColor: done ? c.leaf : active ? c.forest : c.line,
              }}
            />
            <Text
              style={{
                fontFamily: active ? font.semibold : font.regular,
                fontSize: 10,
                color: active ? c.ink : c.ink3,
              }}
              numberOfLines={1}
            >
              {t(label)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
