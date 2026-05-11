
import { ClosestVolunteersResponse, Volunteer } from '../../types/volunteer';
import { findClosestVolunteers } from '../matching/location';
import { VolunteerRepository } from "../repository/VolunteerRepository";
import { CaseRepository } from "../repository/CaseRepository";

export function searchVolunteerByCode(code: string): Volunteer {
  const repository = VolunteerRepository.getVolunteerRepository();
  const volunteer = repository.findByCode(code);
  if (!volunteer) {
    throw new Error(`Volunteer not found with code: ${code}`);
  }
  return volunteer;
}

export async function getClosestVolunteersForCase(
  caseRowId: string,
  filters: AvailabilitiesFilter[] = [],
  k = 5
): Promise<ClosestVolunteersResponse> {
  try {
    const rowIndex = parseInt(caseRowId, 10);
    if (Number.isNaN(rowIndex) || rowIndex < 1) {
      throw new Error('Invalid caseRowId');
    }

    const caseRepository = CaseRepository.getCaseRepository();
    const caseObj = caseRepository.findByRowIndex(rowIndex);

    if (!caseObj) {
      throw new Error(`Case row not found for id: ${caseRowId}`);
    }

    const volunteerRepository = VolunteerRepository.getVolunteerRepository();
    const volunteers = volunteerRepository.getAll();

    const closestVolunteers = await findClosestVolunteers(
      caseObj,
      volunteers,
      k
    );

    return closestVolunteers;
  } catch (error) {
    throw new Error(
      `Error finding closest volunteers: ${(error as Error).toString()}`
    );
  }
}
