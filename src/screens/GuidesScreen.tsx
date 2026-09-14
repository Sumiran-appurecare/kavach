import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon } from '../components/Icon';
import { AppHeader, Body, InfoDisclaimer, Mono, Screen, SectionLabel } from '../components/ui';
import { useLang } from '../i18n/LanguageProvider';
import { Nav } from '../navigation/types';
import { GUIDES } from '../state/AppState';
import { useTheme } from '../theme/ThemeProvider';
import { font, leading, radius, space } from '../theme/tokens';

/**
 * The Content Library, read-only for subscribers. Only approved entries are
 * servable (FR-LIB-02), and each one shows the version it is serving so what a
 * user read can be reconstructed later.
 */
export function GuidesScreen() {
  const { c } = useTheme();
  const { t, lang } = useLang();
  const nav = useNavigation<Nav>();
  const [open, setOpen] = useState<string | null>(GUIDES[0]?.id ?? null);

  return (
    <Screen scroll>
      <AppHeader title={t('more.guides')} onBack={() => nav.goBack()} />

      <View style={{ paddingHorizontal: space.lg, gap: space.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Icon name="checkCircle" size={14} color={c.leaf} />
          <Body size={12} dim>
            {t('ai.approvedBy')}
          </Body>
        </View>

        <SectionLabel>{`${GUIDES.length} ${t('more.guidesSub')}`}</SectionLabel>

        <View style={{ gap: space.sm }}>
          {GUIDES.map((entry) => {
            const expanded = open === entry.id;
            return (
              <View
                key={entry.id}
                style={{
                  backgroundColor: c.card,
                  borderWidth: 1,
                  borderColor: expanded ? c.leaf : c.line,
                  borderRadius: radius.lg,
                  overflow: 'hidden',
                }}
              >
                <Pressable
                  onPress={() => setOpen(expanded ? null : entry.id)}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: space.md,
                    padding: space.lg,
                    backgroundColor: pressed ? c.card2 : 'transparent',
                  })}
                >
                  <Text style={{ flex: 1, fontFamily: font.semibold, fontSize: 14.5, lineHeight: leading(14.5), color: c.ink }}>
                    {entry.question[lang]}
                  </Text>
                  <Icon name={expanded ? 'chevronDown' : 'chevronRight'} size={17} color={c.ink3} />
                </Pressable>

                {expanded ? (
                  <View
                    style={{
                      paddingHorizontal: space.lg,
                      paddingBottom: space.lg,
                      gap: space.md,
                      borderTopWidth: 1,
                      borderTopColor: c.line2,
                      paddingTop: space.md,
                    }}
                  >
                    <Text style={{ fontFamily: font.regular, fontSize: 14, lineHeight: 22, color: c.ink }}>
                      {entry.answer[lang]}
                    </Text>
                    <Mono size={10}>{`${t('ai.source')} · ${entry.slug} · v${entry.version}`}</Mono>
                    <InfoDisclaimer />
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>

        <View style={{ height: space.lg }} />
      </View>
    </Screen>
  );
}
