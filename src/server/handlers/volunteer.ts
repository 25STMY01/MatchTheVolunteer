import { ClosestVolunteersResponse, Volunteer } from '../../types/volunteer';
import { AvailabilityQuery, VolunteerFilters } from '../../types/matching';
import { findClosestVolunteers } from '../matching/location';
import { filterVolunteersByAvailabilities } from '../matching/availabilities';
import { filterVolunteersByAttributes } from '../matching/attributes';
import { VolunteerRepository } from '../repository/VolunteerRepository';
import { CaseRepository } from '../repository/CaseRepository';

export function getAvailabilitySlots(): string[] {
  return VolunteerRepository.getVolunteerRepository().getAvailabilitySlots();
}

export function searchVolunteerByCode(code: string): Volunteer {
  const repository = VolunteerRepository.getVolunteerRepository();
  const volunteer = repository.findByCode(code);
  if (!volunteer) {
    throw new Error(`Volunteer not found with code: ${code}`);
  }
  return volunteer;
}

export function getVolunteersList(): Volunteer[] {
  const repository = VolunteerRepository.getVolunteerRepository();
  return repository.getAll();
}

const DEFAULT_VOLUNTEER_FILTERS: VolunteerFilters = {
  matchLanguage: false,
  matchGender: false,
  matchReligion: false,
};

export async function getMatchingVolunteersForCase(
  caseRowId: string,
  availabilityFilters: AvailabilityQuery = { filters: [], mode: 'OR' },
  volunteerFilters: VolunteerFilters = DEFAULT_VOLUNTEER_FILTERS,
  k = 5
): Promise<ClosestVolunteersResponse> {
  try {
    const rowIndex = parseInt(caseRowId, 10);
    if (Number.isNaN(rowIndex) || rowIndex < 1) {
      throw new Error('Invalid caseRowId');
    }

    const caseObj = CaseRepository.getCaseRepository().findByRowIndex(rowIndex);
    if (!caseObj) {
      throw new Error(`Case row not found for id: ${caseRowId}`);
    }

    let volunteers = filterVolunteersByAvailabilities(
      VolunteerRepository.getVolunteerRepository().getAll(),
      availabilityFilters
    );

    volunteers = filterVolunteersByAttributes(volunteers, volunteerFilters, caseObj);

    return findClosestVolunteers(caseObj, volunteers, k);
  } catch (error) {
    throw new Error(
      `Error finding matching volunteers: ${(error as Error).toString()}`
    );
  }
}
