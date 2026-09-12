import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Text, View } from 'react-native';
import { Icon } from '../components/Icon';
import {
  AppHeader,
  Body,
  Card,
  Chip,
  Countdown,
  ListRow,
  Mono,
  PrimaryButton,
  Screen,
  SectionLabel,
} from '../components/ui';
import { formatDate } from '../data/mock';
import { rupees, useLang } from '../i18n/LanguageProvider';
import { StringKey } from '../i18n/strings';
import { Nav } from '../navigation/types';
import { useApp } from '../state/AppState';
import { useTheme } from '../theme/ThemeProvider';
import { font, radius, space } from '../theme/tokens';

const STAGE_LABEL: Record<string, StringKey> = {
  describe: 'con.step.describe',
  consent: 'con.step.consent',
  allocating: 'con.allocating',
  allocated: 'con.allocated',
};

/**
 * Everything with a file number against it: fraud cases and advocate
 * consultations. Case metadata only — the documents inside a Case Folder are
 * decryptable by the subscriber and the assigned advocate, nobody else
 * (FR-CMP-07).
 */
export function CasesScreen() {
  const { c } = useTheme();
  const { t, lang } = useLang();
  const nav = useNavigation<Nav>();
  const { fraudCase, consultation } = useApp();

  const empty = !fraudCase && !consultation;

  return (
    <Screen scroll>
      <AppHeader title={t('cases.title')} />

      <View style={{ paddingHorizontal: space.lg, gap: space.md }}>
        {empty ? (
          <Card style={{ gap: space.md, alignItems: 'center', paddingVertical: space.xxl }}>
            <Icon name="folder" size={30} color={c.ink3} />
            <Text style={{ fontFamily: font.bold, fontSize: 16, color: c.ink }}>{t('cases.empty')}</Text>
            <Body size={13} style={{ textAlign: 'center' }}>
              {t('cases.emptyBody')}
            </Body>
            <PrimaryButton
              label={t('cases.startConsult')}
              icon="scales"
              tone="light"
              onPress={() => nav.navigate('Consult')}
              style={{ alignSelf: 'stretch' }}
            />
          </Card>
        ) : null}

        {fraudCase ? (
          <>
            <SectionLabel>{t('cases.fraud')}</SectionLabel>
            <Card onPress={() => nav.navigate('FraudCase')} style={{ gap: space.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm + 2 }}>
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: radius.sm + 2,
                    backgroundColor: c.sirenBg,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon name="folder" size={18} color={c.siren} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontFamily: font.bold, fontSize: 14.5, color: c.ink }}>{t('case.cyberFraud')}</Text>
                  <Mono size={10}>{`${fraudCase.id} · ${rupees(fraudCase.amountPaise)} · ${fraudCase.channel[lang]}`}</Mono>
                </View>
                <Chip label={t('case.inProgress')} tone="siren" />
              </View>

              <View
                style={{
                  backgroundColor: c.brassBg,
                  borderRadius: radius.sm + 2,
                  paddingHorizontal: space.md,
                  paddingVertical: space.sm + 2,
                  flexDirection: 'row',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  gap: space.sm,
                }}
              >
                <Text
                  style={{
                    fontFamily: font.semibold,
                    fontSize: 9.5,
                    letterSpacing: 1.1,
                    textTransform: 'uppercase',
                    color: c.brass,
                  }}
                >
                  {t('case.window')}
                </Text>
                <Countdown target={fraudCase.windowExpiresAt} size={16} color={c.ink} />
              </View>

              <View style={{ gap: 6 }}>
                <Line
                  done={Boolean(fraudCase.bankAckNo)}
                  label={t('case.bankReported')}
                  value={fraudCase.bankAckNo}
                />
                <Line
                  done={Boolean(fraudCase.portalAckNo)}
                  label={t('case.portalReported')}
                  value={fraudCase.portalAckNo}
                />
                <Line
                  done={fraudCase.evidence.length > 0}
                  label={t('case.evidence')}
                  value={`${fraudCase.evidence.length} ${t('case.items')}`}
                />
                <Line done={fraudCase.letterSent} label={t('case.letter')} />
              </View>
            </Card>
          </>
        ) : null}

        {consultation ? (
          <>
            <SectionLabel>{t('cases.consults')}</SectionLabel>
            <View
              style={{
                backgroundColor: c.card,
                borderWidth: 1,
                borderColor: c.line,
                borderRadius: radius.lg,
                overflow: 'hidden',
              }}
            >
              <ListRow
                icon="scales"
                iconTone="brass"
                title={consultation.advocate ? consultation.advocate.name : t('con.title')}
                sub={
                  consultation.consentAt
                    ? `${t(STAGE_LABEL[consultation.stage])} · ${formatDate(consultation.consentAt, lang)}`
                    : t(STAGE_LABEL[consultation.stage])
                }
                onPress={() => nav.navigate('Consult')}
                last
              />
            </View>
          </>
        ) : null}

        <View style={{ height: space.lg }} />
      </View>
    </Screen>
  );
}

function Line({ done, label, value }: { done: boolean; label: string; value?: string }) {
  const { c } = useTheme();
  const { t } = useLang();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm + 2 }}>
      <Icon name={done ? 'checkCircle' : 'dashCircle'} size={15} color={done ? c.leaf : c.ink3} />
      <Text style={{ flex: 1, fontFamily: font.medium, fontSize: 12.5, color: done ? c.ink : c.ink3 }}>{label}</Text>
      <Mono size={10}>{value ?? (done ? t('common.done') : t('common.pending'))}</Mono>
    </View>
  );
}
