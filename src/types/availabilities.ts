export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export type Availabilities = Record<string, string[]>;

export interface AvailabilitiesFilter {
  day: typeof DAYS[number];
  timeSlot: string;
}

export type FilterMode = 'AND' | 'OR';
