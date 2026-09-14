import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View } from 'react-native';
import { AppHeader, ListRow, Screen, SectionLabel } from '../components/ui';
import { useLang } from '../i18n/LanguageProvider';
import { Nav } from '../navigation/types';
import { useApp } from '../state/AppState';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';

/**
 * Every feature in one list, plus the way into settings. The home screen shows
 * six of these as tiles; this is the complete set, so nothing is only reachable
 * from a tile.
 */
export function ServicesScreen() {
  const { c } = useTheme();
  const { t } = useLang();
  const nav = useNavigation<Nav>();
  const { docs, consultsLeft, plan, scamChecksLeft } = useApp();
  const free = plan === 'FREE';

  return (
    <Screen scroll>
      <AppHeader title={t('services.title')} />

      <View style={{ paddingHorizontal: space.lg, gap: space.md }}>
        <SectionLabel>{t('services.all')}</SectionLabel>
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
            icon="scan"
            iconTone="leaf"
            title={t('f.scam')}
            sub={scamChecksLeft === 'unlimited' ? t('scm.unlimited') : `${scamChecksLeft} ${t('scm.left')}`}
            onPress={() => nav.navigate('Safety')}
          />
          <ListRow
            icon="vault"
            title={t('f.vault')}
            sub={`${docs.length} ${t('f.vault.meta')}`}
            onPress={() => nav.navigate('Vault')}
          />
          <ListRow
            icon="docSearch"
            title={t('f.docIntel')}
            sub={t('f.docIntel.desc')}
            onPress={() => nav.navigate('Vault')}
          />
          <ListRow
            icon="chat"
            title={t('f.aiAssistant')}
            sub={t('common.aiDisclaimer')}
            onPress={() => nav.navigate('Assistant')}
          />
          <ListRow
            icon="scales"
            iconTone="brass"
            title={t('f.advocateConsult')}
            sub={free ? t('f.advocate.metaFree') : `${consultsLeft} ${t('con.entitlement.left')}`}
            onPress={() => nav.navigate('Consult')}
          />
          <ListRow
            icon="cover"
            iconTone="brass"
            title={t('f.insurance')}
            sub={t('f.insurance.desc')}
            onPress={() => nav.navigate('Insurance')}
          />
          <ListRow
            icon="car"
            title={t('f.vehicle')}
            sub={t('f.vehicle.sub')}
            onPress={() => nav.navigate('Vault')}
          />
          <ListRow
            icon="evidence"
            title={t('f.evidence')}
            sub={t('f.evidence.desc')}
            onPress={() => nav.navigate('Cases')}
          />
          <ListRow
            icon="alert"
            iconTone="siren"
            title={t('emg.screen.title')}
            sub={t('emg.connect.sub')}
            onPress={() => nav.navigate('Emergency')}
          />
          <ListRow
            icon="book"
            title={t('more.guides')}
            sub={t('more.guidesSub')}
            onPress={() => nav.navigate('Guides')}
            last
          />
        </View>

        <SectionLabel>{t('services.account')}</SectionLabel>
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
            icon="user"
            title={t('services.settings')}
            sub={t('services.settingsSub')}
            onPress={() => nav.navigate('More')}
            last
          />
        </View>

        <View style={{ height: space.lg }} />
      </View>
    </Screen>
  );
}
