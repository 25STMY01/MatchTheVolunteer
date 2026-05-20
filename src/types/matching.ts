export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export type Availabilities = Partial<Record<typeof DAYS[number], string[]>>;

export interface AvailabilitiesFilter {
  day: typeof DAYS[number];
  timeSlot: string;
}

export type FilterMode = 'AND' | 'OR';

export interface AvailabilityQuery {
  filters: AvailabilitiesFilter[];
  mode: FilterMode;
}

/** Optional demographic filters: if a field is true, volunteers must match the case's value for that field. */
export interface VolunteerFilters {
  matchLanguage: boolean;
  matchGender: boolean;
  matchReligion: boolean;
}
