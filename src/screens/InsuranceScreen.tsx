import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Text, View } from 'react-native';
import { Icon } from '../components/Icon';
import {
  AppHeader,
  Body,
  Card,
  Chip,
  InfoDisclaimer,
  Mono,
  PrimaryButton,
  Screen,
  SectionLabel,
} from '../components/ui';
import { daysUntil, formatDate } from '../data/mock';
import { useLang } from '../i18n/LanguageProvider';
import { Nav } from '../navigation/types';
import { useApp } from '../state/AppState';
import { useTheme } from '../theme/ThemeProvider';
import { font, radius, space } from '../theme/tokens';

/**
 * Insurance & Claims Help.
 *
 * This one is an addition to the scope document rather than something already
 * in it, so it deliberately stays inside what the existing modules can honestly
 * do: it reads the claim-relevant fields Document Intelligence already extracts
 * from a policy (FR-DOC-03, room-rent cap, co-pay, waiting period) and routes
 * to an advocate when a claim has actually been refused. It does not file or
 * pursue a claim on the user's behalf, and says so.
 */

/** The fields that usually decide how much of a hospital bill is actually paid. */
const CLAIM_FIELDS = ['Room rent cap', 'Co-pay', 'Waiting period', 'Sum insured', 'Nominee'];

export function InsuranceScreen() {
  const { c } = useTheme();
  const { t, lang } = useLang();
  const nav = useNavigation<Nav>();
  const { docs } = useApp();

  const policies = docs.filter((d) => d.category === 'insurance');

  return (
    <Screen scroll>
      <AppHeader title={t('ins.title')} onBack={() => nav.goBack()} />

      <View style={{ paddingHorizontal: space.lg, gap: space.md }}>
        <Body size={13.5}>{t('ins.lead')}</Body>

        <SectionLabel>{t('ins.policies')}</SectionLabel>

        {policies.length === 0 ? (
          <Card style={{ gap: space.md, alignItems: 'center', paddingVertical: space.xl }}>
            <Icon name="cover" size={26} color={c.ink3} />
            <Body dim>{t('ins.none')}</Body>
            <PrimaryButton
              label={t('ins.addPolicy')}
              icon="camera"
              tone="light"
              onPress={() => nav.navigate('Vault')}
              style={{ alignSelf: 'stretch' }}
            />
          </Card>
        ) : (
          policies.map((doc) => {
            const days = doc.expiryDate ? daysUntil(doc.expiryDate) : null;
            const claimFields = doc.fields.filter((f) => CLAIM_FIELDS.includes(f.label.en));

            return (
              <Card key={doc.id} style={{ gap: space.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm + 2 }}>
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: radius.sm + 2,
                      backgroundColor: c.brassBg,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon name="cover" size={18} color={c.brass} />
                  </View>
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={{ fontFamily: font.bold, fontSize: 14.5, color: c.ink }} numberOfLines={1}>
                      {doc.title[lang]}
                    </Text>
                    {doc.expiryDate ? (
                      <Mono size={10}>{`${t('doc.expires')} ${formatDate(doc.expiryDate, lang)}`}</Mono>
                    ) : null}
                  </View>
                  {days !== null ? (
                    <Chip
                      label={days < 0 ? t('doc.expired') : `${days}d`}
                      tone={days < 0 ? 'siren' : days <= 45 ? 'brass' : 'leaf'}
                    />
                  ) : null}
                </View>

                {claimFields.length > 0 ? (
                  <>
                    <View style={{ height: 1, backgroundColor: c.line2 }} />
                    <Text
                      style={{
                        fontFamily: font.semibold,
                        fontSize: 10.5,
                        letterSpacing: 1.1,
                        textTransform: 'uppercase',
                        color: c.ink3,
                      }}
                    >
                      {t('ins.decides')}
                    </Text>
                    <View style={{ gap: space.sm }}>
                      {claimFields.map((f, i) => (
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
                              fontFamily: font.medium,
                              fontSize: 12.5,
                              color: c.ink,
                            }}
                          >
                            {f.value}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </>
                ) : null}

                {doc.explanation ? (
                  <>
                    <View style={{ height: 1, backgroundColor: c.line2 }} />
                    <Text style={{ fontFamily: font.regular, fontSize: 13.5, lineHeight: 21, color: c.ink }}>
                      {doc.explanation[lang]}
                    </Text>
                    <InfoDisclaimer />
                  </>
                ) : null}
              </Card>
            );
          })
        )}

        <PrimaryButton
          label={t('ins.askQuestion')}
          icon="chat"
          tone="light"
          onPress={() => nav.navigate('Assistant')}
        />
        <PrimaryButton label={t('ins.askAdvocate')} icon="scales" onPress={() => nav.navigate('Consult')} />

        <View style={{ height: space.lg }} />
      </View>
    </Screen>
  );
}
