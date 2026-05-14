import { ClosestVolunteersResponse, Volunteer } from '../../types/volunteer';
import { AvailabilitiesFilter, FilterMode } from '../../types/availabilities';
import { findClosestVolunteers } from '../matching/location';
import { filterVolunteersByAvailabilities } from '../matching/availabilities';
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

export async function getMatchingVolunteersForCase(
  caseRowId: string,
  filters: AvailabilitiesFilter[] = [],
  k = 5,
  filterMode: FilterMode = 'OR'
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

    let volunteers = VolunteerRepository.getVolunteerRepository().getAll();
    if (filters.length > 0) {
      volunteers = filterVolunteersByAvailabilities(volunteers, filters, filterMode);
    }

    return findClosestVolunteers(caseObj, volunteers, k);
  } catch (error) {
    throw new Error(
      `Error finding matching volunteers: ${(error as Error).toString()}`
    );
  }
}
