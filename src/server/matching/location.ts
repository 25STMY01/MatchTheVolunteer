import { batchComputeVolunteerTravelTimes } from '../external/oneMap';
import { Case } from '../../types/case';
import { Volunteer, VolunteerWithDistance } from '../../types/volunteer';

/**
 * Finds top-k nearest volunteers for volunteerOptions based on public transport travel time
 * to the case's patient address using OneMap API.
 *
 * All matching volunteers that passed the availability and attribute filters are evaluated,
 * sorted ascending by travel time (lowest travel time first), and the top k are returned.
 */
export async function findClosestVolunteers(
  caseObj: Case,
  volunteerOptions: Volunteer[],
  k = 5
): Promise<VolunteerWithDistance[]> {
  if (!volunteerOptions || volunteerOptions.length === 0) {
    return [];
  }

  // Use postal code if available, otherwise patient address
  const patientLocation =
    caseObj.patientPostalCode?.trim() ||
    caseObj.patientAddress?.trim() ||
    caseObj.location?.trim() ||
    '';

  if (!patientLocation) {
    return volunteerOptions.slice(0, k).map((volunteer) => ({
      volunteer,
      travelTimeMinutes: null,
    }));
  }

  const volunteerLocations = volunteerOptions.map(
    (v) => v.area?.trim() || v.location?.trim() || ''
  );

  const travelTimes = await batchComputeVolunteerTravelTimes(
    volunteerLocations,
    patientLocation
  );

  const withTimes: VolunteerWithDistance[] = [];
  const withoutTimes: VolunteerWithDistance[] = [];

  for (let i = 0; i < volunteerOptions.length; i += 1) {
    const time = travelTimes[i];
    const candidate: VolunteerWithDistance = {
      volunteer: volunteerOptions[i],
      travelTimeMinutes: time,
    };

    if (time != null && !Number.isNaN(time)) {
      withTimes.push(candidate);
    } else {
      withoutTimes.push(candidate);
    }
  }

  // Sort candidates with valid travel time in ascending order (lowest first)
  withTimes.sort((a, b) => (a.travelTimeMinutes ?? Infinity) - (b.travelTimeMinutes ?? Infinity));

  // Combine resolved candidates first, then any unresolved
  const combined = [...withTimes, ...withoutTimes];
  return combined.slice(0, k);
}
