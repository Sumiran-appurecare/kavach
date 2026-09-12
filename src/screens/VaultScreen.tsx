import { useNavigation } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon, IconName } from '../components/Icon';
import { AppHeader, Body, Field, Mono, PrimaryButton, Screen, SectionLabel } from '../components/ui';
import { daysUntil, formatDate } from '../data/mock';
import { VaultCategory, VaultDoc } from '../data/types';
import { useLang } from '../i18n/LanguageProvider';
import { StringKey } from '../i18n/strings';
import { Nav } from '../navigation/types';
import { useApp } from '../state/AppState';
import { useTheme } from '../theme/ThemeProvider';
import { font, radius, space } from '../theme/tokens';

const CATEGORIES: { key: VaultCategory; label: StringKey; icon: IconName }[] = [
  { key: 'identity', label: 'vault.cat.identity', icon: 'user' },
  { key: 'property', label: 'vault.cat.property', icon: 'home' },
  { key: 'financial', label: 'vault.cat.financial', icon: 'bank' },
  { key: 'insurance', label: 'vault.cat.insurance', icon: 'shield' },
  { key: 'family', label: 'vault.cat.family', icon: 'users' },
  { key: 'vehicle', label: 'vault.cat.vehicle', icon: 'card' },
  { key: 'contracts', label: 'vault.cat.contracts', icon: 'doc' },
  { key: 'business', label: 'vault.cat.business', icon: 'book' },
];

export function VaultScreen() {
  const { c } = useTheme();
  const { t } = useLang();
  const nav = useNavigation<Nav>();
  const { docs, plan } = useApp();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<VaultCategory | null>(null);

  /**
   * Search runs here, on already-decrypted metadata, never as a server query —
   * the server holds ciphertext and could not answer this (FR-VLT-07).
   */
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return docs.filter((d) => {
      if (category && d.category !== category) return false;
      if (!q) return true;
      const haystack = [d.title.en, d.title.hi, ...d.fields.map((f) => f.value)].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [docs, query, category]);

  const usedMb = docs.reduce((sum, d) => sum + d.sizeKb, 0) / 1024;
  const capMb = plan === 'FREE' ? 100 : 5120;

  return (
    <Screen scroll>
      <AppHeader title={t('vault.title')} onBack={() => nav.goBack()} />

      <View style={{ paddingHorizontal: space.lg, gap: space.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Icon name="lock" size={14} color={c.leaf} />
          <Body size={12} dim>
            {t('vault.subtitle')}
          </Body>
        </View>

        <PrimaryButton label={t('vault.add')} icon="camera" onPress={() => undefined} />

        <Field value={query} onChangeText={setQuery} placeholder={t('vault.search')} />

        <SectionLabel>{t('vault.categories')}</SectionLabel>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          {CATEGORIES.map((cat) => {
            const count = docs.filter((d) => d.category === cat.key).length;
            const active = category === cat.key;
            return (
              <Pressable
                key={cat.key}
                onPress={() => setCategory(active ? null : cat.key)}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 7,
                  paddingHorizontal: space.md - 1,
                  paddingVertical: space.sm + 1,
                  borderRadius: radius.pill,
                  borderWidth: 1,
                  borderColor: active ? 'transparent' : c.line,
                  backgroundColor: active ? c.forest : c.card,
                }}
              >
                <Icon name={cat.icon} size={14} color={active ? c.onForest : c.ink3} />
                <Text
                  style={{
                    fontFamily: font.medium,
                    fontSize: 12.5,
                    color: active ? c.onForest : c.ink,
                  }}
                >
                  {t(cat.label)}
                </Text>
                <Text
                  style={{
                    fontFamily: font.monoMedium,
                    fontSize: 10,
                    color: active ? c.onForestDim : c.ink3,
                  }}
                >
                  {count}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <SectionLabel>{category ? t(CATEGORIES.find((x) => x.key === category)!.label) : t('vault.recent')}</SectionLabel>

        {results.length === 0 ? (
          <View style={{ paddingVertical: space.xl, alignItems: 'center' }}>
            <Body dim>{t('vault.empty')}</Body>
          </View>
        ) : (
          <View
            style={{
              backgroundColor: c.card,
              borderWidth: 1,
              borderColor: c.line,
              borderRadius: radius.lg,
              overflow: 'hidden',
            }}
          >
            {results.map((doc, i) => (
              <DocRow
                key={doc.id}
                doc={doc}
                last={i === results.length - 1}
                onPress={() => nav.navigate('Document', { id: doc.id })}
              />
            ))}
          </View>
        )}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: space.sm,
          }}
        >
          <Body size={12} dim>
            {t('vault.storage')}
          </Body>
          <Mono size={11}>{`${usedMb.toFixed(1)} MB / ${capMb >= 1024 ? `${capMb / 1024} GB` : `${capMb} MB`}`}</Mono>
        </View>
        <View style={{ height: space.lg }} />
      </View>
    </Screen>
  );
}

function DocRow({ doc, last, onPress }: { doc: VaultDoc; last: boolean; onPress: () => void }) {
  const { c } = useTheme();
  const { t, lang } = useLang();
  const days = doc.expiryDate ? daysUntil(doc.expiryDate) : null;

  const badge =
    days === null
      ? null
      : days < 0
        ? { text: t('doc.expired'), bg: c.siren, fg: c.onSiren }
        : days <= 30
          ? { text: `${days}d`, bg: c.brassBg, fg: c.brass }
          : { text: `${days}d`, bg: c.leafBg, fg: c.leaf };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md,
        paddingHorizontal: space.lg,
        paddingVertical: space.md,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: c.line2,
        backgroundColor: pressed ? c.card2 : 'transparent',
      })}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: radius.sm + 2,
          backgroundColor: c.card2,
          borderWidth: 1,
          borderColor: c.line,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={doc.ocrStatus === 'failed' ? 'alert' : 'doc'} size={17} color={doc.ocrStatus === 'failed' ? c.brass : c.ink2} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontFamily: font.medium, fontSize: 14, color: c.ink }} numberOfLines={1}>
          {doc.title[lang]}
        </Text>
        <Text style={{ fontFamily: font.mono, fontSize: 10, color: c.ink3, marginTop: 2 }} numberOfLines={1}>
          {doc.ocrStatus === 'failed'
            ? t('doc.notAnalysed')
            : `${t('doc.added')} ${formatDate(doc.addedAt, lang)}`}
        </Text>
      </View>
      {badge ? (
        <View
          style={{
            backgroundColor: badge.bg,
            borderRadius: radius.sm - 2,
            paddingHorizontal: space.sm,
            paddingVertical: 4,
          }}
        >
          <Text style={{ fontFamily: font.monoSemibold, fontSize: 10, color: badge.fg }}>{badge.text}</Text>
        </View>
      ) : null}
      <Icon name="chevronRight" size={16} color={c.ink3} />
    </Pressable>
  );
}
