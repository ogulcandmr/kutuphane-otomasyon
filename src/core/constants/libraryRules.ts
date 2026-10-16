export const LIBRARY_RULES = {
  FINE_RATES: {
    STUDENT: 5.0, // TL / gün
    ACADEMIC: 2.0, // TL / gün
    STANDARD: 10.0, // TL / gün
  },
  BORROW_LIMITS: {
    STUDENT: 3,
    ACADEMIC: 7,
    STANDARD: 2,
  },
  LOAN_DURATIONS_DAYS: {
    STUDENT: 15,
    ACADEMIC: 30,
    STANDARD: 14,
  },
  EXTENSION_DAYS: 7,
} as const;
