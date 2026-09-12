import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { Text, View } from 'react-native';
import { Icon } from '../components/Icon';
import {
  AppHeader,
  Body,
  Card,
  Chip,
  GhostButton,
  InfoDisclaimer,
  Mono,
  PrimaryButton,
  Screen,
  SectionLabel,
} from '../components/ui';
import { daysUntil, formatDate, formatTime, iso } from '../data/mock';
import { useLang } from '../i18n/LanguageProvider';
import { StringKey } from '../i18n/strings';
import { AppParamList, Nav } from '../navigation/types';
import { useApp } from '../state/AppState';
import { useTheme } from '../theme/ThemeProvider';
import { font, radius, space } from '../theme/tokens';

const CATEGORY_LABEL: Record<string, StringKey> = {
  identity: 'vault.cat.identity',
  property: 'vault.cat.property',
  financial: 'vault.cat.financial',
  insurance: 'vault.cat.insurance',
  family: 'vault.cat.family',
  vehicle: 'vault.cat.vehicle',
  contracts: 'vault.cat.contracts',
  business: 'vault.cat.business',
};

/**
 * Document detail. The explanation is descriptive only: it says what the
 * document contains and what such clauses generally mean, never what the user
 * should do (FR-DOC-05), and it always carries the information disclaimer plus
 * a route to an advocate (FR-DOC-06).
 */
export function DocumentScreen() {
  const { c } = useTheme();
  const { t, lang } = useLang();
  const nav = useNavigation<Nav>();
  const route = useRoute<RouteProp<AppParamList, 'Document'>>();
  const { docs } = useApp();

  const doc = docs.find((d) => d.id === route.params.id);

  if (!doc) {
    return (
      <Screen>
        <AppHeader title={t('vault.title')} onBack={() => nav.goBack()} />
      </Screen>
    );
  }

  const days = doc.expiryDate ? daysUntil(doc.expiryDate) : null;
  const failed = doc.ocrStatus === 'failed';

  return (
    <Screen scroll>
      <AppHeader title={doc.title[lang]} onBack={() => nav.goBack()} />

      <View style={{ paddingHorizontal: space.lg, gap: space.md }}>
        <View style={{ flexDirection: 'row', gap: space.sm, flexWrap: 'wrap' }}>
          <Chip label={t(CATEGORY_LABEL[doc.category])} />
          {days !== null ? (
            <Chip
              label={
                days < 0
                  ? `${t('doc.expired')} · ${formatDate(doc.expiryDate!, lang)}`
                  : `${t('doc.expires')} ${formatDate(doc.expiryDate!, lang)}`
              }
              tone={days < 0 ? 'siren' : days <= 30 ? 'brass' : 'leaf'}
            />
          ) : null}
          <Chip label={`${(doc.sizeKb / 1024).toFixed(1)} MB`} />
        </View>

        {/* A page stands in for the encrypted preview; nothing leaves the device. */}
        <View
          style={{
            height: 180,
            borderRadius: radius.lg,
            borderWidth: 1,
            borderColor: c.line,
            backgroundColor: c.card,
            alignItems: 'center',
            justifyContent: 'center',
            gap: space.sm,
          }}
        >
          <Icon name="lock" size={22} color={c.ink3} />
          <Body size={12} dim>
            {lang === 'hi' ? 'पासफ़्रेज़ से खुलने वाला प्रीव्यू' : 'Preview opens with your passphrase'}
          </Body>
        </View>

        {failed ? (
          <Card style={{ gap: space.md, borderColor: c.brass }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
              <Icon name="alert" size={17} color={c.brass} />
              <Text style={{ fontFamily: font.semibold, fontSize: 14, color: c.ink }}>{t('doc.notAnalysed')}</Text>
            </View>
            <Body size={12.5}>{t('doc.notAnalysedBody')}</Body>
            <GhostButton label={t('doc.enterManually')} icon="plus" onPress={() => undefined} />
          </Card>
        ) : (
          <>
            <SectionLabel action={t('doc.fixDate')} onAction={() => undefined}>
              {t('doc.fields')}
            </SectionLabel>
            <Card style={{ gap: space.sm + 2 }}>
              {doc.fields.map((f, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: space.md,
                  }}
                >
                  <Text style={{ flex: 1, fontFamily: font.regular, fontSize: 12.5, color: c.ink3 }}>
                    {f.label[lang]}
                  </Text>
                  <Text
                    style={{
                      flex: 1.2,
                      textAlign: 'right',
                      fontFamily: f.mono ? font.monoMedium : font.medium,
                      fontSize: f.mono ? 12.5 : 13,
                      color: c.ink,
                    }}
                  >
                    {f.value}
                  </Text>
                </View>
              ))}
            </Card>
          </>
        )}

        {doc.explanation ? (
          <>
            <SectionLabel>{t('doc.explain')}</SectionLabel>
            <Card style={{ gap: space.md }}>
              <Text style={{ fontFamily: font.regular, fontSize: 14, lineHeight: 22, color: c.ink }}>
                {doc.explanation[lang]}
              </Text>
              <View style={{ height: 1, backgroundColor: c.line2 }} />
              <InfoDisclaimer />
              <PrimaryButton
                label={t('doc.askAdvocate')}
                icon="scales"
                tone="light"
                onPress={() => nav.navigate('Consult')}
              />
            </Card>
          </>
        ) : null}

        <SectionLabel>{t('doc.accessLog')}</SectionLabel>
        <Card style={{ gap: space.sm + 2 }}>
          {[
            { at: iso(0, 9, 41), label: t('doc.thisDevice') },
            { at: doc.addedAt, label: t('doc.added') },
          ].map((row, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm + 2 }}>
              <Icon name="clock" size={14} color={c.ink3} />
              <Text style={{ flex: 1, fontFamily: font.medium, fontSize: 12.5, color: c.ink }}>{row.label}</Text>
              <Mono size={10}>{`${formatDate(row.at, lang)} · ${formatTime(row.at)}`}</Mono>
            </View>
          ))}
        </Card>

        <View style={{ height: space.lg }} />
      </View>
    </Screen>
  );
}
