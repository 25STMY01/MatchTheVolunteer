import { Volunteer } from '../../types/volunteer';
import { Case } from '../../types/case';
import { VolunteerFilters } from '../../types/matching';

function normalise(s: string): string {
  return s.trim().toLowerCase();
}

/** Returns true if any token in `haystack` (comma/slash-separated) matches `needle`. */
function containsLanguage(haystack: string, needle: string): boolean {
  if (!haystack || !needle) return false;
  const tokens = haystack.split(/[,/]+/).map(normalise);
  return tokens.some((t) => t === normalise(needle));
}

export function filterVolunteersByAttributes(
  volunteers: Volunteer[],
  filters: VolunteerFilters,
  caseObj: Case
): Volunteer[] {
  return volunteers.filter((vol) => {
    if (filters.matchGender) {
      const caseGender = normalise(caseObj.patientGender || caseObj.gender || '');
      const volGender = normalise(vol.gender || '');
      if (!caseGender || !volGender || caseGender !== volGender) return false;
    }

    if (filters.matchReligion) {
      const caseReligion = normalise(caseObj.religion || '');
      const volReligion = normalise(vol.religion || '');
      if (!caseReligion || !volReligion || caseReligion !== volReligion) return false;
    }

    if (filters.matchLanguage) {
      const caseLanguages = [caseObj.language1, caseObj.language2, caseObj.patientLanguage1, caseObj.patientLanguage2]
        .map((l) => (l || '').trim())
        .filter(Boolean);
      if (caseLanguages.length === 0) return false;
      const matches = caseLanguages.some((lang) => containsLanguage(vol.spokenLanguages, lang));
      if (!matches) return false;
    }

    return true;
  });
}
