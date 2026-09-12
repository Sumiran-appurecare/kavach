import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { checkArtefact, retrieve } from '../data/engine';
import { DEMO_ADVOCATE, LIBRARY, OPEN_CASE, USER, VAULT_DOCS } from '../data/mock';
import {
  ArtefactType,
  ChatMessage,
  ConsultCategory,
  Consultation,
  EvidenceItem,
  FraudCase,
  L,
  PlanCode,
  ScamResult,
  VaultDoc,
} from '../data/types';

/** Consultations granted per plan per year (FR-SUB-04). Free gets none. */
const GRANTED: Record<PlanCode, number> = { FREE: 0, SHIELD: 2, FAMILY: 5 };

/** Scam checks a free user gets per calendar month (FR-SUB-07). */
export const FREE_SCAM_CHECKS = 3;

type Profile = { name: string; city: L; state: L };

type AppValue = {
  onboarded: boolean;
  finishOnboarding: () => void;
  resetOnboarding: () => void;

  plan: PlanCode;
  setPlan: (plan: PlanCode) => void;

  profile: Profile;
  setProfile: (profile: Profile) => void;

  /** Consultations granted and used this period. */
  consultsGranted: number;
  consultsUsed: number;
  consultsLeft: number;

  docs: VaultDoc[];

  scamChecksUsed: number;
  scamChecksLeft: number | 'unlimited';
  scamHistory: ScamResult[];
  runScamCheck: (type: ArtefactType, artefact: string) => ScamResult;
  reportScam: (id: string) => void;
  reportedScamIds: string[];

  fraudCase: FraudCase | null;
  openFraudCase: () => void;
  closeFraudCase: () => void;
  setAck: (which: 'bank' | 'portal', ackNo: string) => void;
  addEvidence: (kind: L) => void;
  markLetterSent: () => void;
  toggleFollowup: (id: string) => void;

  chat: ChatMessage[];
  askAssistant: (text: string) => void;
  clearChat: () => void;

  consultation: Consultation | null;
  startConsultation: (description: string, category: ConsultCategory) => void;
  acceptEngagement: () => void;
  allocateAdvocate: () => void;
  reassignAdvocate: () => void;
  endConsultation: () => void;
};

const AppContext = createContext<AppValue | null>(null);

