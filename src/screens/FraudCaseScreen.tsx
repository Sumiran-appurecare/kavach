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
  OtpNotice,
  PrimaryButton,
  Screen,
  SectionLabel,
  useCountdown,
} from '../components/ui';
import { formatDate, formatTime } from '../data/mock';
import { rupees, useLang } from '../i18n/LanguageProvider';
import { Nav } from '../navigation/types';
import { useApp } from '../state/AppState';
import { useTheme } from '../theme/ThemeProvider';
import { font, leading, radius, space } from '../theme/tokens';

/**
 * The case screen. Everything here is measured against one question: did both
 * reports go in, with acknowledgement numbers and evidence, inside five
 * calendar days (FR-EMG-04/05/06)?
 */
/** Stable fallback so the countdown hook keeps one interval across renders. */
const NO_TARGET = new Date(0).toISOString();

export function FraudCaseScreen() {
  const { c } = useTheme();
  const { t, lang } = useLang();
  const nav = useNavigation<Nav>();
  const { fraudCase, setAck, addEvidence, markLetterSent, toggleFollowup } = useApp();
  const left = useCountdown(fraudCase?.windowExpiresAt ?? NO_TARGET);

  if (!fraudCase) {
    return (
      <Screen>
        <AppHeader title={t('case.title')} onBack={() => nav.goBack()} />
        <View style={{ paddingHorizontal: space.lg }}>
          <Body>{t('vault.empty')}</Body>
        </View>
      </Screen>
    );
  }

  const bothIn = Boolean(fraudCase.bankAckNo && fraudCase.portalAckNo);

  return (
    <Screen scroll>
      <AppHeader
        title={t('case.title')}
        onBack={() => nav.goBack()}
        right={<Mono size={10}>{fraudCase.id}</Mono>}
      />

      <View style={{ paddingHorizontal: space.lg, gap: space.md }}>
        {/* ── the window ── */}
        <View
          style={{
            backgroundColor: bothIn ? c.leafBg : c.brassBg,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: bothIn ? 'transparent' : c.brass,
            padding: space.lg,
            gap: space.sm,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <Text
              style={{
                fontFamily: font.semibold,
                fontSize: 10.5,
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                color: bothIn ? c.leaf : c.brass,
              }}
            >
              {t('case.window')}
            </Text>
            <Countdown target={fraudCase.windowExpiresAt} size={20} color={c.ink} />
          </View>
          <Text style={{ fontFamily: font.regular, fontSize: 12, lineHeight: 17, color: c.ink2 }}>
            {t('case.windowNote')}
          </Text>
          <View
            style={{
              height: 5,
              borderRadius: 3,
              backgroundColor: c.trackFill,
              overflow: 'hidden',
              marginTop: 2,
            }}
          >
            <View
              style={{
                height: '100%',
                width: `${bothIn ? 100 : fraudCase.bankAckNo || fraudCase.portalAckNo ? 50 : 8}%`,
                backgroundColor: bothIn ? c.leaf : c.brass,
                borderRadius: 3,
              }}
            />
          </View>
          {left.expired && !bothIn ? (
            <Text style={{ fontFamily: font.semibold, fontSize: 12, color: c.siren, marginTop: 2 }}>
              {lang === 'hi'
                ? 'अवधि निकल गई। रिपोर्ट अब भी दर्ज कराएँ — देरी का कारण केस में दर्ज रहेगा।'
                : 'The window has passed. File anyway — the reason for the delay stays on the case record.'}
            </Text>
          ) : null}
        </View>

        {/* ── the two reports ── */}
        <SectionLabel>{t('case.reports')}</SectionLabel>
        <View
          style={{
            backgroundColor: c.card,
            borderWidth: 1,
            borderColor: c.line,
            borderRadius: radius.lg,
            overflow: 'hidden',
          }}
        >
          <ReportBlock
            title={t('case.bankReported')}
            sub={fraudCase.bankName}
            ackNo={fraudCase.bankAckNo}
            reportedAt={fraudCase.bankReportedAt}
            onSave={(value) => setAck('bank', value)}
          />
          <View style={{ height: 1, backgroundColor: c.line2 }} />
          <ReportBlock
            title={t('case.portalReported')}
            sub={t('case.portalWhy')}
            ackNo={fraudCase.portalAckNo}
            reportedAt={fraudCase.portalReportedAt}
            onSave={(value) => setAck('portal', value)}
          />
        </View>

        {/* ── evidence: append-only by design ── */}
        <SectionLabel>{`${t('case.evidence')} · ${fraudCase.evidence.length} ${t('case.items')}`}</SectionLabel>
        <Card style={{ gap: space.md, padding: 0 }}>
          <View style={{ paddingHorizontal: space.lg, paddingTop: space.md }}>
            <Body size={12}>{t('case.evidenceNote')}</Body>
          </View>
          <View>
            {fraudCase.evidence.map((item, i) => (
              <View
                key={item.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: space.md,
                  paddingHorizontal: space.lg,
                  paddingVertical: space.sm + 2,
                  borderTopWidth: 1,
                  borderTopColor: c.line2,
                }}
              >
                <Icon name="lock" size={15} color={c.leaf} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontFamily: font.medium, fontSize: 13, color: c.ink }} numberOfLines={1}>
                    {item.kind[lang]}
                  </Text>
                  <Text style={{ fontFamily: font.mono, fontSize: 9.5, color: c.ink3, marginTop: 2 }} numberOfLines={1}>
                    {`${formatTime(item.capturedAt)} · sha256 ${item.sha256.slice(0, 12)}…`}
                  </Text>
                </View>
                <Mono size={10}>{`#${i + 1}`}</Mono>
              </View>
            ))}
          </View>
          <View style={{ paddingHorizontal: space.lg, paddingBottom: space.md }}>
            <GhostButton
              label={t('case.addEvidence')}
              icon="camera"
              onPress={() =>
                addEvidence({ en: 'Screenshot from gallery', hi: 'गैलरी से स्क्रीनशॉट' })
              }
            />
          </View>
        </Card>

        {/* ── the written complaint ── */}
        <Card
          onPress={markLetterSent}
          style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}
        >
          <View
            style={{
              width: 34,
              height: 34,
              borderRadius: radius.sm + 2,
              backgroundColor: fraudCase.letterSent ? c.leafBg : c.card2,
              borderWidth: 1,
              borderColor: fraudCase.letterSent ? 'transparent' : c.line,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="letter" size={18} color={fraudCase.letterSent ? c.leaf : c.ink2} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontFamily: font.medium, fontSize: 14, color: c.ink }}>{t('case.letter')}</Text>
            <Text style={{ fontFamily: font.regular, fontSize: 11.5, lineHeight: leading(11.5), color: c.ink3, marginTop: 1 }}>
              {t('case.letterSub')}
            </Text>
          </View>
          {fraudCase.letterSent ? <Chip label={t('common.done')} tone="leaf" /> : <Icon name="chevronRight" size={17} color={c.ink3} />}
        </Card>

        {/* ── follow-ups ── */}
        <SectionLabel>{t('case.followups')}</SectionLabel>
        <View
          style={{
            backgroundColor: c.card,
            borderWidth: 1,
            borderColor: c.line,
            borderRadius: radius.lg,
            overflow: 'hidden',
          }}
        >
          {fraudCase.followups.map((f, i) => (
            <Pressable
              key={f.id}
              onPress={() => toggleFollowup(f.id)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: space.md,
                paddingHorizontal: space.lg,
                paddingVertical: space.md,
                borderBottomWidth: i === fraudCase.followups.length - 1 ? 0 : 1,
                borderBottomColor: c.line2,
                backgroundColor: pressed ? c.card2 : 'transparent',
              })}
            >
              <Icon name={f.done ? 'checkCircle' : 'dashCircle'} size={19} color={f.done ? c.leaf : c.ink3} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  style={{
                    fontFamily: font.medium,
                    fontSize: 13.5,
                    color: f.done ? c.ink3 : c.ink,
                    textDecorationLine: f.done ? 'line-through' : 'none',
                  }}
                >
                  {f.label[lang]}
                </Text>
                <Text style={{ fontFamily: font.mono, fontSize: 10, color: c.ink3, marginTop: 2 }}>
                  {`${t('case.followupDay')} ${f.day} · ${formatDate(f.dueAt, lang)}`}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* ── the facts of the case ── */}
        <Card style={{ gap: space.sm }}>
          <Fact label={t('case.amount')} value={rupees(fraudCase.amountPaise)} />
          <Fact label={t('case.channel')} value={fraudCase.channel[lang]} />
          <Fact
            label={t('case.incident')}
            value={`${formatDate(fraudCase.incidentAt, lang)}, ${formatTime(fraudCase.incidentAt)}`}
          />
        </Card>

        <OtpNotice />
        <View style={{ height: space.lg }} />
      </View>
    </Screen>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: space.md }}>
      <Text style={{ fontFamily: font.regular, fontSize: 12.5, color: c.ink3 }}>{label}</Text>
      <Text style={{ fontFamily: font.monoMedium, fontSize: 13, color: c.ink }}>{value}</Text>
    </View>
  );
}

