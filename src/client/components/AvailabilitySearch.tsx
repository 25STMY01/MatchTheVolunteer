import { useState, useEffect, useMemo } from 'react';
import { DAYS } from '../../types/matching';
import type { AvailabilitiesFilter, AvailabilityQuery, FilterMode } from '../../types/matching';
import { getAvailabilitySlots } from '../api/volunteer';

interface Props {
  onSave: (query: AvailabilityQuery) => void;
}

type SlotSelection = Record<string, Record<string, boolean>>;

function initSelectedSlots(slots: string[]): SlotSelection {
  const init: SlotSelection = {};
  for (const day of DAYS) {
    init[day] = {};
    for (const slot of slots) {
      init[day][slot] = false;
    }
  }
  return init;
}

function getButtonLabel(loading: boolean, loadError: string | null, open: boolean, selectedCount: number): string {
  if (loading) return 'Loading availability...';
  if (loadError) return 'Availability unavailable';
  if (open) return 'Close';
  return `Filter by Availability${selectedCount > 0 ? ` (${selectedCount} selected)` : ''}`;
}

function AvailabilitySearch({ onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<SlotSelection>({});
  const [mode, setMode] = useState<FilterMode>('OR');

  useEffect(() => {
    getAvailabilitySlots()
      .then((discovered) => {
        setSlots(discovered);
        setSelectedSlots(initSelectedSlots(discovered));
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

  const activeFilters = useMemo((): AvailabilitiesFilter[] => {
    const filters: AvailabilitiesFilter[] = [];
    for (const day of DAYS) {
      for (const slot of slots) {
        if (selectedSlots[day]?.[slot]) {
          filters.push({ day: day as typeof DAYS[number], timeSlot: slot });
        }
      }
    }
    return filters;
  }, [selectedSlots, slots]);

  const handleSave = () => {
    onSave({ filters: activeFilters, mode });
    setOpen(false);
  };

  const handleClear = () => {
    setSelectedSlots(initSelectedSlots(slots));
    onSave({ filters: [], mode });
    setOpen(false);
  };

  return (
    <div className="filter-section">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={loading || !!loadError}
        className="filter-toggle-btn"
      >
        {getButtonLabel(loading, loadError, open, activeFilters.length)}
      </button>

      {open && !loading && !loadError && (
        <div className="availability-panel">
          <table className="availability-table">
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

          <div className="availability-actions">
            <button type="button" onClick={handleSave} className="btn-save">
              Save
            </button>
            <button
              type="button"
              onClick={() => setMode((m: FilterMode) => (m === 'OR' ? 'AND' : 'OR'))}
              className={`btn-mode ${mode === 'AND' ? 'btn-mode--and' : ''}`}
              title={mode === 'OR' ? 'Currently: match any selected slot' : 'Currently: match all selected slots'}
            >
              {mode === 'OR' ? 'Match Any' : 'Match All'}
            </button>
            <button type="button" onClick={handleClear} className="btn-clear">
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AvailabilitySearch;
