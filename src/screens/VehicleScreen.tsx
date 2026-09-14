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
 * Vehicle Documents. A curated view over the `vehicle` vault category — RC,
 * PUC, fitness — the same pattern InsuranceScreen uses for `insurance`. Motor
 * insurance itself lives under the Insurance tile; this one is everything
 * else that keeps a vehicle legally on the road.
 */
export function VehicleScreen() {
  const { c } = useTheme();
  const { t, lang } = useLang();
  const nav = useNavigation<Nav>();
  const { docs } = useApp();

  const vehicleDocs = docs
    .filter((d) => d.category === 'vehicle')
    .sort((a, b) => {
      if (!a.expiryDate) return 1;
      if (!b.expiryDate) return -1;
      return daysUntil(a.expiryDate) - daysUntil(b.expiryDate);
    });

  return (
    <Screen scroll>
      <AppHeader title={t('veh.title')} onBack={() => nav.goBack()} />

      <View style={{ paddingHorizontal: space.lg, gap: space.md }}>
        <Body size={13.5}>{t('veh.lead')}</Body>

        <SectionLabel>{t('veh.documents')}</SectionLabel>

        {vehicleDocs.length === 0 ? (
          <Card style={{ gap: space.md, alignItems: 'center', paddingVertical: space.xl }}>
            <Icon name="car" size={26} color={c.ink3} />
            <Body dim>{t('veh.none')}</Body>
            <PrimaryButton
              label={t('veh.addDoc')}
              icon="camera"
              tone="light"
              onPress={() => nav.navigate('Vault')}
              style={{ alignSelf: 'stretch' }}
            />
          </Card>
        ) : (
          vehicleDocs.map((doc) => {
            const days = doc.expiryDate ? daysUntil(doc.expiryDate) : null;
            const failed = doc.ocrStatus === 'failed';

            return (
              <Card
                key={doc.id}
                onPress={() => nav.navigate('Document', { id: doc.id })}
                style={{ gap: space.md }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm + 2 }}>
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: radius.sm + 2,
                      backgroundColor: c.tileRustBg,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon name="car" size={18} color={c.tileRust} />
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
                      tone={days < 0 ? 'siren' : days <= 15 ? 'brass' : 'leaf'}
                    />
                  ) : null}
                </View>

                {failed ? (
                  <>
                    <View style={{ height: 1, backgroundColor: c.line2 }} />
                    <Body size={12.5} dim>
                      {t('doc.notAnalysed')}
                    </Body>
                  </>
                ) : doc.fields.length > 0 ? (
                  <>
                    <View style={{ height: 1, backgroundColor: c.line2 }} />
                    <View style={{ gap: space.sm }}>
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
          label={t('veh.askQuestion')}
          icon="chat"
          tone="light"
          onPress={() => nav.navigate('Assistant')}
        />
        <PrimaryButton label={t('veh.askAdvocate')} icon="scales" onPress={() => nav.navigate('Consult')} />

        <View style={{ height: space.lg }} />
      </View>
    </Screen>
  );
}
