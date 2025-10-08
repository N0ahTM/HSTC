import { useMemo } from 'react';

const YEAR_OFFSET = 0;
const FOUNDATION_YEAR = 2017;

export function useVerseYear() {
  return useMemo(() => {
    const realYear = new Date().getFullYear();
    const verseYear = realYear + YEAR_OFFSET;
    return {
      verseYear,
      foundationYear: FOUNDATION_YEAR,
      showRange: verseYear !== FOUNDATION_YEAR
    };
  }, []);
}
