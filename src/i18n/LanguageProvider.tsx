import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Lang, StringKey, strings } from './strings';

type LanguageValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  /** Look up a string in the active language. */
  t: (key: StringKey) => string;
  /** Format a number the way the active language writes digits. */
  n: (value: number) => string;
};

const LanguageContext = createContext<LanguageValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');

  const t = useCallback((key: StringKey) => strings[key][lang], [lang]);
  const n = useCallback((value: number) => value.toLocaleString('en-IN'), []);

  const value = useMemo<LanguageValue>(() => ({ lang, setLang, t, n }), [lang, t, n]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang(): LanguageValue {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useLang must be used inside LanguageProvider');
  return value;
}

/** Rupees, in the form Indian users read: ₹84,000 */
export function rupees(paise: number): string {
  return '₹' + Math.round(paise / 100).toLocaleString('en-IN');
}
