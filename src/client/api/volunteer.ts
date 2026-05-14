import { invokeRpc } from './transport';
import type { ClosestVolunteersResponse, Volunteer } from '../../types/volunteer';
import type { AvailabilitiesFilter, FilterMode } from '../../types/availabilities';

export async function getAvailabilitySlots(): Promise<string[]> {
  return invokeRpc('getAvailabilitySlots');
}

export async function searchVolunteerByCode(code: string): Promise<Volunteer> {
  return invokeRpc('searchVolunteerByCode', code);
}

export async function getMatchingVolunteersForCase(
  caseId: string,
  filters: AvailabilitiesFilter[] = [],
  filterMode: FilterMode = 'OR',
  k?: number
): Promise<ClosestVolunteersResponse> {
  return invokeRpc('getMatchingVolunteersForCase', caseId, filters, k ?? 5, filterMode);
}
