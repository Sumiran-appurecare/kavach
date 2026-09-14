import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon } from '../components/Icon';
import {
  AppHeader,
  Body,
  Card,
  Chip,
  Countdown,
  Field,
  GhostButton,
  Mono,
  PrimaryButton,
  Screen,
  SectionLabel,
  Segmented,
} from '../components/ui';
import { SCAM_OF_THE_DAY } from '../data/mock';
import { ArtefactType, ScamResult, Verdict } from '../data/types';
import { useLang } from '../i18n/LanguageProvider';
import { StringKey } from '../i18n/strings';
import { Nav } from '../navigation/types';
import { useApp } from '../state/AppState';
import { useTheme } from '../theme/ThemeProvider';
import { font, leading, radius, space } from '../theme/tokens';

const TYPES: { value: ArtefactType; label: StringKey; placeholder: StringKey }[] = [
  { value: 'sms', label: 'scm.type.sms', placeholder: 'scm.placeholder.sms' },
  { value: 'url', label: 'scm.type.url', placeholder: 'scm.placeholder.url' },
  { value: 'upi', label: 'scm.type.upi', placeholder: 'scm.placeholder.upi' },
  { value: 'phone', label: 'scm.type.phone', placeholder: 'scm.placeholder.phone' },
  { value: 'image', label: 'scm.type.image', placeholder: 'scm.placeholder.image' },
];

