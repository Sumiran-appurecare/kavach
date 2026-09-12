# Nyaya Kavach — app frontend

The subscriber Android app from the Product Scope Document v1.0, built as a React
Native (Expo) frontend. **Frontend only** — there is no backend in this repo. Two
server-side services are stood in for locally so the app is genuinely usable
(see [What is real, what is stubbed](#what-is-real-what-is-stubbed)).

Stack: Expo SDK 57 · React Native 0.86 · React Navigation 7 · TypeScript · react-native-svg.

## Running it

```bash
npm install
npm run android      # device or emulator on USB / running locally
npm start            # then scan the QR with Expo Go
```

Fonts are bundled, so the first launch works offline. There is no login to get
past: onboarding runs with any 10-digit number and any 6-digit code.

> Not yet run on a device in this repo — it typechecks clean (`npx tsc --noEmit`)
> and produces a valid Android bundle (`npx expo export --platform android`), but
> no emulator was attached when it was written. Expect the usual first-run polish
> pass on a real handset.

## Seeing all three states

The app has no backend, so **More → Demo controls** switches the state the screens
react to:

| Control | What changes |
| --- | --- |
| Plan · `FREE` / `SHIELD` / `FAMILY` | Entitlement counts, scam-check quota, whether the emergency block promises a callback, whether advocate consultation is offered |
| Open fraud case · on / off | The home panel swaps the location pill for a live RBI countdown; the Shield tab gains a case strip; the emergency block changes its copy |
| Replay onboarding | Returns to the 5-step signup flow |

The **EN / हिं** toggle sits in the home panel and in More. Every string is
translated, not just the labels.

## Screens

```
Onboarding   carousel → phone → OTP → profile → passphrase → recovery kit → plan
Tabs         Home · Vault · Assistant · Shield · More
Pushed       Emergency · FraudCase · Consult · Document · Guides
```

## The home screen does not scroll

This was an explicit requirement: every feature visible at once, no scrolling.
It is a fixed flex column — the green panel, the emergency bar and the alerts
strip take the height they need, and the feature grid takes whatever is left
(four rows at `flex: 1`, tiles floored at 52px). When a state adds height, the
grid gives the pixels back instead of producing a scrollbar. On a screen shorter
than 720dp the alerts strip drops to one row rather than squeezing the features.

Each feature appears **exactly once**. The reference mockups showed Legal Vault /
My Documents, Scam Check / Cyber Shield and AI Assistant twice each; on a
no-scroll screen that is wasted height, and it makes a user wonder whether two
tiles do two different things.

## Design system

`src/theme/tokens.ts` — four colour jobs, four hues, so the code is learnable in
one session:

| Token | Job |
| --- | --- |
| `forest` `#123D2F` | Identity, healthy state, primary actions |
| `brass` `#8C6510` | Deadlines — anything with a date running out |
| `siren` `#C4202F` | **The emergency path, and nothing else** |
| `paper` `#F5F2E8` | The ground |

`siren` is reserved. The moment a second feature borrows it, it stops meaning
"emergency" to someone whose hands are shaking. Light and dark are both drawn.

Type is three faces with one job each: **Tiro Devanagari Hindi** (display),
**Hind** (UI) and **IBM Plex Mono** (acknowledgement numbers, countdowns, hashes).
The first two carry Devanagari and Latin, so a Hindi string never falls back
mid-sentence. Only the seven weights actually used are loaded — the font packages'
root entry points require every italic, which would have dragged ~3 MB of unused
faces into the download budget (NFR-16).

Icons are hand-drawn on a 20×20 grid in `src/components/Icon.tsx` rather than
pulled from an icon font, so weight and corner radius sit with the type.

## Compliance rules enforced in code

These are the ones that live in the frontend. They are not styling preferences —
Section 24 of the scope treats them like payment correctness, and Section 28 has a
regression suite that blocks release on failure.

| Rule | Where it is enforced |
| --- | --- |
| FR-CMP-08 · never request credentials | `OtpNotice` in `ui.tsx` is the single component carrying "We never ask for your OTP, PIN or password", rendered on every emergency and assistant surface. No screen has an input that asks for an existing OTP or PIN. |
| FR-CMP-08 · never promise recovery | No string in `strings.ts` promises money back. The emergency screen states the offer plainly: help filing and following up. |
| FR-CMP-04 · information ≠ advice | `InfoDisclaimer` rides on every AI and library answer, under company branding with no seal. Advocate surfaces carry the seal motif and promise a letterhead opinion. Two components, two visual worlds. |
| FR-CMP-01 · no advocate directory | There is no list, search, photo, rating or ranking anywhere. The advocate's identity exists in state only after they accept (`ConsultScreen`). |
| FR-CMP-06 · engagement note first | `acceptEngagement()` is the only path from `consent` to `allocating` in `AppState`, and allocation refuses to run without `consentAt`. |
| FR-AIA-02/03 · grounded answers | `retrieve()` returns a library entry or an escalation — never a generated answer. Every rendered answer cites its slug and version. |
| FR-SUB-02 · no in-app purchase | No price and no buy button exists in the app. The plan tile and onboarding both point at the website. |
| FR-EMG-07 · evidence is immutable | `AppState` exposes `addEvidence` and no edit or delete action; the case screen has no such control. |
| FR-AUTH-06 · passphrase is mandatory | The passphrase step has no skip control, and `Plan` disables the back gesture. |
| FR-VLT-07 · client-side search | Vault search filters already-decrypted metadata in `useMemo`; there is no server query to make, since the server holds ciphertext. |

## What is real, what is stubbed

**Real, running locally:**

- **Scam Check** (`src/data/engine.ts`) scores pasted artefacts on genuine
  signals — link shorteners, plain http, brand names on non-official domains,
  cheap TLDs, bare IPs, login/KYC/refund paths, UPI handles dressed up as support
  accounts, international callers claiming to be Indian banks, credential asks,
  remote-access tooling, urgency, threats and bait. Three verdict levels, a
  confidence, the reasons that drove it and three next steps. Try
  `http://sbi-kyc-update.xyz/login` against `cybercrime.gov.in`.
- **Content Library retrieval** matches a question to an approved entry by
  keyword and escalates to an advocate when nothing matches, rather than
  inventing an answer.
- **RBI window countdown** ticks live off `incident_at + 5 calendar days`.
- Passphrase strength, recovery-phrase generation and the 3-word confirmation.

**Stubbed, and marked as such in the UI where a user would otherwise be misled:**

- **Bank fraud helpline** — the row says where to find the right number instead
  of showing one. Sourcing and maintaining that directory is an open question in
  the scope document; a wrong number here costs someone the reporting window.
- **Screenshot scam check** — needs server-side OCR. The tab explains that and
  routes to pasting the text.
- **Masked calling, OTP delivery, uploads, encryption, payouts, web checkout** —
  all server-side. Buttons are inert rather than faking success.
- **State is in memory.** Nothing persists across a reload; `AppStateProvider` is
  where an API client would slot in.

## Layout of the code

```
App.tsx                    providers, font loading, navigation theme
src/theme/                 tokens (both themes) + provider
src/i18n/                  every string in en + hi, and the provider
src/state/AppState.tsx     the whole app's state; where the API client goes
src/data/types.ts          entities, named to match the scope's data model
src/data/mock.ts           seed data, dates relative to today
src/data/engine.ts         local Scam Check scoring + library retrieval
src/components/            Icon, Logo, and the UI kit (ui.tsx)
src/navigation/            stack + tabs + custom tab bar
src/screens/               one file per screen
design/                    the HTML home-screen mockup this was built from
```

## Next, in order

1. Run it on a real API-26 handset and do the polish pass — tap targets, the
   status-bar transition into the green panel, TalkBack labels (NFR-18).
2. Persist state (`AsyncStorage` for language and onboarding; the vault
   passphrase belongs in the OS keystore, never in JS storage).
3. Replace `AppStateProvider`'s internals with the `/api/v1` client from
   Section 21, keeping the same interface so screens do not change.
4. Client-side encryption — this is the one part that cannot be retrofitted.
   Section 23's key hierarchy has to be built before any real document is stored.
