import type { VolunteerFilters } from '../../types/matching';
import type { Case } from '../../types/case';

interface Props {
  filters: VolunteerFilters;
  onChange: (filters: VolunteerFilters) => void;
  selectedCase: Case | null;
}

interface FilterRow {
  key: keyof VolunteerFilters;
  label: string;
  hint: string | null;
}

function AttributeFilters({ filters, onChange, selectedCase }: Props) {
  const toggle = (key: keyof VolunteerFilters) => {
    onChange({ ...filters, [key]: !filters[key] });
  };

  const languageHint = selectedCase
    ? [selectedCase.language1, selectedCase.language2, selectedCase.patientLanguage1, selectedCase.patientLanguage2]
        .filter(Boolean)
        .join(', ') || null
    : null;

  const rows: FilterRow[] = [
    { key: 'matchLanguage', label: 'Language', hint: languageHint },
    { key: 'matchGender', label: 'Gender', hint: selectedCase ? (selectedCase.patientGender || selectedCase.gender || null) : null },
    { key: 'matchReligion', label: 'Religion', hint: selectedCase ? (selectedCase.religion || null) : null },
  ];

  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="filter-section">
      <div className="filter-section-header">
        Match volunteer to case
        {activeCount > 0 && <span className="filter-badge">{activeCount} active</span>}
      </div>
      <div className="filter-checkboxes">
        {rows.map(({ key, label, hint }) => (
          <label key={key} className="filter-checkbox-label">
            <input
              type="checkbox"
              checked={filters[key]}
              onChange={() => toggle(key)}
            />
            <span>{label}</span>
            {hint && <span className="filter-hint">{hint}</span>}
          </label>
        ))}
      </div>
    </div>
  );
}

export default AttributeFilters;
