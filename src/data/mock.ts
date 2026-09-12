/**
 * Seed data for the frontend build. There is no backend in this repo, so this
 * file stands in for the API. Everything here is realistic Indian household
 * material — real document types, real scam patterns, dates relative to today
 * so the app never looks stale.
 */

import {
  Advocate,
  EvidenceItem,
  Followup,
  FraudCase,
  L,
  LibraryEntry,
  VaultDoc,
} from './types';

const DAY = 86_400_000;

export function iso(offsetDays: number, hour = 10, minute = 0): string {
  const d = new Date(Date.now() + offsetDays * DAY);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

/** Days from now until an ISO date, rounded towards zero. */
export function daysUntil(isoDate: string): number {
  return Math.round((new Date(isoDate).getTime() - Date.now()) / DAY);
}

export function formatDate(isoDate: string, lang: 'en' | 'hi'): string {
  const d = new Date(isoDate);
  const months = {
    en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    hi: ['जन', 'फ़र', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुला', 'अग', 'सित', 'अक्तू', 'नव', 'दिस'],
  };
  return `${d.getDate()} ${months[lang][d.getMonth()]} ${d.getFullYear()}`;
}

export function formatTime(isoDate: string): string {
  const d = new Date(isoDate);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const suffix = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m} ${suffix}`;
}

/** "2 hours ago" — the caller supplies the localised unit words. */
export function timeAgo(at: number, words: { now: string; min: string; hours: string; days: string }): string {
  const s = Math.max(0, Math.floor((Date.now() - at) / 1000));
  if (s < 90) return words.now;
  if (s < 3600) return `${Math.round(s / 60)} ${words.min}`;
  if (s < 86400) return `${Math.round(s / 3600)} ${words.hours}`;
  return `${Math.round(s / 86400)} ${words.days}`;
}

export const USER = {
  name: 'Sumiran',
  firstName: { en: 'Sumiran', hi: 'सुमिरन' } as L,
  phone: '+91 98260 41779',
  city: { en: 'Indore', hi: 'इंदौर' } as L,
  state: { en: 'Madhya Pradesh', hi: 'मध्य प्रदेश' } as L,
  familyMembers: 2,
  familySeats: 4,
  renewsAt: iso(174),
};

export const VAULT_DOCS: VaultDoc[] = [
  {
    id: 'd2',
    title: { en: 'PUC certificate', hi: 'PUC सर्टिफिकेट' },
    category: 'vehicle',
    expiryDate: iso(-3),
    addedAt: iso(-95),
    sizeKb: 320,
    ocrStatus: 'done',
    fields: [
      { label: { en: 'Registration', hi: 'रजिस्ट्रेशन' }, value: 'MP09 CD 4417', mono: true },
      { label: { en: 'Vehicle', hi: 'वाहन' }, value: 'Maruti Swift VXi' },
      { label: { en: 'Tested on', hi: 'जाँच तिथि' }, value: formatDate(iso(-96), 'en') },
      { label: { en: 'Valid until', hi: 'वैध तक' }, value: formatDate(iso(-3), 'en') },
    ],
    explanation: {
      en: 'A pollution-under-control certificate records that the vehicle passed an emissions test on a given date, and stays valid for a fixed period after it. This one shows a validity date that has now passed. Driving without a valid certificate is an offence under the Motor Vehicles Act, and insurers commonly ask for a current one at renewal.',
      hi: 'प्रदूषण नियंत्रण प्रमाणपत्र दर्ज करता है कि वाहन ने किसी तारीख़ को उत्सर्जन जाँच पास की, और उसके बाद एक तय अवधि तक वैध रहता है। इसमें दर्ज वैधता तारीख़ अब निकल चुकी है। वैध प्रमाणपत्र के बिना गाड़ी चलाना मोटर वाहन अधिनियम के तहत अपराध है, और बीमा कंपनियाँ रिन्यूअल पर आम तौर पर चालू प्रमाणपत्र माँगती हैं।',
    },
  },
  {
    id: 'd3',
    title: { en: 'Rent agreement — Vijay Nagar', hi: 'किराया अनुबंध — विजय नगर' },
    category: 'property',
    addedAt: iso(-40),
    sizeKb: 2210,
    ocrStatus: 'failed',
    fields: [],
  },
  {
    id: 'd4',
    title: { en: 'Motor insurance', hi: 'मोटर इंश्योरेंस' },
    category: 'insurance',
    expiryDate: iso(30),
    addedAt: iso(-335),
    sizeKb: 980,
    ocrStatus: 'done',
    fields: [
      { label: { en: 'Insurer', hi: 'बीमा कंपनी' }, value: 'ICICI Lombard' },
      { label: { en: 'Policy number', hi: 'पॉलिसी नंबर' }, value: '3005/MP/221184/00', mono: true },
      { label: { en: 'Type', hi: 'प्रकार' }, value: 'Comprehensive' },
      { label: { en: 'IDV', hi: 'IDV' }, value: '₹4,15,000' },
      { label: { en: 'Valid until', hi: 'वैध तक' }, value: formatDate(iso(30), 'en') },
    ],
    explanation: {
      en: 'A comprehensive motor policy covers both third-party liability, which is compulsory, and damage to the insured vehicle itself. The IDV is the figure a total-loss claim is settled against, and it falls each year as the vehicle ages. A lapse in cover generally means the no-claim bonus built up so far is lost.',
      hi: 'कॉम्प्रिहेंसिव मोटर पॉलिसी में दोनों शामिल हैं — थर्ड-पार्टी दायित्व, जो अनिवार्य है, और बीमित वाहन को हुआ नुकसान। IDV वह राशि है जिस पर टोटल-लॉस क्लेम तय होता है, और वाहन पुराना होने के साथ हर साल घटती है। कवर लैप्स होने पर आम तौर पर अब तक बना नो-क्लेम बोनस चला जाता है।',
    },
  },
  {
    id: 'd5',
    title: { en: 'Aadhaar card', hi: 'आधार कार्ड' },
    category: 'identity',
    addedAt: iso(-231),
    sizeKb: 240,
    ocrStatus: 'done',
    fields: [
      { label: { en: 'Number', hi: 'नंबर' }, value: 'XXXX XXXX 6641', mono: true },
      { label: { en: 'Name', hi: 'नाम' }, value: 'Sumiran' },
      { label: { en: 'Date of birth', hi: 'जन्म तिथि' }, value: '14 Mar 1989' },
    ],
  },
  {
    id: 'd6',
    title: { en: 'PAN card', hi: 'पैन कार्ड' },
    category: 'identity',
    addedAt: iso(-231),
    sizeKb: 180,
    ocrStatus: 'done',
    fields: [
      { label: { en: 'Number', hi: 'नंबर' }, value: 'XXXXX4417F', mono: true },
      { label: { en: 'Name', hi: 'नाम' }, value: 'Sumiran' },
    ],
  },
  {
    id: 'd7',
    title: { en: 'Sale deed — Plot 44, Rau', hi: 'विक्रय विलेख — प्लॉट 44, राऊ' },
    category: 'property',
    addedAt: iso(-612),
    sizeKb: 5400,
    ocrStatus: 'done',
    fields: [
      { label: { en: 'Registration no.', hi: 'रजिस्ट्री नंबर' }, value: 'IND/1/2023/4471', mono: true },
      { label: { en: 'Registered on', hi: 'रजिस्ट्री तिथि' }, value: '9 Feb 2023' },
      { label: { en: 'Consideration', hi: 'प्रतिफल' }, value: '₹32,50,000' },
      { label: { en: 'Stamp duty', hi: 'स्टाम्प शुल्क' }, value: '₹2,60,000' },
      { label: { en: 'Area', hi: 'क्षेत्र' }, value: '1,250 sq ft' },
    ],
  },
  {
    id: 'd8',
    title: { en: 'Fixed deposit receipt', hi: 'फ़िक्स्ड डिपॉज़िट रसीद' },
    category: 'financial',
    expiryDate: iso(64),
    addedAt: iso(-301),
    sizeKb: 210,
    ocrStatus: 'done',
    fields: [
      { label: { en: 'Bank', hi: 'बैंक' }, value: 'Bank of Baroda' },
      { label: { en: 'Principal', hi: 'मूल राशि' }, value: '₹2,00,000' },
      { label: { en: 'Rate', hi: 'ब्याज दर' }, value: '7.15% p.a.' },
      { label: { en: 'Matures on', hi: 'परिपक्वता' }, value: formatDate(iso(64), 'en') },
    ],
  },
  {
    id: 'd9',
    title: { en: 'School fee receipts 2026', hi: 'स्कूल फ़ीस रसीदें 2026' },
    category: 'family',
    addedAt: iso(-58),
    sizeKb: 640,
    ocrStatus: 'done',
    fields: [{ label: { en: 'Institution', hi: 'संस्थान' }, value: 'Emerald Heights, Indore' }],
  },
  {
    id: 'd10',
    title: { en: 'Employment contract', hi: 'नियुक्ति अनुबंध' },
    category: 'contracts',
    addedAt: iso(-420),
    sizeKb: 760,
    ocrStatus: 'done',
    fields: [
      { label: { en: 'Employer', hi: 'नियोक्ता' }, value: 'Tricone Systems Pvt Ltd' },
      { label: { en: 'Designation', hi: 'पद' }, value: 'Senior Associate' },
      { label: { en: 'Notice period', hi: 'नोटिस अवधि' }, value: '60 days' },
      { label: { en: 'Non-compete', hi: 'नॉन-कम्पीट' }, value: '12 months, Indore district' },
    ],
    explanation: {
      en: 'The contract sets a 60-day notice period on both sides and a non-compete clause running 12 months after exit, limited to Indore district. Indian courts have generally treated post-employment non-compete restrictions as unenforceable under Section 27 of the Contract Act, while confidentiality obligations are treated differently. What a particular clause means for a particular resignation depends on its exact wording and the facts.',
      hi: 'अनुबंध दोनों पक्षों पर 60 दिन की नोटिस अवधि और नौकरी छोड़ने के बाद 12 महीने चलने वाला नॉन-कम्पीट खंड तय करता है, जो इंदौर ज़िले तक सीमित है। भारतीय अदालतों ने आम तौर पर नौकरी के बाद के नॉन-कम्पीट प्रतिबंधों को अनुबंध अधिनियम की धारा 27 के तहत लागू न होने योग्य माना है, जबकि गोपनीयता की बाध्यताओं को अलग तरह से देखा जाता है। किसी खास इस्तीफ़े पर किसी खास खंड का क्या असर होगा, यह उसके ठीक शब्दों और तथ्यों पर निर्भर करता है।',
    },
  },
  {
    id: 'd11',
    title: { en: 'GST registration', hi: 'GST रजिस्ट्रेशन' },
    category: 'business',
    addedAt: iso(-500),
    sizeKb: 300,
    ocrStatus: 'done',
    fields: [{ label: { en: 'GSTIN', hi: 'GSTIN' }, value: '23AABCT1332L1ZP', mono: true }],
  },
  {
    id: 'd12',
    title: { en: 'Property tax receipt', hi: 'संपत्ति कर रसीद' },
    category: 'property',
    expiryDate: iso(112),
    addedAt: iso(-210),
    sizeKb: 190,
    ocrStatus: 'done',
    fields: [
      { label: { en: 'Municipality', hi: 'नगर निगम' }, value: 'Indore Municipal Corporation' },
      { label: { en: 'Next due', hi: 'अगली देय तिथि' }, value: formatDate(iso(112), 'en') },
    ],
  },
];

/**
 * Expiry alert offsets come from the schedule in the scope document, so a
 * passport warns 180 days out and a PUC only 15.
 */
export const ALERT_OFFSETS: Record<string, number[]> = {
  'motor insurance': [30, 7, 1],
  'puc certificate': [15, 3],
  'health insurance': [45, 15],
  'rent agreement': [60, 30],
  'driving licence': [90, 30],
  passport: [180, 90],
  'fixed deposit receipt': [15],
  'property tax receipt': [30],
  default: [30, 7],
};

export const OPEN_CASE: FraudCase = {
  id: 'FC-2027-1184',
  amountPaise: 8_400_000,
  channel: { en: 'UPI', hi: 'UPI' },
  bankName: 'Bank of Baroda',
  incidentAt: iso(-2, 14, 18),
  windowExpiresAt: iso(3, 14, 18),
  bankAckNo: 'BNK/2027/88123',
  bankReportedAt: iso(-2, 14, 41),
  evidence: buildEvidence(),
  followups: buildFollowups(),
  letterSent: false,
};

function buildEvidence(): EvidenceItem[] {
  const kinds: L[] = [
    { en: 'Debit SMS from bank', hi: 'बैंक का डेबिट SMS' },
    { en: 'UPI app screenshot', hi: 'UPI ऐप स्क्रीनशॉट' },
    { en: 'Call log — unknown number', hi: 'कॉल लॉग — अज्ञात नंबर' },
    { en: 'Account statement page', hi: 'खाता विवरण पृष्ठ' },
    { en: 'Note on what happened', hi: 'क्या हुआ, इसका नोट' },
  ];
  return kinds.map((kind, i) => ({
    id: `ev${i + 1}`,
    kind,
    sha256: fakeHash(i),
    capturedAt: iso(-2, 15, 20 + i * 3),
  }));
}

function fakeHash(seed: number): string {
  const chars = 'abcdef0123456789';
  let out = '';
  for (let i = 0; i < 64; i++) out += chars[(seed * 31 + i * 17) % 16];
  return out;
}

function buildFollowups(): Followup[] {
  return [
    { id: 'f3', day: 3, label: { en: 'Call the bank for a status', hi: 'बैंक से स्थिति पूछें' }, dueAt: iso(1, 11), done: false },
    { id: 'f7', day: 7, label: { en: 'Written reminder to the bank', hi: 'बैंक को लिखित रिमाइंडर' }, dueAt: iso(5, 11), done: false },
    { id: 'f15', day: 15, label: { en: 'Ask for the investigation outcome', hi: 'जाँच का नतीजा पूछें' }, dueAt: iso(13, 11), done: false },
    { id: 'f30', day: 30, label: { en: 'Escalate inside the bank', hi: 'बैंक के अंदर एस्केलेट करें' }, dueAt: iso(28, 11), done: false },
  ];
}

export const SCAM_OF_THE_DAY = {
  verdict: 'dangerous' as const,
  title: {
    en: '"Your electricity will be cut tonight" — the bill SMS',
    hi: '"आज रात बिजली कट जाएगी" — बिजली बिल वाला मैसेज',
  },
  body: {
    en: 'An SMS says a bill is unpaid and links to an app. Then a "lineman" calls and walks you through sharing your screen while you pay.',
    hi: 'एक SMS आता है कि बिल बाकी है और साथ में ऐप का लिंक होता है। फिर "लाइनमैन" कॉल करके भुगतान के दौरान स्क्रीन शेयर करवाता है।',
  },
  tell: {
    en: 'No electricity board asks you to install an app or share your screen to pay a bill.',
    hi: 'कोई भी बिजली कंपनी बिल भरने के लिए ऐप डाउनलोड करने या स्क्रीन शेयर करने को नहीं कहती।',
  },
};

/**
 * Stand-in for the Content Library. In production every entry carries a
 * version and an approving advocate, and the assistant may only serve
 * approved entries (FR-AIA-02, FR-LIB-02).
 */
export const LIBRARY: LibraryEntry[] = [
  {
    id: 'lib-dep-01',
    slug: 'security-deposit-not-returned',
    version: 4,
    question: {
      en: 'My landlord is not returning the deposit',
      hi: 'मकान मालिक जमा राशि नहीं लौटा रहा',
    },
    answer: {
      en: 'A security deposit is the tenant\'s money held by the landlord against unpaid rent or damage, and a rent agreement usually states when it must come back — commonly within 15 to 30 days of handing over the premises.\n\nWhere a deposit is withheld, the usual route is a written demand sent by registered post or email, quoting the clause and the amount, followed by a legal notice if that gets no response. Deposit disputes below the pecuniary limit are heard by the civil court of the district; in several states a Rent Control or Rent Authority forum also has jurisdiction over tenancy matters.\n\nPhotographs taken at handover, the agreement itself, and proof of every rent payment are the documents these matters usually turn on.',
      hi: 'सिक्योरिटी डिपॉज़िट किरायेदार का पैसा होता है, जो मकान मालिक बकाया किराए या नुकसान के बदले रखता है, और किराया अनुबंध में आम तौर पर यह लिखा होता है कि वह कब तक लौटाना है — आम तौर पर मकान सौंपने के 15 से 30 दिन के भीतर।\n\nजब डिपॉज़िट रोका जाता है, तो आम रास्ता यह होता है कि रजिस्टर्ड डाक या ईमेल से लिखित माँग भेजी जाए, जिसमें अनुबंध का खंड और राशि दर्ज हो, और जवाब न आने पर लीगल नोटिस भेजा जाए। तय आर्थिक सीमा से नीचे के डिपॉज़िट विवाद ज़िले की सिविल कोर्ट सुनती है; कई राज्यों में किरायेदारी मामलों पर रेंट कंट्रोल या रेंट अथॉरिटी को भी अधिकार होता है।\n\nमकान सौंपते समय ली गई तस्वीरें, अनुबंध खुद, और हर किराया भुगतान का सबूत — इन मामलों में आम तौर पर यही दस्तावेज़ निर्णायक होते हैं।',
    },
  },
  {
    id: 'lib-con-02',
    slug: 'consumer-complaint-how-to-file',
    version: 7,
    question: {
      en: 'How do I file a consumer complaint?',
      hi: 'उपभोक्ता शिकायत कैसे दर्ज करें?',
    },
    answer: {
      en: 'Consumer complaints in India are filed under the Consumer Protection Act 2019, before a District, State or National Commission depending on the value of the goods or services paid for.\n\nThe usual sequence is a written complaint to the seller or service provider first, then a complaint to the Commission. Filing can be done online through the e-Daakhil portal or physically at the District Commission with jurisdiction over where the complainant lives or where the opposite party operates. The complaint sets out the facts, the defect or deficiency, the relief asked for, and carries the invoice, payment proof and any correspondence as annexures.\n\nThe limitation period under the Act is two years from the date the cause of action arose, and a fee scale applies by claim value.',
      hi: 'भारत में उपभोक्ता शिकायतें उपभोक्ता संरक्षण अधिनियम 2019 के तहत दर्ज होती हैं — ज़िला, राज्य या राष्ट्रीय आयोग में, जो चुकाई गई वस्तु या सेवा के मूल्य पर निर्भर करता है।\n\nआम क्रम यह है कि पहले विक्रेता या सेवा प्रदाता को लिखित शिकायत दी जाए, फिर आयोग में शिकायत दर्ज की जाए। दाख़िल करना e-Daakhil पोर्टल पर ऑनलाइन हो सकता है, या उस ज़िला आयोग में जहाँ शिकायतकर्ता रहता है या विपक्षी पक्ष काम करता है। शिकायत में तथ्य, दोष या कमी, माँगी गई राहत लिखी जाती है, और बिल, भुगतान का सबूत तथा पत्राचार संलग्न होते हैं।\n\nअधिनियम के तहत परिसीमा अवधि वाद कारण उत्पन्न होने की तारीख़ से दो वर्ष है, और दावे के मूल्य के अनुसार शुल्क लगता है।',
    },
  },
  {
    id: 'lib-not-03',
    slug: 'what-is-a-legal-notice',
    version: 3,
    question: { en: 'What is a legal notice?', hi: 'लीगल नोटिस क्या होता है?' },
    answer: {
      en: 'A legal notice is a formal written communication, usually sent through an advocate, telling the recipient what the sender says went wrong, what is demanded, and by when — before a case is filed.\n\nIt records the sender\'s position on the facts and creates a dated paper trail. In some proceedings a notice is a statutory pre-condition; in most civil disputes it is not compulsory but is commonly sent first. A notice typically states the facts, the provision or clause relied on, the relief sought, and a period to comply, often 15 or 30 days.\n\nReceiving one does not by itself create a liability. The sender still has to prove the claim if the matter goes to court, and a reply is usually sent within the stated period.',
      hi: 'लीगल नोटिस एक औपचारिक लिखित सूचना है, जो आम तौर पर वकील के माध्यम से भेजी जाती है, और जिसमें बताया जाता है कि भेजने वाले के अनुसार क्या गलत हुआ, क्या माँग है, और कब तक — मुकदमा दायर करने से पहले।\n\nयह तथ्यों पर भेजने वाले की स्थिति दर्ज करती है और तारीख़ वाला काग़ज़ी रिकॉर्ड बनाती है। कुछ कार्यवाहियों में नोटिस कानूनी पूर्व-शर्त होता है; अधिकतर दीवानी विवादों में अनिवार्य नहीं है, पर आम तौर पर पहले भेजा जाता है। नोटिस में आम तौर पर तथ्य, आधार बनाया गया प्रावधान या खंड, माँगी गई राहत, और पालन की अवधि — अक्सर 15 या 30 दिन — लिखी होती है।\n\nनोटिस मिलने से अपने आप कोई दायित्व नहीं बन जाता। मामला अदालत जाने पर भेजने वाले को दावा साबित करना ही पड़ता है, और जवाब आम तौर पर दी गई अवधि के भीतर भेजा जाता है।',
    },
  },
  {
    id: 'lib-rbi-04',
    slug: 'unauthorised-transaction-liability',
    version: 9,
    question: {
      en: 'Money left my account without my permission',
      hi: 'मेरी अनुमति के बिना खाते से पैसा निकल गया',
    },
    answer: {
      en: 'RBI\'s customer-liability directions deal with unauthorised electronic transactions. Where the loss arises from a third-party breach and the customer reports it within the prescribed period, the directions place zero liability on the customer, and the burden of proving customer liability sits with the bank.\n\nTwo reports matter here: one to the bank, through its 24×7 reporting channel, and one to the National Cyber Crime Reporting Portal or 1930. Both should go in within five calendar days of the transaction, and both give an acknowledgement number worth keeping.\n\nDelay is what usually costs a customer the protection, so the reporting date and the acknowledgement numbers are the two facts to secure first.',
      hi: 'RBI के ग्राहक-दायित्व निर्देश अनधिकृत इलेक्ट्रॉनिक लेन-देन से जुड़े हैं। जहाँ नुकसान तीसरे पक्ष की चूक से हुआ है और ग्राहक निर्धारित अवधि में उसकी रिपोर्ट कर देता है, वहाँ निर्देश ग्राहक पर शून्य दायित्व रखते हैं, और ग्राहक का दायित्व साबित करने का भार बैंक पर होता है।\n\nयहाँ दो रिपोर्ट अहम हैं: एक बैंक को, उसके 24×7 रिपोर्टिंग माध्यम से, और एक नेशनल साइबर क्राइम रिपोर्टिंग पोर्टल या 1930 को। दोनों लेन-देन के पाँच कैलेंडर दिन के भीतर जानी चाहिए, और दोनों से एक पावती नंबर मिलता है जिसे संभालकर रखना चाहिए।\n\nदेरी ही आम तौर पर ग्राहक से यह सुरक्षा छीनती है, इसलिए रिपोर्ट की तारीख़ और पावती नंबर — ये दो तथ्य सबसे पहले सुरक्षित करने चाहिए।',
    },
  },
  {
    id: 'lib-esc-99',
    slug: 'escalate-to-advocate',
    version: 1,
    escalate: true,
    question: { en: 'Escalation', hi: 'एस्केलेशन' },
    answer: {
      en: 'The library does not have an approved answer close enough to this to serve it.',
      hi: 'लाइब्रेरी में इसके इतने नज़दीक कोई स्वीकृत जवाब नहीं है कि दिया जा सके।',
    },
  },
];

export const DEMO_ADVOCATE: Advocate = {
  name: 'Adv. Kavita Deshmukh',
  enrolmentNo: 'MP/1184/2014',
  barCouncil: { en: 'Bar Council of Madhya Pradesh', hi: 'मध्य प्रदेश बार काउंसिल' },
  practiceAreas: [
    { en: 'Property & tenancy', hi: 'संपत्ति और किरायेदारी' },
    { en: 'Consumer', hi: 'उपभोक्ता' },
  ],
  languages: [
    { en: 'Hindi', hi: 'हिंदी' },
    { en: 'English', hi: 'अंग्रेज़ी' },
  ],
  district: { en: 'Indore', hi: 'इंदौर' },
};
