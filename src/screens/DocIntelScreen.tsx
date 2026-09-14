import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View } from 'react-native';
import { Icon } from '../components/Icon';
import { AppHeader, Body, Card, ListRow, PrimaryButton, Screen, SectionLabel } from '../components/ui';
import { formatDate } from '../data/mock';
import { useLang } from '../i18n/LanguageProvider';
import { Nav } from '../navigation/types';
import { useApp } from '../state/AppState';
import { useTheme } from '../theme/ThemeProvider';
import { radius, space } from '../theme/tokens';

/**
 * Document Intelligence. A reading list over the vault, not a second copy of
 * it: every document that has been explained, and everything still waiting
 * to be. Tapping a row opens the same Document screen the Vault uses — the
 * explanation itself lives there (FR-DOC-04/05/06), this is just the front
 * door for "help me understand what I have."
 */
export function DocIntelScreen() {
  const { c } = useTheme();
  const { t, lang } = useLang();
  const nav = useNavigation<Nav>();
  const { docs } = useApp();

  const explained = docs.filter((d) => d.explanation);
  const pending = docs.filter((d) => !d.explanation);

  return (
    <Screen scroll>
      <AppHeader title={t('doci.title')} onBack={() => nav.goBack()} />

      <View style={{ paddingHorizontal: space.lg, gap: space.md }}>
        <Body size={13.5}>{t('doci.lead')}</Body>

        {docs.length === 0 ? (
          <Card style={{ gap: space.md, alignItems: 'center', paddingVertical: space.xl }}>
            <Icon name="docSearch" size={26} color={c.ink3} />
            <Body dim>{t('doci.none')}</Body>
            <PrimaryButton
              label={t('doci.addDoc')}
              icon="camera"
              tone="light"
              onPress={() => nav.navigate('Vault')}
              style={{ alignSelf: 'stretch' }}
            />
          </Card>
        ) : (
          <>
            {explained.length > 0 ? (
              <>
                <SectionLabel>{t('doci.explained')}</SectionLabel>
                <View
                  style={{
                    backgroundColor: c.card,
                    borderWidth: 1,
                    borderColor: c.line,
                    borderRadius: radius.lg,
                    overflow: 'hidden',
                  }}
                >
                  {explained.map((doc, i) => (
                    <ListRow
                      key={doc.id}
                      icon="docSearch"
                      title={doc.title[lang]}
                      sub={`${t('doc.added')} ${formatDate(doc.addedAt, lang)}`}
                      onPress={() => nav.navigate('Document', { id: doc.id })}
                      last={i === explained.length - 1}
                    />
                  ))}
                </View>
              </>
            ) : null}

            {pending.length > 0 ? (
              <>
                <SectionLabel>{t('doci.pending')}</SectionLabel>
                <View
                  style={{
                    backgroundColor: c.card,
                    borderWidth: 1,
                    borderColor: c.line,
                    borderRadius: radius.lg,
                    overflow: 'hidden',
                  }}
                >
                  {pending.map((doc, i) => (
                    <ListRow
                      key={doc.id}
                      icon={doc.ocrStatus === 'failed' ? 'alert' : 'doc'}
                      iconTone={doc.ocrStatus === 'failed' ? 'brass' : 'plain'}
                      title={doc.title[lang]}
                      sub={doc.ocrStatus === 'failed' ? t('doc.notAnalysed') : t('doci.extracted')}
                      onPress={() => nav.navigate('Document', { id: doc.id })}
                      last={i === pending.length - 1}
                    />
                  ))}
                </View>
              </>
            ) : null}
          </>
        )}

        <PrimaryButton label={t('doci.addDoc')} icon="camera" tone="light" onPress={() => nav.navigate('Vault')} />

        <View style={{ height: space.lg }} />
      </View>
    </Screen>
  );
}
