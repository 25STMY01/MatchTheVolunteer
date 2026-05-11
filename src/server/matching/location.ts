import { computeRouteMatrixDistancesKm } from '../external/googleMaps';
import { Case } from '../../types/case';
import { Volunteer, VolunteerWithDistance } from '../../types/volunteer';

function isMatrixError(
  r: (number | null)[] | { error: string }
): r is { error: string } {
  return !Array.isArray(r);
}

// Finds k-nearest volunteers for volunteerOptions based on caseLocation
export async function findClosestVolunteers(
  caseObj: Case,
  volunteerOptions: Volunteer[],
  k = 5
): Promise<VolunteerWithDistance[]> {
  const caseLocation = caseObj.location?.trim() ?? '';
  if (!caseLocation) {
    return [];
  }

  const destStrings = volunteerOptions.map((v) => v.location ?? '');
  const matrixResult = await computeRouteMatrixDistancesKm(
    caseLocation,
    destStrings
  );

  if (isMatrixError(matrixResult)) {
    return [];
  }

  const candidates: VolunteerWithDistance[] = [];
  for (let i = 0; i < volunteerOptions.length; i += 1) {
    const dist = matrixResult[i];
    if (dist == null || Number.isNaN(dist)) {
      continue;
    }
    candidates.push({
      volunteer: volunteerOptions[i],
      distanceKm: dist,
    });
  }

  candidates.sort((a, b) => a.distanceKm - b.distanceKm);
  return candidates.slice(0, k);
}
