import { useState, useEffect } from 'react';
import { DAYS } from '../../types/availabilities';
import type { AvailabilitiesFilter, AvailabilityQuery, FilterMode } from '../../types/availabilities';
import { getAvailabilitySlots } from '../api/volunteer';

interface Props {
  onSave: (query: AvailabilityQuery) => void;
}

function AvailabilitySearch({ onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<Record<string, Record<string, boolean>>>({});
  const [mode, setMode] = useState<FilterMode>('OR');

  useEffect(() => {
    getAvailabilitySlots()
      .then((discovered) => {
        setSlots(discovered);
        const init: Record<string, Record<string, boolean>> = {};
        for (const day of DAYS) {
          init[day] = {};
          for (const slot of discovered) {
            init[day][slot] = false;
          }
        }
        setSelectedSlots(init);
        setLoading(false);
      })
      .catch((err: Error) => {
        setLoadError(err.message);
        setLoading(false);
      });
  }, []);

  const toggleSlot = (day: string, slot: string) => {
    setSelectedSlots((prev) => ({
      ...prev,
      [day]: { ...prev[day], [slot]: !prev[day]?.[slot] },
    }));
  };

  const toggleAllDay = (day: string) => {
    const allSelected = slots.length > 0 && slots.every((slot) => selectedSlots[day]?.[slot]);
    setSelectedSlots((prev) => ({
      ...prev,
      [day]: Object.fromEntries(slots.map((slot) => [slot, !allSelected])),
    }));
  };

  const buildFilters = (): AvailabilitiesFilter[] => {
    const filters: AvailabilitiesFilter[] = [];
    for (const day of DAYS) {
      for (const slot of slots) {
        if (selectedSlots[day]?.[slot]) {
          filters.push({ day: day as typeof DAYS[number], timeSlot: slot });
        }
      }
    }
    return filters;
  };

  const handleSave = () => {
    onSave({ filters: buildFilters(), mode });
    setOpen(false);
  };

  const handleClear = () => {
    const reset: Record<string, Record<string, boolean>> = {};
    for (const day of DAYS) {
      reset[day] = {};
      for (const slot of slots) {
        reset[day][slot] = false;
      }
    }
    setSelectedSlots(reset);
    onSave({ filters: [], mode });
    setOpen(false);
  };

  const selectedCount = buildFilters().length;

  return (
    <div style={{ marginBottom: 12 }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={loading || !!loadError}
        style={{ background: '#607d8b', marginBottom: 0 }}
      >
        {loading
          ? 'Loading availability...'
          : loadError
          ? 'Availability unavailable'
          : open
          ? 'Close'
          : `Filter by Availability${selectedCount > 0 ? ` (${selectedCount} selected)` : ''}`}
      </button>

      {open && !loading && !loadError && (
        <div style={{ border: '1px solid #ddd', borderRadius: 4, padding: 12, marginTop: 8, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Day</th>
                {slots.map((slot) => (
                  <th key={slot} style={{ textAlign: 'center', fontSize: 12, padding: '0 8px' }}>{slot}</th>
                ))}
                <th style={{ textAlign: 'center' }}>All</th>
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day) => {
                const allSelected = slots.length > 0 && slots.every((slot) => selectedSlots[day]?.[slot]);
                return (
                  <tr key={day}>
                    <td>{day}</td>
                    {slots.map((slot) => (
                      <td key={slot} style={{ textAlign: 'center', padding: '6px 8px' }}>
                        <input
                          type="checkbox"
                          checked={selectedSlots[day]?.[slot] ?? false}
                          onChange={() => toggleSlot(day, slot)}
                        />
                      </td>
                    ))}
                    <td style={{ textAlign: 'center', padding: '6px 8px' }}>
                      <input
                        type="checkbox"
                        checked={allSelected}
                        onChange={() => toggleAllDay(day)}
                        title={`Select all slots for ${day}`}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
            <button type="button" onClick={handleSave} style={{ flex: 1 }}>
              Save
            </button>
            <button
              type="button"
              onClick={() => setMode((m: FilterMode) => (m === 'OR' ? 'AND' : 'OR'))}
              style={{ flex: 0, minWidth: 90, whiteSpace: 'nowrap', background: mode === 'AND' ? '#455a64' : '#78909c' }}
              title={mode === 'OR' ? 'Currently: match any selected slot' : 'Currently: match all selected slots'}
            >
              {mode === 'OR' ? 'Match Any' : 'Match All'}
            </button>
            <button
              type="button"
              onClick={handleClear}
              style={{ flex: 0, background: '#757575', minWidth: 80 }}
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AvailabilitySearch;
