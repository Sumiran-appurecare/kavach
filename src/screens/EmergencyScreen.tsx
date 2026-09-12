import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { Icon } from '../components/Icon';
import { AppHeader, Body, Card, OtpNotice, PrimaryButton, Screen, SectionLabel } from '../components/ui';
import { useLang } from '../i18n/LanguageProvider';
import { Nav } from '../navigation/types';
import { useApp } from '../state/AppState';
import { useTheme } from '../theme/ThemeProvider';
import { font, radius, space } from '../theme/tokens';

/**
 * The one-tap path (FR-EMG-01/02/03).
 *
 * Free has no assistant line (FR-SUB-07), so the connect card steps back and
 * the numbers plus the script come first — those cost us nothing and a person
 * losing money at 2am is the last person to meter. Nothing here promises
 * recovery of money; the offer is filing and follow-up (FR-CMP-08).
 */
export function EmergencyScreen() {
  const { c } = useTheme();
  const { t } = useLang();
  const nav = useNavigation<Nav>();
  const { plan, fraudCase, openFraudCase } = useApp();
  const free = plan === 'FREE';
  const [connecting, setConnecting] = useState(false);

  function connect() {
    setConnecting(true);
    setTimeout(() => setConnecting(false), 2500);
  }

  function startCase() {
    if (!fraudCase) openFraudCase();
    nav.navigate('FraudCase');
  }

  return (
    <Screen scroll style={{ paddingBottom: space.xxl }}>
      <AppHeader title={t('emg.screen.title')} onBack={() => nav.goBack()} />

      <View style={{ paddingHorizontal: space.lg, gap: space.md }}>
        <Body>{t('emg.screen.lead')}</Body>
        <OtpNotice />

        {/* Step 1 — a person on the line, where the plan includes one */}
        {free ? (
          <Card style={{ gap: space.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
              <Icon name="phone" size={16} color={c.ink3} />
              <Text style={{ fontFamily: font.semibold, fontSize: 14, color: c.ink }}>
                {t('emg.connect.title')}
              </Text>
            </View>
            <Body size={12.5}>{t('emg.connect.free')}</Body>
          </Card>
        ) : (
          <View
            style={{
              backgroundColor: c.siren,
              borderRadius: radius.lg,
              padding: space.lg,
              gap: space.md,
            }}
          >
            <View>
              <Text style={{ fontFamily: font.display, fontSize: 20, lineHeight: 25, color: c.onSiren }}>
                {t('emg.connect.title')}
              </Text>
              <Text
                style={{
                  fontFamily: font.regular,
                  fontSize: 12.5,
                  lineHeight: 18,
                  color: c.onSiren,
                  opacity: 0.94,
                  marginTop: 3,
                }}
              >
                {t('emg.connect.sub')}
              </Text>
            </View>
            <PrimaryButton
              label={connecting ? t('emg.calling') : t('emg.cta.paid')}
              busy={connecting}
              icon="phone"
              tone="light"
              onPress={connect}
            />
          </View>
        )}

        {/* Step 2 — the two numbers, in the order that matters */}
        <SectionLabel style={{ marginTop: space.xs }}>{t('emg.numbers')}</SectionLabel>
        <View
          style={{
            backgroundColor: c.card,
            borderWidth: 1,
            borderColor: c.line,
            borderRadius: radius.lg,
            overflow: 'hidden',
          }}
        >
          <BankRow />
          <CallRow
            index={2}
            title={t('emg.portal')}
            sub={t('emg.portalSub')}
            number="1930"
            onPress={() => Linking.openURL('tel:1930')}
            last
          />
        </View>

        {/* Step 3 — what to actually say, because panic erases the words */}
        <SectionLabel style={{ marginTop: space.xs }}>{t('emg.script')}</SectionLabel>
        <Card style={{ gap: space.md }}>
          {(['emg.script.line1', 'emg.script.line2', 'emg.script.line3'] as const).map((key) => (
            <View key={key} style={{ flexDirection: 'row', gap: space.sm + 2 }}>
              <View
                style={{
                  width: 3,
                  borderRadius: 2,
                  backgroundColor: c.brass,
                  alignSelf: 'stretch',
                }}
              />
              <Text
                style={{
                  flex: 1,
                  fontFamily: font.regular,
                  fontSize: 13.5,
                  lineHeight: 20,
                  color: c.ink,
                }}
              >
                {t(key)}
              </Text>
            </View>
          ))}
        </Card>

        {/* Step 4 — hold the dates and the acknowledgement numbers */}
        <Card style={{ gap: space.md, marginTop: space.xs }}>
          <View style={{ gap: 4 }}>
            <Text style={{ fontFamily: font.semibold, fontSize: 14.5, color: c.ink }}>
              {t('emg.startCase')}
            </Text>
            <Body size={12.5}>{t('emg.startCaseSub')}</Body>
          </View>
          <PrimaryButton
            label={fraudCase ? t('shield.openCase') : t('emg.startCase')}
            icon="clock"
            onPress={startCase}
          />
        </Card>

        <Text
          style={{
            fontFamily: font.regular,
            fontSize: 11.5,
            lineHeight: 17,
            color: c.ink3,
            paddingHorizontal: space.xs,
          }}
        >
          {t('emg.noPromise')}
        </Text>
      </View>
    </Screen>
  );
}

function CallRow({
  index,
  title,
  sub,
  number,
  onPress,
  last = false,
  muted = false,
}: {
  index: number;
  title: string;
  sub: string;
  number?: string;
  onPress?: () => void;
  last?: boolean;
  muted?: boolean;
}) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md,
        paddingHorizontal: space.lg,
        paddingVertical: space.md + 1,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: c.line2,
        backgroundColor: pressed ? c.card2 : 'transparent',
      })}
    >
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: radius.pill,
          backgroundColor: muted ? c.card2 : c.leafBg,
          borderWidth: 1,
          borderColor: muted ? c.line : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontFamily: font.monoSemibold, fontSize: 11, color: muted ? c.ink3 : c.leaf }}>
          {index}
        </Text>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: font.semibold, fontSize: 14, color: c.ink }}>{title}</Text>
        <Text style={{ fontFamily: font.regular, fontSize: 11.5, lineHeight: 16, color: c.ink3, marginTop: 1 }}>
          {sub}
        </Text>
      </View>
      {number ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: c.forest,
            borderRadius: radius.sm + 2,
            paddingHorizontal: space.md - 1,
            paddingVertical: 9,
          }}
        >
          <Icon name="phone" size={13} color={c.onForest} />
          <Text style={{ fontFamily: font.monoSemibold, fontSize: 13, color: c.onForest }}>{number}</Text>
        </View>
      ) : (
        <Icon name="chevronRight" size={17} color={c.ink3} />
      )}
    </Pressable>
  );
}

