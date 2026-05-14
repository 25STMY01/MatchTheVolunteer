import { Volunteer } from "../../types/volunteer";
import { AvailabilitiesFilter, FilterMode } from "../../types/availabilities";

export function filterVolunteersByAvailabilities(
    volunteers: Volunteer[],
    filters: AvailabilitiesFilter[],
    mode: FilterMode = 'OR'
): Volunteer[] {
  if (!filters.length) return volunteers;

  const check = mode === 'AND' ? filters.every.bind(filters) : filters.some.bind(filters);
  return volunteers.filter(volunteer =>
    check(({ day, timeSlot }: AvailabilitiesFilter) =>
      volunteer.availabilities[day]?.includes(timeSlot)
    )
  );
}
