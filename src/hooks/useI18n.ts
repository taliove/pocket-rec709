import { useSyncExternalStore } from "react";
import {
  getLocaleSetting,
  getEffectiveLocale,
  getStrings,
  setLocale,
  subscribe,
  type LocaleSetting,
  type SupportedLocale,
  type Strings,
} from "../lib/i18n";

export function useI18n(): {
  t: Strings;
  locale: LocaleSetting;
  effectiveLocale: SupportedLocale;
  setLocale: (l: LocaleSetting) => void;
} {
  // Track changes to locale via subscription
  useSyncExternalStore(
    subscribe,
    () => getLocaleSetting(),
    () => "auto" as LocaleSetting
  );

  return {
    t: getStrings(),
    locale: getLocaleSetting(),
    effectiveLocale: getEffectiveLocale(),
    setLocale,
  };
}