/**
 * The bank's 24×7 fraud line comes from a directory Ops maintains — which is
 * still an open question in the scope document, and is not wired in this
 * frontend build. Rather than show a number we cannot verify, the row says
 * where the right one is printed. A wrong number here costs someone the window.
 */
function BankRow() {
  const { c } = useTheme();
  const { t, lang } = useLang();
  return (
    <View>
      <CallRow
        index={1}
        title={t('emg.bank')}
        sub={t('emg.bankSub')}
        muted
        last
      />
      <View
        style={{
          flexDirection: 'row',
          gap: space.sm,
          marginHorizontal: space.lg,
          marginBottom: space.md,
          padding: space.sm + 2,
          borderRadius: radius.sm + 2,
          backgroundColor: c.brassBg,
        }}
      >
        <Icon name="alert" size={14} color={c.brass} />
        <Text style={{ flex: 1, fontFamily: font.medium, fontSize: 11.5, lineHeight: 16, color: c.brass }}>
          {lang === 'hi'
            ? 'इस बिल्ड में बैंक हेल्पलाइन डायरेक्टरी नहीं जुड़ी है। नंबर अपने कार्ड के पीछे या बैंक की ऐप में देखें — ग़लत नंबर पर समय बर्बाद होता है।'
            : 'The bank helpline directory is not wired into this build. Use the number on the back of your card or inside your bank app — a wrong number costs you the window.'}
        </Text>
      </View>
    </View>
  );
}
