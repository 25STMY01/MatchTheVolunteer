import { invokeRpc } from './transport';
import type { ClosestVolunteersResponse, Volunteer } from '../../types/volunteer';
import type { AvailabilityQuery, VolunteerFilters } from '../../types/matching';

export async function getAvailabilitySlots(): Promise<string[]> {
  return invokeRpc('getAvailabilitySlots');
}

export async function getAvailableGenders(): Promise<string[]> {
  return invokeRpc('getAvailableGenders');
}

export async function getAvailableReligions(): Promise<string[]> {
  return invokeRpc('getAvailableReligions');
}

export async function getAvailableLanguages(): Promise<string[]> {
  return invokeRpc('getAvailableLanguages');
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
  volunteerFilters: VolunteerFilters = { selectedLanguages: [], selectedGenders: [], selectedReligions: [] },
  k?: number
): Promise<ClosestVolunteersResponse> {
  return invokeRpc('getMatchingVolunteersForCase', caseId, availabilityFilters, volunteerFilters, k ?? 5);
}
