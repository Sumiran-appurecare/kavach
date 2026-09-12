/**
 * Local stand-ins for two server-side services, so the frontend is genuinely
 * usable without a backend:
 *
 *  - `checkArtefact` scores a pasted artefact the way the Scam Check service
 *    would (FR-SCM-03/04/05). The signals are real; a production build adds
 *    URL reputation, domain age, the community database and screenshot OCR.
 *  - `retrieve` picks a Content Library entry for a question, and escalates
 *    rather than inventing an answer when nothing matches (FR-AIA-02).
 */

import { LIBRARY } from './mock';
import { ArtefactType, L, LibraryEntry, ScamResult, Verdict } from './types';

// ── Scam Check ────────────────────────────────────────────────────────

const SHORTENERS = ['bit.ly', 'tinyurl.com', 't.co', 'rb.gy', 'cutt.ly', 'is.gd', 'shorturl.at', 'rebrand.ly'];

const RISKY_TLDS = ['.xyz', '.top', '.info', '.online', '.site', '.club', '.live', '.cfd', '.buzz', '.icu', '.rest', '.shop'];

const TRUSTED_HOSTS = ['gov.in', 'nic.in', 'rbi.org.in', 'npci.org.in', 'cybercrime.gov.in', 'uidai.gov.in', 'incometax.gov.in', 'epfindia.gov.in'];

/** Brand names a scam page impersonates. Their real domains are checked separately. */
const BRANDS = ['sbi', 'hdfc', 'icici', 'axis', 'kotak', 'pnb', 'bob', 'baroda', 'paytm', 'phonepe', 'gpay', 'upi', 'npci', 'irctc', 'epfo', 'aadhaar', 'incometax', 'kyc'];

const URGENCY = ['urgent', 'immediately', 'today', 'within 24', 'last warning', 'final notice', 'तुरंत', 'आज ही', 'अंतिम'];

const THREAT = ['blocked', 'block', 'suspend', 'deactivat', 'disconnect', 'penalty', 'legal action', 'seized', 'बंद', 'ब्लॉक', 'कट जाएगा'];

const BAIT = ['lottery', 'won', 'winner', 'prize', 'cashback', 'refund', 'reward', 'lucky', 'double your', 'guaranteed return', 'work from home', 'part time job', 'इनाम', 'लॉटरी', 'रिफंड'];

const REMOTE_TOOLS = ['anydesk', 'teamviewer', 'quicksupport', 'screen share', 'screenshare', 'rustdesk', 'apk'];

const CREDENTIAL_ASK = ['otp', 'pin', 'cvv', 'password', 'ओटीपी', 'पिन', 'पासवर्ड'];

type Signal = { weight: number; text: L };

