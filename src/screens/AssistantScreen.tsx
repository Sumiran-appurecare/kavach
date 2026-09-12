import { useNavigation } from '@react-navigation/native';
import React, { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Icon } from '../components/Icon';
import {
  AppHeader,
  Body,
  Card,
  InfoDisclaimer,
  OtpNotice,
  PrimaryButton,
  ThemedStatusBar,
} from '../components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatMessage, LibraryEntry } from '../data/types';
import { useLang } from '../i18n/LanguageProvider';
import { StringKey } from '../i18n/strings';
import { Nav } from '../navigation/types';
import { useApp } from '../state/AppState';
import { useTheme } from '../theme/ThemeProvider';
import { font, radius, space } from '../theme/tokens';

const SUGGESTIONS: StringKey[] = ['ai.suggest1', 'ai.suggest2', 'ai.suggest3'];

/**
 * The assistant is a retrieval interface over advocate-approved content, not a
 * general chatbot (FR-AIA-02). Every answer cites the library entry and version
 * it came from (FR-AIA-03); where nothing matches, it says so and offers an
 * advocate instead of generating an answer.
 */
export function AssistantScreen() {
  const { c } = useTheme();
  const { t } = useLang();
  const insets = useSafeAreaInsets();
  const nav = useNavigation<Nav>();
  const { chat, askAssistant, clearChat } = useApp();
  const [draft, setDraft] = useState('');
  const scroller = useRef<ScrollView>(null);

  function send(text: string) {
    const value = text.trim();
    if (!value) return;
    askAssistant(value);
    setDraft('');
    setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 60);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: c.paper, paddingTop: insets.top + space.sm }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ThemedStatusBar />
      <AppHeader
        title={t('ai.title')}
        onBack={() => nav.goBack()}
        right={
          chat.length > 0 ? (
            <Pressable onPress={clearChat} hitSlop={8}>
              <Icon name="trash" size={18} color={c.ink3} />
            </Pressable>
          ) : undefined
        }
      />

      <ScrollView
        ref={scroller}
        contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: space.lg, gap: space.md }}
        keyboardShouldPersistTaps="handled"
      >
        {chat.length === 0 ? (
          <>
            <Card style={{ gap: space.md }}>
              <Body size={13.5}>{t('ai.intro')}</Body>
              <InfoDisclaimer />
            </Card>
            <View style={{ gap: space.sm }}>
              {SUGGESTIONS.map((key) => (
                <Pressable
                  key={key}
                  onPress={() => send(t(key))}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: space.sm + 2,
                    backgroundColor: pressed ? c.card2 : c.card,
                    borderWidth: 1,
                    borderColor: c.line,
                    borderRadius: radius.md,
                    paddingHorizontal: space.md,
                    paddingVertical: space.md - 1,
                  })}
                >
                  <Icon name="chat" size={16} color={c.ink3} />
                  <Text style={{ flex: 1, fontFamily: font.medium, fontSize: 13.5, color: c.ink }}>{t(key)}</Text>
                  <Icon name="chevronRight" size={16} color={c.ink3} />
                </Pressable>
              ))}
            </View>
          </>
        ) : (
          chat.map((message) => <Message key={message.id} message={message} />)
        )}
      </ScrollView>

      <View
        style={{
          paddingHorizontal: space.lg,
          paddingTop: space.sm,
          paddingBottom: insets.bottom > 0 ? space.sm : space.md,
          gap: space.sm,
          borderTopWidth: 1,
          borderTopColor: c.line,
          backgroundColor: c.card,
        }}
      >
        <OtpNotice />
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: space.sm }}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={t('ai.placeholder')}
            placeholderTextColor={c.ink3}
            multiline
            style={{
              flex: 1,
              maxHeight: 110,
              backgroundColor: c.paper,
              borderWidth: 1,
              borderColor: c.line,
              borderRadius: radius.md,
              paddingHorizontal: space.md,
              paddingVertical: space.sm + 3,
              fontFamily: font.regular,
              fontSize: 15,
              color: c.ink,
            }}
          />
          <Pressable
            onPress={() => send(draft)}
            disabled={!draft.trim()}
            accessibilityRole="button"
            accessibilityLabel={t('ai.send')}
            style={{
              width: 46,
              height: 46,
              borderRadius: radius.md,
              backgroundColor: draft.trim() ? c.forest : c.card2,
              borderWidth: draft.trim() ? 0 : 1,
              borderColor: c.line,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="chevronRight" size={20} color={draft.trim() ? c.onForest : c.ink3} />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function Message({ message }: { message: ChatMessage }) {
  const { c } = useTheme();
  const { t } = useLang();

  if (message.role === 'user') {
    return (
      <View
        style={{
          alignSelf: 'flex-end',
          maxWidth: '85%',
          backgroundColor: c.forest,
          borderRadius: radius.lg,
          borderBottomRightRadius: radius.sm,
          paddingHorizontal: space.md,
          paddingVertical: space.sm + 3,
        }}
      >
        <Text style={{ fontFamily: font.regular, fontSize: 14.5, lineHeight: 21, color: c.onForest }}>
          {message.text}
        </Text>
      </View>
    );
  }

  if (message.role === 'typing') {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <Icon name="book" size={15} color={c.ink3} />
        <Text style={{ fontFamily: font.regular, fontSize: 12.5, color: c.ink3 }}>{t('ai.typing')}</Text>
      </View>
    );
  }

  return message.entry.escalate ? <Escalation /> : <Answer entry={message.entry} />;
}

function Answer({ entry }: { entry: LibraryEntry }) {
  const { c } = useTheme();
  const { t, lang } = useLang();
  return (
    <Card style={{ gap: space.md }}>
      <Text style={{ fontFamily: font.regular, fontSize: 14.5, lineHeight: 23, color: c.ink }}>
        {entry.answer[lang]}
      </Text>
      <View style={{ height: 1, backgroundColor: c.line2 }} />
      {/* Citation, so what a user was told can always be reconstructed (FR-AIA-03). */}
      <View style={{ gap: 4 }}>
        <Text style={{ fontFamily: font.monoMedium, fontSize: 10, color: c.ink3 }}>
          {`${t('ai.source')} · ${entry.slug} · v${entry.version}`}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Icon name="checkCircle" size={13} color={c.leaf} />
          <Text style={{ fontFamily: font.medium, fontSize: 11, color: c.leaf }}>{t('ai.approvedBy')}</Text>
        </View>
      </View>
      <InfoDisclaimer />
    </Card>
  );
}

function Escalation() {
  const { c } = useTheme();
  const { t } = useLang();
  const nav = useNavigation<Nav>();
  return (
    <Card style={{ gap: space.md, borderColor: c.brass }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
        <Icon name="scales" size={17} color={c.brass} />
        <Text style={{ fontFamily: font.semibold, fontSize: 14.5, color: c.ink }}>{t('ai.escalate')}</Text>
      </View>
      <Body size={13}>{t('ai.escalateBody')}</Body>
      <PrimaryButton label={t('ai.talkToAdvocate')} icon="scales" onPress={() => nav.navigate('Consult')} />
    </Card>
  );
}
