import { ClosestVolunteersResponse, Volunteer } from '../../types/volunteer';
import { AvailabilityQuery } from '../../types/availabilities';
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
  availabilityFilters: AvailabilityQuery = { filters: [], mode: 'OR' },
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

    const volunteers = filterVolunteersByAvailabilities(
      VolunteerRepository.getVolunteerRepository().getAll(),
      availabilityFilters
    );

    return findClosestVolunteers(caseObj, volunteers, k);
  } catch (error) {
    throw new Error(
      `Error finding matching volunteers: ${(error as Error).toString()}`
    );
  }
}