export function ShieldScreen() {
  const { c } = useTheme();
  const { t, lang } = useLang();
  const nav = useNavigation<Nav>();
  const { fraudCase, scamChecksLeft, scamHistory, runScamCheck } = useApp();

  const [type, setType] = useState<ArtefactType>('sms');
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ScamResult | null>(null);

  const blocked = scamChecksLeft !== 'unlimited' && scamChecksLeft <= 0;
  const active = TYPES.find((x) => x.value === type)!;

  function check() {
    if (!value.trim() || blocked) return;
    setBusy(true);
    setResult(null);
    // A real check calls the Cyber service; the local engine scores the same signals.
    setTimeout(() => {
      setResult(runScamCheck(type, value));
      setBusy(false);
    }, 550);
  }

  return (
    <Screen scroll>
      <AppHeader
        title={t('shield.title')}
        right={
          <Mono size={10}>
            {scamChecksLeft === 'unlimited' ? t('scm.unlimited') : `${scamChecksLeft} / 3`}
          </Mono>
        }
      />

      <View style={{ paddingHorizontal: space.lg, gap: space.md }}>
        {/* An open case outranks everything else on this screen. */}
        {fraudCase ? (
          <Pressable
            onPress={() => nav.navigate('FraudCase')}
            style={({ pressed }) => ({
              backgroundColor: c.brassBg,
              borderWidth: 1,
              borderColor: c.brass,
              borderRadius: radius.lg,
              padding: space.lg,
              gap: space.sm,
              opacity: pressed ? 0.9 : 1,
            })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <Text
                style={{
                  fontFamily: font.semibold,
                  fontSize: 10.5,
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                  color: c.brass,
                }}
              >
                {t('case.window')}
              </Text>
              <Countdown target={fraudCase.windowExpiresAt} size={18} color={c.ink} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
              <Text style={{ flex: 1, fontFamily: font.medium, fontSize: 13, color: c.ink }}>
                {fraudCase.portalAckNo ? t('shield.openCase') : t('case.portalWhy')}
              </Text>
              <Icon name="chevronRight" size={17} color={c.brass} />
            </View>
          </Pressable>
        ) : null}

        {/* ── scam check ── */}
        <SectionLabel>{t('scm.title')}</SectionLabel>
        <Body size={12.5} dim>
          {t('scm.subtitle')}
        </Body>

        <Segmented
          options={TYPES.map((x) => ({ value: x.value, label: t(x.label) }))}
          value={type}
          onChange={(next) => {
            setType(next);
            setValue('');
            setResult(null);
          }}
        />

        {type === 'image' ? (
          <Card style={{ gap: space.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
              <Icon name="camera" size={17} color={c.brass} />
              <Text style={{ fontFamily: font.semibold, fontSize: 14, color: c.ink }}>{t('scm.type.image')}</Text>
            </View>
            <Body size={12.5}>
              {lang === 'hi'
                ? 'स्क्रीनशॉट की जाँच में तस्वीर से टेक्स्ट सर्वर पर पढ़ा जाता है। इस फ्रंटएंड बिल्ड में वह सेवा नहीं जुड़ी है — तब तक मैसेज का टेक्स्ट कॉपी करके "मैसेज" में पेस्ट करें।'
                : 'A screenshot check reads the text off the image on the server. That service is not wired into this frontend build — until it is, copy the message text and paste it under Message.'}
            </Body>
            <GhostButton label={t('scm.type.sms')} icon="chat" onPress={() => setType('sms')} />
          </Card>
        ) : (
          <>
            <Field
              value={value}
              onChangeText={setValue}
              placeholder={t(active.placeholder)}
              multiline={type === 'sms'}
              keyboardType={type === 'phone' ? 'phone-pad' : type === 'url' ? 'url' : 'default'}
              mono={type === 'upi' || type === 'phone'}
            />
            {blocked ? (
              <Card style={{ gap: space.sm, borderColor: c.brass }}>
                <Text style={{ fontFamily: font.semibold, fontSize: 14, color: c.ink }}>{t('scm.limitTitle')}</Text>
                <Body size={12.5}>{t('scm.limitBody')}</Body>
              </Card>
            ) : (
              <PrimaryButton
                label={busy ? t('scm.checking') : t('scm.check')}
                icon="scan"
                busy={busy}
                disabled={!value.trim()}
                onPress={check}
              />
            )}
          </>
        )}

        {result ? <ResultCard result={result} /> : null}

        {/* ── today's scam ── */}
        <SectionLabel>{t('scm.today')}</SectionLabel>
        <Card style={{ gap: space.md }}>
          <Chip label={t('scm.verdict.dangerous')} tone="siren" />
          <Text style={{ fontFamily: font.display, fontSize: 18, lineHeight: leading(18), color: c.ink }}>
            {SCAM_OF_THE_DAY.title[lang]}
          </Text>
          <Body size={13}>{SCAM_OF_THE_DAY.body[lang]}</Body>
          <View
            style={{
              flexDirection: 'row',
              gap: space.sm + 2,
              paddingLeft: space.sm,
              borderLeftWidth: 2,
              borderLeftColor: c.brass,
            }}
          >
            <Text style={{ flex: 1, fontFamily: font.regular, fontSize: 12.5, lineHeight: 18, color: c.ink2 }}>
              <Text style={{ fontFamily: font.semibold, color: c.ink }}>{`${t('scm.tell')}: `}</Text>
              {SCAM_OF_THE_DAY.tell[lang]}
            </Text>
          </View>
          <GhostButton label={t('scm.share')} icon="whatsapp" onPress={() => undefined} />
        </Card>

        {/* ── history ── */}
        {scamHistory.length > 0 ? (
          <>
            <SectionLabel>{t('scm.history')}</SectionLabel>
            <View
              style={{
                backgroundColor: c.card,
                borderWidth: 1,
                borderColor: c.line,
                borderRadius: radius.lg,
                overflow: 'hidden',
              }}
            >
              {scamHistory.map((item, i) => (
                <Pressable
                  key={item.id}
                  onPress={() => setResult(item)}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: space.md,
                    paddingHorizontal: space.lg,
                    paddingVertical: space.md - 1,
                    borderBottomWidth: i === scamHistory.length - 1 ? 0 : 1,
                    borderBottomColor: c.line2,
                    backgroundColor: pressed ? c.card2 : 'transparent',
                  })}
                >
                  <VerdictDot verdict={item.verdict} />
                  <Text
                    style={{ flex: 1, fontFamily: font.mono, fontSize: 11.5, color: c.ink }}
                    numberOfLines={1}
                  >
                    {item.artefact}
                  </Text>
                  <Text style={{ fontFamily: font.semibold, fontSize: 10.5, color: verdictColor(item.verdict, c) }}>
                    {t(`scm.verdict.${item.verdict}` as StringKey)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : null}

        <View style={{ height: space.lg }} />
      </View>
    </Screen>
  );
}

function verdictColor(verdict: Verdict, c: ReturnType<typeof useTheme>['c']) {
  return verdict === 'dangerous' ? c.siren : verdict === 'suspicious' ? c.brass : c.leaf;
}

function VerdictDot({ verdict }: { verdict: Verdict }) {
  const { c } = useTheme();
  return (
    <View
      style={{
        width: 9,
        height: 9,
        borderRadius: 5,
        backgroundColor: verdictColor(verdict, c),
      }}
    />
  );
}

/** Three levels, a confidence, the reasons that drove it, and three next steps. */
function ResultCard({ result }: { result: ScamResult }) {
  const { c } = useTheme();
  const { t, lang } = useLang();
  const nav = useNavigation<Nav>();
  const { reportScam, reportedScamIds } = useApp();
  const reported = reportedScamIds.includes(result.id);
  const colour = verdictColor(result.verdict, c);

  return (
    <Card style={{ gap: space.md, borderColor: colour }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm + 2 }}>
        <View
          style={{
            width: 38,
            height: 38,
            borderRadius: radius.pill,
            backgroundColor: colour,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon
            name={result.verdict === 'safe' ? 'shieldCheck' : result.verdict === 'suspicious' ? 'shieldAlert' : 'alert'}
            size={19}
            color={c.onSiren}
          />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontFamily: font.display, fontSize: 20, lineHeight: leading(20), color: colour }}>
            {t(`scm.verdict.${result.verdict}` as StringKey)}
          </Text>
          <Mono size={10}>{`${Math.round(result.confidence * 100)}% ${t('scm.confidence')}`}</Mono>
        </View>
      </View>

      <View style={{ gap: space.sm }}>
        <Text
          style={{
            fontFamily: font.semibold,
            fontSize: 10.5,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: c.ink3,
          }}
        >
          {t('scm.why')}
        </Text>
        {result.reasons.map((reason, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: space.sm }}>
            <Text style={{ fontFamily: font.monoMedium, fontSize: 11, color: c.ink3, marginTop: 2 }}>
              {`0${i + 1}`}
            </Text>
            <Text style={{ flex: 1, fontFamily: font.regular, fontSize: 13, lineHeight: 19, color: c.ink }}>
              {reason[lang]}
            </Text>
          </View>
        ))}
      </View>

      <View style={{ height: 1, backgroundColor: c.line2 }} />

      <View style={{ gap: space.sm }}>
        <Text
          style={{
            fontFamily: font.semibold,
            fontSize: 10.5,
            letterSpacing: 1.2,
            textTransform: 'uppercase',
            color: c.ink3,
          }}
        >
          {t('scm.next')}
        </Text>
        {result.steps.map((step, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: space.sm + 2 }}>
            <Icon name="check" size={14} color={colour} />
            <Text style={{ flex: 1, fontFamily: font.regular, fontSize: 13, lineHeight: 19, color: c.ink2 }}>
              {step[lang]}
            </Text>
          </View>
        ))}
      </View>

      {result.verdict === 'dangerous' ? (
        <PrimaryButton
          label={t('emg.screen.title')}
          icon="alert"
          tone="siren"
          onPress={() => nav.navigate('Emergency')}
        />
      ) : null}

      {reported ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Icon name="checkCircle" size={14} color={c.leaf} />
          <Text style={{ fontFamily: font.medium, fontSize: 12, color: c.leaf }}>{t('scm.reported')}</Text>
        </View>
      ) : (
        <GhostButton label={t('scm.report')} icon="users" onPress={() => reportScam(result.id)} />
      )}
      <Body size={11} dim>
        {t('scm.reportNote')}
      </Body>
    </Card>
  );
}
