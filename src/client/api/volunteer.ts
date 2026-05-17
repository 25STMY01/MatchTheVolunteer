import { invokeRpc } from './transport';
import type { ClosestVolunteersResponse, Volunteer } from '../../types/volunteer';
import type { AvailabilityQuery } from '../../types/availabilities';

export async function getAvailabilitySlots(): Promise<string[]> {
  return invokeRpc('getAvailabilitySlots');
}

export async function searchVolunteerByCode(code: string): Promise<Volunteer> {
  return invokeRpc('searchVolunteerByCode', code);
}

export async function getMatchingVolunteersForCase(
  caseId: string,
  availabilityFilters: AvailabilityQuery = { filters: [], mode: 'OR' },
  k?: number
): Promise<ClosestVolunteersResponse> {
  return invokeRpc('getMatchingVolunteersForCase', caseId, availabilityFilters, k ?? 5);
}
