import { invokeRpc } from './transport';
import type {
  ClosestVolunteersResponse,
  Volunteer,
} from '../../types/volunteer';

export async function searchVolunteerByCode(code: string): Promise<Volunteer> {
  return invokeRpc('searchVolunteerByCode', code);
}

export async function getClosestVolunteersForCase(
  caseId: string,
  k?: number
): Promise<ClosestVolunteersResponse> {
  return k === undefined
    ? invokeRpc('getClosestVolunteersForCase', caseId)
    : invokeRpc('getClosestVolunteersForCase', caseId, k);
}
