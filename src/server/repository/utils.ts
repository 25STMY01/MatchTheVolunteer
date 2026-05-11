/**
 * Shared utilities for repository layer.
 * Used by CaseRepository and VolunteerRepository.
 */

import type { Row } from '../../types/sheets';
import { CaseRepository } from './CaseRepository';
import { VolunteerRepository } from './VolunteerRepository';

export function getValueByHeaderMatch(
  row: Row,
  searchTerms: string[]
): string {
  const obj = row as Record<string, string | number>;
  for (const key of Object.keys(obj)) {
    const normalized = key.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    if (searchTerms.some((term) => normalized.includes(term))) {
      const v = obj[key];
      if (v != null && v !== '') {
        const s = String(v).trim();
        if (s && s !== 'nan' && s !== 'null') return s;
      }
      return '';
    }
  }
  return '';
}

export function rowToObject<T extends Row>(
  headers: string[],
  row: (string | number)[]
): T {
  const obj: Record<string, string | number> = {};
  headers.forEach((h, i) => {
    obj[h] = row[i] ?? '';
  });
  return obj as T;
}

export function initAllRepositories(forceNew: boolean = false): void {
  CaseRepository.getCaseRepository(forceNew);
  VolunteerRepository.getVolunteerRepository(forceNew);
}