let idSeq = 0;
const nextId = (prefix: string) => `${prefix}-${++idSeq}-${Date.now()}`;

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  /**
   * The app opens on Home so a reviewer lands on the screen under discussion.
   * A real first run starts at `false` and walks the onboarding flow — flip it
   * back before shipping; the flow itself is reachable from More → Replay
   * onboarding either way.
   */
  const [onboarded, setOnboarded] = useState(true);
  const [plan, setPlan] = useState<PlanCode>('SHIELD');
  const [profile, setProfile] = useState<Profile>({
    name: USER.name,
    city: USER.city,
    state: USER.state,
  });

  const [docs] = useState<VaultDoc[]>(VAULT_DOCS);

    /** One past check, so the Safety Center has something real to show on a
   *  first open. It runs through the same engine as any other check. */
  const [scamChecksUsed, setScamChecksUsed] = useState(1);
  const [scamHistory, setScamHistory] = useState<ScamResult[]>(() => [
    { ...checkArtefact('phone', '+91 98765 43210'), at: Date.now() - 2 * 60 * 60 * 1000 },
  ]);
  const [reportedScamIds, setReportedScamIds] = useState<string[]>([]);

  const [fraudCase, setFraudCase] = useState<FraudCase | null>(null);
  const [consultsUsed, setConsultsUsed] = useState(0);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [consultation, setConsultation] = useState<Consultation | null>(null);

  const consultsGranted = GRANTED[plan];
  const consultsLeft = Math.max(0, consultsGranted - consultsUsed);

  const scamChecksLeft: number | 'unlimited' =
    plan === 'FREE' ? Math.max(0, FREE_SCAM_CHECKS - scamChecksUsed) : 'unlimited';

  const runScamCheck = useCallback(
    (type: ArtefactType, artefact: string) => {
      const result = checkArtefact(type, artefact);
      setScamHistory((prev) => [result, ...prev].slice(0, 12));
      setScamChecksUsed((n) => n + 1);
      return result;
    },
    [],
  );

  const reportScam = useCallback((id: string) => {
    setReportedScamIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const openFraudCase = useCallback(() => setFraudCase({ ...OPEN_CASE }), []);
  const closeFraudCase = useCallback(() => setFraudCase(null), []);

  const setAck = useCallback((which: 'bank' | 'portal', ackNo: string) => {
    setFraudCase((prev) => {
      if (!prev) return prev;
      return which === 'bank'
        ? { ...prev, bankAckNo: ackNo, bankReportedAt: new Date().toISOString() }
        : { ...prev, portalAckNo: ackNo, portalReportedAt: new Date().toISOString() };
    });
  }, []);

  /** Evidence is append-only: there is deliberately no edit or remove action (FR-EMG-07). */
  const addEvidence = useCallback((kind: L) => {
    setFraudCase((prev) => {
      if (!prev) return prev;
      const item: EvidenceItem = {
        id: nextId('ev'),
        kind,
        sha256: Array.from({ length: 64 }, (_, i) => 'abcdef0123456789'[(Date.now() + i * 7) % 16]).join(''),
        capturedAt: new Date().toISOString(),
      };
      return { ...prev, evidence: [...prev.evidence, item] };
    });
  }, []);

  const markLetterSent = useCallback(() => {
    setFraudCase((prev) => (prev ? { ...prev, letterSent: true } : prev));
  }, []);

  const toggleFollowup = useCallback((id: string) => {
    setFraudCase((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        followups: prev.followups.map((f) => (f.id === id ? { ...f, done: !f.done } : f)),
      };
    });
  }, []);

  const askAssistant = useCallback((text: string) => {
    const userMsg: ChatMessage = { id: nextId('u'), role: 'user', text };
    const typing: ChatMessage = { id: 'typing', role: 'typing' };
    setChat((prev) => [...prev, userMsg, typing]);

    const { entry } = retrieve(text);
    setTimeout(() => {
      setChat((prev) => [
        ...prev.filter((m) => m.role !== 'typing'),
        { id: nextId('a'), role: 'assistant', entry },
      ]);
    }, 700);
  }, []);

  const clearChat = useCallback(() => setChat([]), []);

  const startConsultation = useCallback((description: string, category: ConsultCategory) => {
    setConsultation({
      id: nextId('con'),
      stage: 'consent',
      description,
      category,
      reassignedOnce: false,
    });
  }, []);

  /** No advocate is contacted before this consent exists (FR-CMP-06). */
  const acceptEngagement = useCallback(() => {
    setConsultation((prev) =>
      prev ? { ...prev, stage: 'allocating', consentAt: new Date().toISOString() } : prev,
    );
  }, []);

  const allocateAdvocate = useCallback(() => {
    setConsultation((prev) => {
      if (!prev || prev.consentAt === undefined) return prev;
      return { ...prev, stage: 'allocated', advocate: DEMO_ADVOCATE };
    });
    setConsultsUsed((n) => n + 1);
  }, []);

  /** One free swap per matter, and it must not burn a second entitlement (FR-CON-14). */
  const reassignAdvocate = useCallback(() => {
    setConsultation((prev) =>
      prev && !prev.reassignedOnce ? { ...prev, stage: 'allocating', reassignedOnce: true } : prev,
    );
  }, []);

  const endConsultation = useCallback(() => setConsultation(null), []);

  const finishOnboarding = useCallback(() => setOnboarded(true), []);
  const resetOnboarding = useCallback(() => setOnboarded(false), []);

  const value = useMemo<AppValue>(
    () => ({
      onboarded,
      finishOnboarding,
      resetOnboarding,
      plan,
      setPlan,
      profile,
      setProfile,
      consultsGranted,
      consultsUsed,
      consultsLeft,
      docs,
      scamChecksUsed,
      scamChecksLeft,
      scamHistory,
      runScamCheck,
      reportScam,
      reportedScamIds,
      fraudCase,
      openFraudCase,
      closeFraudCase,
      setAck,
      addEvidence,
      markLetterSent,
      toggleFollowup,
      chat,
      askAssistant,
      clearChat,
      consultation,
      startConsultation,
      acceptEngagement,
      allocateAdvocate,
      reassignAdvocate,
      endConsultation,
    }),
    [
      onboarded,
      finishOnboarding,
      resetOnboarding,
      plan,
      profile,
      consultsGranted,
      consultsUsed,
      consultsLeft,
      docs,
      scamChecksUsed,
      scamChecksLeft,
      scamHistory,
      runScamCheck,
      reportScam,
      reportedScamIds,
      fraudCase,
      openFraudCase,
      closeFraudCase,
      setAck,
      addEvidence,
      markLetterSent,
      toggleFollowup,
      chat,
      askAssistant,
      clearChat,
      consultation,
      startConsultation,
      acceptEngagement,
      allocateAdvocate,
      reassignAdvocate,
      endConsultation,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppValue {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppStateProvider');
  return value;
}

/** Library entries the Guides screen lists (approved entries only). */
export const GUIDES = LIBRARY.filter((e) => !e.escalate);
