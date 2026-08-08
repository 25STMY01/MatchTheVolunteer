import { useState } from 'react';

interface FilterPanelProps {
  selectedLanguages: string[];
  selectedGenders: string[];
  selectedReligions: string[];
  availableLanguages: string[];
  availableGenders: string[];
  availableReligions: string[];
  onLanguageChange: (languages: string[]) => void;
  onGenderChange: (genders: string[]) => void;
  onReligionChange: (religions: string[]) => void;
  onApply: () => void;
  isLoading?: boolean;
}

interface FilterSectionState {
  languages: boolean;
  genders: boolean;
  religions: boolean;
}

function FilterPanel({
  selectedLanguages,
  selectedGenders,
  selectedReligions,
  availableLanguages,
  availableGenders,
  availableReligions,
  onLanguageChange,
  onGenderChange,
  onReligionChange,
  onApply,
  isLoading = false,
}: FilterPanelProps) {
  const [openSections, setOpenSections] = useState<FilterSectionState>({
    languages: false,
    genders: false,
    religions: false,
  });

  const toggleSection = (section: keyof FilterSectionState) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleLanguageToggle = (lang: string) => {
    const newLanguages = selectedLanguages.includes(lang)
      ? selectedLanguages.filter((l) => l !== lang)
      : [...selectedLanguages, lang];
    onLanguageChange(newLanguages);
  };

  const handleGenderToggle = (gender: string) => {
    const newGenders = selectedGenders.includes(gender)
      ? selectedGenders.filter((g) => g !== gender)
      : [...selectedGenders, gender];
    onGenderChange(newGenders);
  };

  const handleReligionToggle = (religion: string) => {
    const newReligions = selectedReligions.includes(religion)
      ? selectedReligions.filter((r) => r !== religion)
      : [...selectedReligions, religion];
    onReligionChange(newReligions);
  };

  const renderFilterSection = (
    title: string,
    options: string[],
    selected: string[],
    onToggle: (option: string) => void,
    onClear: () => void,
    section: keyof FilterSectionState
  ) => {
    const isOpen = openSections[section];

    return (
      <div key={title} className={`filter-section ${isOpen ? 'open' : ''}`}>
        <div
          className={`filter-section-header ${isOpen ? 'open' : ''}`}
          onClick={() => toggleSection(section)}
        >
          <span className="filter-section-title">
            <span className="filter-section-icon">{isOpen ? '▼' : '▶'}</span>
            {title} {selected.length > 0 && `(${selected.length})`}
          </span>
        </div>
        {isOpen && (
          <div className="filter-section-content">
            {options.length > 0 ? (
              <>
                {options.map((option) => (
                  <div key={option} className="filter-option">
                    <input
                      type="checkbox"
                      id={`filter-${section}-${option}`}
                      checked={selected.includes(option)}
                      onChange={() => onToggle(option)}
                    />
                    <label htmlFor={`filter-${section}-${option}`}>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </label>
                  </div>
                ))}
                {selected.length > 0 && (
                  <button className="filter-clear-btn" onClick={onClear}>
                    Clear
                  </button>
                )}
              </>
            ) : (
              <p style={{ color: '#999', fontSize: '12px', margin: '8px 0' }}>
                No options available
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="filter-panel">
      {renderFilterSection(
        'Filter by Language',
        availableLanguages,
        selectedLanguages,
        handleLanguageToggle,
        () => onLanguageChange([]),
        'languages'
      )}

      {renderFilterSection(
        'Filter by Gender',
        availableGenders,
        selectedGenders,
        handleGenderToggle,
        () => onGenderChange([]),
        'genders'
      )}

      {renderFilterSection(
        'Filter by Religion',
        availableReligions,
        selectedReligions,
        handleReligionToggle,
        () => onReligionChange([]),
        'religions'
      )}

      <button
        className="filter-apply-btn"
        onClick={onApply}
        disabled={isLoading}
      >
        {isLoading ? 'Applying...' : 'Apply Filters'}
      </button>
    </div>
  );
}

export default FilterPanel;