function ReportBlock({
  title,
  sub,
  ackNo,
  reportedAt,
  onSave,
}: {
  title: string;
  sub: string;
  ackNo?: string;
  reportedAt?: string;
  onSave: (value: string) => void;
}) {
  const { c } = useTheme();
  const { t, lang } = useLang();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const done = Boolean(ackNo);

  return (
    <View style={{ padding: space.lg, gap: space.sm + 2 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <Icon name={done ? 'checkCircle' : 'dashCircle'} size={22} color={done ? c.leaf : c.brass} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontFamily: font.semibold, fontSize: 14.5, color: c.ink }}>{title}</Text>
          <Text style={{ fontFamily: font.regular, fontSize: 11.5, lineHeight: leading(11.5), color: c.ink3, marginTop: 1 }}>
            {sub}
          </Text>
        </View>
        <Chip label={done ? t('common.done') : t('common.pending')} tone={done ? 'leaf' : 'brass'} />
      </View>

      {done ? (
        <View
          style={{
            backgroundColor: c.card2,
            borderRadius: radius.sm + 2,
            paddingHorizontal: space.md,
            paddingVertical: space.sm + 1,
          }}
        >
          <Text
            style={{
              fontFamily: font.regular,
              fontSize: 9.5,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              color: c.ink3,
            }}
          >
            {t('case.ackLabel')}
          </Text>
          <Text style={{ fontFamily: font.monoSemibold, fontSize: 14, color: c.ink, marginTop: 2 }}>{ackNo}</Text>
          {reportedAt ? (
            <Text style={{ fontFamily: font.mono, fontSize: 10, color: c.ink3, marginTop: 3 }}>
              {`${formatDate(reportedAt, lang)}, ${formatTime(reportedAt)}`}
            </Text>
          ) : null}
        </View>
      ) : editing ? (
        <View style={{ gap: space.sm }}>
          <Field
            label={t('case.ackLabel')}
            value={draft}
            onChangeText={setDraft}
            placeholder="BNK/2027/…"
            mono
            autoFocus
          />
          <PrimaryButton
            label={t('case.saveAck')}
            disabled={draft.trim().length < 4}
            onPress={() => {
              onSave(draft.trim());
              setEditing(false);
            }}
          />
        </View>
      ) : (
        <GhostButton label={t('case.addAck')} icon="plus" onPress={() => setEditing(true)} />
      )}
    </View>
  );
}
