/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useMemo } from 'react';
import { LanguageCode } from './types';
import { createTranslator } from './data/localization';

type Translator = ReturnType<typeof createTranslator>;

interface LocalizationContextValue {
  language: LanguageCode;
  t: Translator;
}

const LocalizationContext = createContext<LocalizationContextValue>({
  language: 'en',
  t: createTranslator('en'),
});

export const LocalizationProvider: React.FC<{
  language: LanguageCode;
  children: React.ReactNode;
}> = ({ language, children }) => {
  const value = useMemo(() => ({
    language,
    t: createTranslator(language),
  }), [language]);

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useI18n = () => useContext(LocalizationContext);
