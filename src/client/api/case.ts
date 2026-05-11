import { invokeRpc } from './transport';
import type { Case } from '../../types/case';

export async function getCasesList(): Promise<Case[]> {
  return invokeRpc('getCasesList');
}
