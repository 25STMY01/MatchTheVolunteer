import { Volunteer } from '../../types/volunteer';
import { VolunteerFilters } from '../../types/matching';

export function filterVolunteersByAttributes(
  volunteers: Volunteer[],
  filters: VolunteerFilters
): Volunteer[] {
  return volunteers.filter((vol) => {
    // Filter by selected genders
    if (filters.selectedGenders.length > 0) {
      const volGender = (vol.gender || '').trim().toLowerCase();
      if (!volGender || !filters.selectedGenders.includes(volGender)) {
        return false;
      }
    }

    // Filter by selected religions
    if (filters.selectedReligions.length > 0) {
      const volReligion = (vol.religion || '').trim().toLowerCase();
      if (!volReligion || !filters.selectedReligions.includes(volReligion)) {
        return false;
      }
    }

    // Filter by selected languages
    if (filters.selectedLanguages.length > 0) {
      const volLanguages = (vol.spokenLanguages || '')
        .split(/[,/]+/)
        .map((l) => l.trim().toLowerCase())
        .filter(Boolean);
      const hasMatchingLanguage = filters.selectedLanguages.some((selectedLang) =>
        volLanguages.includes(selectedLang)
      );
      if (!hasMatchingLanguage) {
        return false;
      }
    }

    return true;
  });
}
