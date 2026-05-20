import { Volunteer } from "../../types/volunteer";
import { AvailabilityQuery } from "../../types/matching";

export function filterVolunteersByAvailabilities(
  volunteers: Volunteer[],
  { filters, mode }: AvailabilityQuery
): Volunteer[] {
  if (!filters.length) return volunteers;

  const check = mode === 'AND' ? filters.every.bind(filters) : filters.some.bind(filters);
  return volunteers.filter((volunteer) =>
    check(({ day, timeSlot }) => volunteer.availabilities[day]?.includes(timeSlot))
  );
}