function urlSignals(raw: string): Signal[] {
  const out: Signal[] = [];
  const value = raw.trim().toLowerCase();
  const host = extractHost(value);

  if (!host) {
    out.push({
      weight: 1,
      text: { en: 'This does not look like a complete web address.', hi: 'यह पूरा वेब पता नहीं लगता।' },
    });
    return out;
  }

  if (TRUSTED_HOSTS.some((h) => host === h || host.endsWith('.' + h))) {
    out.push({
      weight: -4,
      text: {
        en: `${host} is a government domain, which cannot be registered by an outsider.`,
        hi: `${host} एक सरकारी डोमेन है, जिसे बाहरी व्यक्ति रजिस्टर नहीं कर सकता।`,
      },
    });
    return out;
  }

  if (SHORTENERS.some((s) => host === s || host.endsWith('.' + s))) {
    out.push({
      weight: 3,
      text: {
        en: 'A link shortener hides where the link actually goes.',
        hi: 'लिंक शॉर्टनर छिपा देता है कि लिंक असल में कहाँ जाता है।',
      },
    });
  }

  if (value.startsWith('http://')) {
    out.push({
      weight: 2,
      text: {
        en: 'The address is plain http, so anything typed into it travels unencrypted.',
        hi: 'पता सामान्य http है, इसलिए इसमें लिखी हर चीज़ बिना एन्क्रिप्शन जाती है।',
      },
    });
  }

  const brand = BRANDS.find((b) => host.includes(b));
  if (brand) {
    out.push({
      weight: 4,
      text: {
        en: `The address carries the name "${brand}" but is not that organisation's real domain.`,
        hi: `पते में "${brand}" नाम है, पर यह उस संस्था का असली डोमेन नहीं है।`,
      },
    });
  }

  const tld = RISKY_TLDS.find((t) => host.endsWith(t));
  if (tld) {
    out.push({
      weight: 2,
      text: {
        en: `${tld} domains are cheap to register and are heavily used for one-off scam pages.`,
        hi: `${tld} डोमेन सस्ते में रजिस्टर होते हैं और एक-बार वाले स्कैम पेज के लिए बहुत इस्तेमाल होते हैं।`,
      },
    });
  }

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    out.push({
      weight: 4,
      text: {
        en: 'The link points at a bare IP address instead of a domain name.',
        hi: 'लिंक डोमेन नाम की जगह सीधे IP पते पर जाता है।',
      },
    });
  }

  if (/(login|verify|kyc|update|refund|claim|netbank)/.test(value)) {
    out.push({
      weight: 2,
      text: {
        en: 'The path asks for a login, a KYC update or a refund claim — the three most copied pages.',
        hi: 'पथ लॉगिन, KYC अपडेट या रिफंड क्लेम माँगता है — यही तीन पेज सबसे ज़्यादा नकल होते हैं।',
      },
    });
  }

  if ((host.match(/-/g) || []).length >= 2) {
    out.push({
      weight: 1,
      text: {
        en: 'The domain is padded with hyphens, a common way to mimic a real name.',
        hi: 'डोमेन में कई हाइफ़न हैं, जो असली नाम की नकल करने का आम तरीका है।',
      },
    });
  }

  if (out.length === 0) {
    out.push({
      weight: 0,
      text: {
        en: 'Nothing in the address itself matched a known scam pattern.',
        hi: 'पते में कोई जाना-पहचाना स्कैम पैटर्न नहीं मिला।',
      },
    });
  }
  return out;
}

