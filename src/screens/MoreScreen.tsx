import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Text, View } from 'react-native';
import { Icon } from '../components/Icon';
import {
  AppHeader,
  Body,
  Card,
  Chip,
  GhostButton,
  ListRow,
  Mono,
  Screen,
  SectionLabel,
  Segmented,
} from '../components/ui';
import { formatDate, USER } from '../data/mock';
import { PlanCode } from '../data/types';
import { useLang } from '../i18n/LanguageProvider';
import { Nav } from '../navigation/types';
import { useApp } from '../state/AppState';
import { ThemeChoice, useTheme } from '../theme/ThemeProvider';
import { font, radius, space } from '../theme/tokens';

export function MoreScreen() {
  const { c, choice, setChoice } = useTheme();
  const { t, lang, setLang } = useLang();
  const nav = useNavigation<Nav>();
  const {
    plan,
    setPlan,
    profile,
    fraudCase,
    openFraudCase,
    closeFraudCase,
    resetOnboarding,
    consultsLeft,
    consultsGranted,
  } = useApp();

  const free = plan === 'FREE';

  return (
    <Screen scroll>
      <AppHeader title={t('more.title')} onBack={() => nav.goBack()} />

      <View style={{ paddingHorizontal: space.lg, gap: space.md }}>
        {/* ── plan. No price, no buy button: purchase happens on the web (FR-SUB-02). ── */}
        <Card style={{ gap: space.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text
                style={{
                  fontFamily: font.semibold,
                  fontSize: 10.5,
                  letterSpacing: 1.2,
                  textTransform: 'uppercase',
                  color: c.ink3,
                }}
              >
                {t('more.plan')}
              </Text>
              <Text style={{ fontFamily: font.display, fontSize: 24, lineHeight: 30, color: c.ink, marginTop: 2 }}>
                {free ? t('more.planFree') : plan}
              </Text>
            </View>
            {free ? null : (
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Mono size={10}>{`${t('more.renews')} ${formatDate(USER.renewsAt, lang)}`}</Mono>
                <Chip label={`${consultsLeft} / ${consultsGranted}`} tone="leaf" />
              </View>
            )}
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
            <Icon name="globe" size={14} color={c.ink3} />
            <Body size={11.5} dim>
              {t('more.managePlan')}
            </Body>
          </View>
        </Card>

        {/* ── account ── */}
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
            title={profile.name}
            sub={`${profile.city[lang]}, ${profile.state[lang]} · ${USER.phone}`}
            onPress={() => undefined}
          />
          <ListRow
            icon="users"
            title={t('more.family')}
            sub={`${USER.familyMembers} / ${USER.familySeats} ${t('more.familySub')}`}
            onPress={() => undefined}
          />
          <ListRow
            icon="book"
            title={t('more.guides')}
            sub={t('more.guidesSub')}
            onPress={() => nav.navigate('Guides')}
          />
          <ListRow
            icon="bell"
            title={t('more.notifications')}
            sub={t('more.notificationsSub')}
            onPress={() => undefined}
          />
          <ListRow
            icon="lock"
            iconTone="leaf"
            title={t('more.security')}
            sub={t('more.securitySub')}
            onPress={() => undefined}
            last
          />
        </View>

        {/* ── language and appearance ── */}
        <SectionLabel>{t('common.language')}</SectionLabel>
        <Segmented
          options={[
            { value: 'en', label: 'English' },
            { value: 'hi', label: 'हिंदी' },
          ]}
          value={lang}
          onChange={(next) => setLang(next as 'en' | 'hi')}
        />

        <SectionLabel>{t('more.theme')}</SectionLabel>
        <Segmented
          options={[
            { value: 'system', label: t('more.theme.system') },
            { value: 'light', label: t('more.theme.light') },
            { value: 'dark', label: t('more.theme.dark') },
          ]}
          value={choice}
          onChange={(next) => setChoice(next as ThemeChoice)}
        />

        {/* ── data rights (FR-AUTH-11, FR-VLT-17, FR-CMP-09) ── */}
        <View
          style={{
            backgroundColor: c.card,
            borderWidth: 1,
            borderColor: c.line,
            borderRadius: radius.lg,
            overflow: 'hidden',
            marginTop: space.xs,
          }}
        >
          <ListRow
            icon="download"
            title={t('more.export')}
            sub={t('more.exportSub')}
            onPress={() => undefined}
          />
          <ListRow icon="globe" title={t('more.privacy')} onPress={() => undefined} />
          <ListRow icon="user" title={t('more.grievance')} onPress={() => undefined} />
          <ListRow
            icon="trash"
            iconTone="siren"
            title={t('more.deleteAccount')}
            sub={t('more.deleteSub')}
            onPress={() => undefined}
            last
          />
        </View>

        {/* ── demo controls: this build has no backend ── */}
        <SectionLabel>{t('more.demoTitle')}</SectionLabel>
        <Card style={{ gap: space.md, borderStyle: 'dashed' }}>
          <Body size={12}>{t('more.demoBody')}</Body>

          <View style={{ gap: 6 }}>
            <Text
              style={{
                fontFamily: font.semibold,
                fontSize: 10,
                letterSpacing: 1,
                textTransform: 'uppercase',
                color: c.ink3,
              }}
            >
              {t('more.demo.plan')}
            </Text>
            <Segmented
              options={[
                { value: 'FREE', label: 'FREE' },
                { value: 'SHIELD', label: 'SHIELD' },
                { value: 'FAMILY', label: 'FAMILY' },
              ]}
              value={plan}
              onChange={(next) => setPlan(next as PlanCode)}
            />
          </View>

          <View style={{ gap: 6 }}>
            <Text
              style={{
                fontFamily: font.semibold,
                fontSize: 10,
                letterSpacing: 1,
                textTransform: 'uppercase',
                color: c.ink3,
              }}
            >
              {t('more.demo.case')}
            </Text>
            <Segmented
              options={[
                { value: 'off', label: t('more.demo.off') },
                { value: 'on', label: t('more.demo.on') },
              ]}
              value={fraudCase ? 'on' : 'off'}
              onChange={(next) => (next === 'on' ? openFraudCase() : closeFraudCase())}
            />
          </View>

          <GhostButton label={t('more.demo.reset')} icon="chevronLeft" onPress={resetOnboarding} />
        </Card>

        <View style={{ alignItems: 'center', paddingTop: space.sm }}>
          <Mono size={10}>Nyaya Kavach · frontend build · scope v1.0</Mono>
        </View>
        <View style={{ height: space.lg }} />
      </View>
    </Screen>
  );
}
