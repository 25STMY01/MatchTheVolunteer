import { invokeRpc } from './transport';
import type { ClosestVolunteersResponse, Volunteer } from '../../types/volunteer';
import type { AvailabilityQuery, VolunteerFilters } from '../../types/matching';

export async function getAvailabilitySlots(): Promise<string[]> {
  return invokeRpc('getAvailabilitySlots');
}

export async function searchVolunteerByCode(code: string): Promise<Volunteer> {
  return invokeRpc('searchVolunteerByCode', code);
}

export async function getVolunteersList(): Promise<Volunteer[]> {
  return invokeRpc('getVolunteersList');
}

export async function getMatchingVolunteersForCase(
  caseId: string,
  availabilityFilters: AvailabilityQuery = { filters: [], mode: 'OR' },
  volunteerFilters: VolunteerFilters = { matchLanguage: false, matchGender: false, matchReligion: false },
  k?: number
): Promise<ClosestVolunteersResponse> {
  return invokeRpc('getMatchingVolunteersForCase', caseId, availabilityFilters, volunteerFilters, k ?? 5);
}
