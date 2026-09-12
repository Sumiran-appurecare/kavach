import { Lang } from '../i18n/strings';

/** A string that exists in both languages. Screens read `value[lang]`. */
export type L = { en: string; hi: string };

export function pick(value: L, lang: Lang): string {
  return value[lang];
}

export type PlanCode = 'FREE' | 'SHIELD' | 'FAMILY';

export type VaultCategory =
  | 'identity'
  | 'property'
  | 'financial'
  | 'insurance'
  | 'family'
  | 'vehicle'
  | 'contracts'
  | 'business';

export type OcrStatus = 'done' | 'failed' | 'pending';

export type ExtractedField = { label: L; value: string; mono?: boolean };

export type VaultDoc = {
  id: string;
  title: L;
  category: VaultCategory;
  /** ISO date the document stops being valid, when one was found. */
  expiryDate?: string;
  addedAt: string;
  sizeKb: number;
  ocrStatus: OcrStatus;
  fields: ExtractedField[];
  /** Descriptive only — states what the document says, never what to do (FR-DOC-05). */
  explanation?: L;
};

export type Verdict = 'safe' | 'suspicious' | 'dangerous';

export type ArtefactType = 'sms' | 'url' | 'upi' | 'phone' | 'image';

export type ScamResult = {
  id: string;
  type: ArtefactType;
  artefact: string;
  verdict: Verdict;
  /** 0–1 */
  confidence: number;
  reasons: L[];
  steps: L[];
  at: number;
};

export type LibraryEntry = {
  id: string;
  slug: string;
  version: number;
  question: L;
  answer: L;
  /** Present when the library has nothing good enough and the answer is an escalation. */
  escalate?: boolean;
};

export type ChatMessage =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'assistant'; entry: LibraryEntry }
  | { id: string; role: 'typing' };

export type Followup = {
  id: string;
  day: number;
  label: L;
  dueAt: string;
  done: boolean;
};

export type EvidenceItem = {
  id: string;
  kind: L;
  sha256: string;
  capturedAt: string;
};

export type FraudCase = {
  id: string;
  amountPaise: number;
  channel: L;
  bankName: string;
  incidentAt: string;
  /** incidentAt + 5 calendar days (FR-EMG-04) */
  windowExpiresAt: string;
  bankAckNo?: string;
  bankReportedAt?: string;
  portalAckNo?: string;
  portalReportedAt?: string;
  evidence: EvidenceItem[];
  followups: Followup[];
  letterSent: boolean;
};

export type ConsultCategory =
  | 'property'
  | 'family'
  | 'consumer'
  | 'employment'
  | 'cyber'
  | 'other';

export type ConsultStage = 'describe' | 'consent' | 'allocating' | 'allocated';

export type Advocate = {
  name: string;
  enrolmentNo: string;
  barCouncil: L;
  practiceAreas: L[];
  languages: L[];
  district: L;
};

export type Consultation = {
  id: string;
  stage: ConsultStage;
  description: string;
  category: ConsultCategory;
  consentAt?: string;
  /** Only ever populated after the advocate accepts (FR-CON-07). */
  advocate?: Advocate;
  reassignedOnce: boolean;
};