function extractHost(value: string): string | null {
  const match = value.match(/^(?:https?:\/\/)?([^/\s?#]+)/i);
  if (!match) return null;
  const host = match[1].replace(/^www\./, '');
  return host.includes('.') ? host : null;
}

function upiSignals(raw: string): Signal[] {
  const out: Signal[] = [];
  const value = raw.trim().toLowerCase();

  if (!/^[a-z0-9._-]{2,}@[a-z]{2,}$/.test(value)) {
    out.push({
      weight: 2,
      text: {
        en: 'This is not shaped like a UPI ID, which is always name@handle.',
        hi: 'यह UPI ID जैसा नहीं है, जो हमेशा name@handle होता है।',
      },
    });
  }

  const name = value.split('@')[0] ?? '';

  if (/(refund|kyc|verify|support|helpdesk|care|service|officer|reward|lucky)/.test(name)) {
    out.push({
      weight: 4,
      text: {
        en: 'The ID is dressed up as a support or refund account. Real refunds are credited, never collected.',
        hi: 'यह ID सपोर्ट या रिफंड खाते जैसी बनाई गई है। असली रिफंड जमा होता है, कभी माँगा नहीं जाता।',
      },
    });
  }

  if (/^[a-z0-9]{12,}$/.test(name) && /\d{4,}/.test(name)) {
    out.push({
      weight: 2,
      text: {
        en: 'The ID looks machine-generated rather than a person or a shop.',
        hi: 'यह ID किसी व्यक्ति या दुकान जैसी नहीं, मशीन से बनी लगती है।',
      },
    });
  }

  if (out.length === 0) {
    out.push({
      weight: 0,
      text: {
        en: 'The ID looks ordinary, but an ID alone never proves who is behind it.',
        hi: 'ID सामान्य लगती है, पर अकेली ID से यह कभी साबित नहीं होता कि पीछे कौन है।',
      },
    });
  }
  return out;
}

function phoneSignals(raw: string): Signal[] {
  const out: Signal[] = [];
  const digits = raw.replace(/[^\d+]/g, '');

  if (digits.startsWith('+') && !digits.startsWith('+91')) {
    out.push({
      weight: 4,
      text: {
        en: 'The call came from outside India. An Indian bank or government office does not call from an international number.',
        hi: 'कॉल भारत के बाहर से आई है। कोई भारतीय बैंक या सरकारी दफ़्तर अंतरराष्ट्रीय नंबर से कॉल नहीं करता।',
      },
    });
  }

  const local = digits.replace(/^\+91/, '');

  if (local.startsWith('140')) {
    out.push({
      weight: 1,
      text: {
        en: 'The 140 series is registered telemarketing, not a bank\'s service desk.',
        hi: '140 सीरीज़ पंजीकृत टेलीमार्केटिंग है, किसी बैंक का सेवा डेस्क नहीं।',
      },
    });
  }

  if (local.length > 0 && local.length !== 10 && !digits.startsWith('+')) {
    out.push({
      weight: 2,
      text: {
        en: 'An Indian mobile number has ten digits; this one does not.',
        hi: 'भारतीय मोबाइल नंबर दस अंकों का होता है; यह नहीं है।',
      },
    });
  }

  if (out.length === 0) {
    out.push({
      weight: 0,
      text: {
        en: 'The number is an ordinary Indian mobile number. That says nothing about who is calling.',
        hi: 'यह एक सामान्य भारतीय मोबाइल नंबर है। इससे यह पता नहीं चलता कि कॉल कौन कर रहा है।',
      },
    });
  }
  return out;
}

function smsSignals(raw: string): Signal[] {
  const out: Signal[] = [];
  const value = raw.toLowerCase();

  const hit = (list: string[]) => list.some((w) => value.includes(w));

  if (hit(CREDENTIAL_ASK) && /(share|send|tell|बताएं|बताइए|भेज)/.test(value)) {
    out.push({
      weight: 5,
      text: {
        en: 'The message asks you to pass on a code or PIN. Nobody legitimate ever asks for that — including us.',
        hi: 'मैसेज आपसे कोड या PIN बताने को कह रहा है। कोई भी असली संस्था ऐसा नहीं माँगती — हम भी नहीं।',
      },
    });
  }

  if (hit(REMOTE_TOOLS)) {
    out.push({
      weight: 5,
      text: {
        en: 'It pushes a remote-access app or an APK file. That hands over control of this phone.',
        hi: 'यह रिमोट-एक्सेस ऐप या APK फ़ाइल डलवाना चाहता है। इससे इस फ़ोन का नियंत्रण चला जाता है।',
      },
    });
  }

  if (hit(THREAT)) {
    out.push({
      weight: 2,
      text: {
        en: 'It threatens that something will be blocked, cut or penalised.',
        hi: 'यह धमकी देता है कि कुछ ब्लॉक, कट या जुर्माने में चला जाएगा।',
      },
    });
  }

  if (hit(URGENCY)) {
    out.push({
      weight: 2,
      text: {
        en: 'It puts you on a deadline, which is there to stop you checking.',
        hi: 'यह आपको समय-सीमा में बाँधता है, ताकि आप जाँच न कर सकें।',
      },
    });
  }

  if (hit(BAIT)) {
    out.push({
      weight: 3,
      text: {
        en: 'It offers money you did not ask for — a prize, a refund or a return.',
        hi: 'यह बिना माँगे पैसा देने की बात करता है — इनाम, रिफंड या रिटर्न।',
      },
    });
  }

  const url = value.match(/(?:https?:\/\/)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/\S*)?/i);
  if (url) {
    out.push({
      weight: 1,
      text: {
        en: 'The message carries a link, so the link decides most of this verdict.',
        hi: 'मैसेज में लिंक है, इसलिए यह नतीजा ज़्यादातर उसी लिंक से तय होता है।',
      },
    });
    out.push(...urlSignals(url[0]).filter((s) => s.weight > 0));
  }

  if (out.length === 0) {
    out.push({
      weight: 0,
      text: {
        en: 'Nothing in the wording matched a known scam pattern.',
        hi: 'शब्दों में कोई जाना-पहचाना स्कैम पैटर्न नहीं मिला।',
      },
    });
  }
  return out;
}

const STEPS: Record<Verdict, L[]> = {
  dangerous: [
    {
      en: 'Do not open the link and do not pay anything from this message.',
      hi: 'इस मैसेज का लिंक न खोलें और इससे कोई भुगतान न करें।',
    },
    {
      en: 'Report it below so the next person who checks it sees the warning.',
      hi: 'नीचे रिपोर्ट करें, ताकि अगली बार कोई जाँचे तो उसे चेतावनी दिखे।',
    },
    {
      en: 'If money has already left your account, open Report fraud now — the clock matters.',
      hi: 'अगर पैसा पहले ही निकल गया है, तो अभी "धोखाधड़ी की रिपोर्ट" खोलें — समय अहम है।',
    },
  ],
  suspicious: [
    {
      en: 'Check it through the official app, or a number you already had — not the one in the message.',
      hi: 'इसे अधिकृत ऐप से, या पहले से आपके पास मौजूद नंबर से जाँचें — मैसेज में दिए नंबर से नहीं।',
    },
    {
      en: 'Do not share any code, and do not install anything it suggests.',
      hi: 'कोई कोड साझा न करें, और इसका सुझाया कुछ भी इंस्टॉल न करें।',
    },
    {
      en: 'Ask a question here if you want the rule explained before you act.',
      hi: 'कुछ करने से पहले नियम समझना हो तो यहाँ सवाल पूछें।',
    },
  ],
  safe: [
    {
      en: 'Nothing matched a known pattern, but a clean check is not a guarantee.',
      hi: 'कोई जाना-पहचाना पैटर्न नहीं मिला, पर साफ़ नतीजा गारंटी नहीं है।',
    },
    {
      en: 'For a large payment, confirm through the official app before sending.',
      hi: 'बड़े भुगतान से पहले अधिकृत ऐप से पुष्टि कर लें।',
    },
    {
      en: 'Never pass on an OTP or PIN, even to someone claiming to be from this app.',
      hi: 'OTP या PIN कभी किसी को न बताएँ, चाहे वह इस ऐप का नाम ले।',
    },
  ],
};

export function checkArtefact(type: ArtefactType, artefact: string): ScamResult {
  const signals =
    type === 'url'
      ? urlSignals(artefact)
      : type === 'upi'
        ? upiSignals(artefact)
        : type === 'phone'
          ? phoneSignals(artefact)
          : smsSignals(artefact);

  const score = signals.reduce((sum, s) => sum + s.weight, 0);

  const verdict: Verdict = score >= 5 ? 'dangerous' : score >= 2 ? 'suspicious' : 'safe';

  // Confidence rises with how far the score sits from the boundary it crossed.
  const confidence =
    verdict === 'dangerous'
      ? Math.min(0.96, 0.72 + score * 0.03)
      : verdict === 'suspicious'
        ? Math.min(0.78, 0.52 + score * 0.06)
        : Math.min(0.92, 0.62 + Math.abs(Math.min(score, 0)) * 0.07);

  return {
    id: `sc-${Date.now()}`,
    type,
    artefact: artefact.trim(),
    verdict,
    confidence,
    reasons: signals
      .filter((s) => s.weight !== 0 || signals.length === 1)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 4)
      .map((s) => s.text),
    steps: STEPS[verdict],
    at: Date.now(),
  };
}

// ── Content Library retrieval ─────────────────────────────────────────

const KEYWORDS: Record<string, string[]> = {
  'lib-dep-01': ['deposit', 'landlord', 'rent', 'tenant', 'security', 'makan', 'kiraya', 'जमा', 'मकान', 'किराया', 'किरायेदार'],
  'lib-con-02': ['consumer', 'complaint', 'refund', 'product', 'seller', 'service', 'warranty', 'shikayat', 'उपभोक्ता', 'शिकायत', 'सामान'],
  'lib-not-03': ['notice', 'legal notice', 'advocate letter', 'reply', 'नोटिस', 'जवाब'],
  'lib-rbi-04': ['fraud', 'unauthorised', 'unauthorized', 'debited', 'debit', 'upi', 'bank', 'money', 'rbi', '1930', 'धोखा', 'पैसा', 'बैंक', 'कट गया'],
};

/** Matched entry, plus the confidence the retrieval had in it. */
export function retrieve(question: string): { entry: LibraryEntry; confidence: number } {
  const q = question.toLowerCase();
  let best: { id: string; hits: number } = { id: '', hits: 0 };

  for (const [id, words] of Object.entries(KEYWORDS)) {
    const hits = words.reduce((n, w) => (q.includes(w) ? n + 1 : n), 0);
    if (hits > best.hits) best = { id, hits };
  }

  const escalation = LIBRARY.find((e) => e.escalate)!;
  if (best.hits === 0) return { entry: escalation, confidence: 0 };

  const entry = LIBRARY.find((e) => e.id === best.id) ?? escalation;
  return { entry, confidence: Math.min(0.95, 0.55 + best.hits * 0.12) };
}
