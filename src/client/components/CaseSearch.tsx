import { useState, useEffect } from 'react';
import { getCasesList } from '../api/case';
import {
  getMatchingVolunteersForCase,
  getAvailableGenders,
  getAvailableReligions,
  getAvailableLanguages,
} from '../api/volunteer';
import { Case, getCaseLabel } from '../../types/case';
import { ClosestVolunteersResponse } from '../../types/volunteer';
import {
  AvailabilityQuery,
  DAYS,
  VolunteerFilters,
} from '../../types/matching';
import AvailabilitySearch from './AvailabilitySearch';
import FilterPanel from './FilterPanel';

function isFilteredSlot(
  query: AvailabilityQuery,
  day: string,
  slot: string
): boolean {
  return query.filters.some((f) => f.day === day && f.timeSlot === slot);
}

function CaseSearch() {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [loadingCases, setLoadingCases] = useState(true);
  const [loadingCaseData, setLoadingCaseData] = useState(false);
  const [closestVolunteers, setClosestVolunteers] =
    useState<ClosestVolunteersResponse>([]);
  const [error, setError] = useState<string | null>(null);
  const [availabilityFilters, setAvailabilityFilters] =
    useState<AvailabilityQuery>({ filters: [], mode: 'OR' });
  const [volunteerFilters, setVolunteerFilters] = useState<VolunteerFilters>({
    selectedLanguages: [],
    selectedGenders: [],
    selectedReligions: [],
  });
  const [showClosedCases, setShowClosedCases] = useState(false);
  const [showVolunteerMatching, setShowVolunteerMatching] = useState(false);
  const [availableGenders, setAvailableGenders] = useState<string[]>([]);
  const [availableReligions, setAvailableReligions] = useState<string[]>([]);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  useEffect(() => {
    setLoadingCases(true);
    getCasesList()
      .then((casesList) => {
        setLoadingCases(false);
        setCases(casesList || []);
      })
      .catch(() => {
        setLoadingCases(false);
        setCases([]);
      });
  }, []);

  useEffect(() => {
    Promise.all([
      getAvailableGenders().catch(() => []),
      getAvailableReligions().catch(() => []),
      getAvailableLanguages().catch(() => []),
    ])
      .then(([genders, religions, languages]) => {
        setAvailableGenders(genders || []);
        setAvailableReligions(religions || []);
        setAvailableLanguages(languages || []);
      })
      .catch(() => {
        // Silently fail if filter options can't be loaded
      });
  }, []);

  useEffect(() => {
    if (!selectedCaseId) {
      setSelectedCase(null);
      setClosestVolunteers([]);
      setError(null);
      return;
    }

    const c = cases.find((x) => x.id === selectedCaseId) ?? null;
    setSelectedCase(c);

    setLoadingCaseData(true);
    setClosestVolunteers([]);
    setError(null);

    getMatchingVolunteersForCase(
      selectedCaseId,
      availabilityFilters,
      volunteerFilters
    )
      .then((result) => {
        setLoadingCaseData(false);
        setClosestVolunteers(result);
      })
      .catch((err: Error) => {
        setLoadingCaseData(false);
        setError(err.message);
      });
  }, [selectedCaseId, availabilityFilters, volunteerFilters, cases]);

  const renderCaseBiodata = () => {
    if (error) {
      return (
        <div className="result error">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      );
    }

    if (!selectedCaseId || !selectedCase) return null;

    const isCaseClosed =
      selectedCase.closedDate && selectedCase.closedDate !== '';
    const statusBadgeColor = isCaseClosed ? '#ef4444' : '#10b981';
    const statusText = isCaseClosed ? 'Closed' : 'Open';

    return (
      <div className="result">
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '10px' }}>Case Biodata</h3>
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              backgroundColor: statusBadgeColor,
              color: 'white',
              padding: '4px 12px',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            {statusText}
          </div>
        </div>
        <table style={{ marginBottom: '20px' }}>
          <tbody>
            <tr>
              <td>
                <strong>Gender:</strong>
              </td>
              <td>{selectedCase.gender || 'N/A'}</td>
            </tr>
            <tr>
              <td>
                <strong>Date of First Contact:</strong>
              </td>
              <td>{selectedCase.dateOfFirstContact || 'N/A'}</td>
            </tr>
            <tr>
              <td>
                <strong>Language 1:</strong>
              </td>
              <td>{selectedCase.language1 || 'N/A'}</td>
            </tr>
            <tr>
              <td>
                <strong>Patient Address:</strong>
              </td>
              <td>{selectedCase.patientAddress || 'N/A'}</td>
            </tr>
            <tr>
              <td>
                <strong>Case Closed Date:</strong>
              </td>
              <td style={{ color: isCaseClosed ? 'var(--text-muted)' : 'var(--primary)' }}>
                {isCaseClosed ? selectedCase.closedDate : 'N/A'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderVolunteerResults = () => {
    return (
      <div className="result">
        <h3>Top 5 Volunteers</h3>
        {!closestVolunteers.length ? (
          <p>No volunteers with valid locations found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Travel Time</th>
                <th>Address</th>
                <th>Availability</th>
              </tr>
            </thead>
            <tbody>
              {closestVolunteers.map(({ volunteer: vol, travelTimeMinutes, distanceKm }) => {
                const availDays = DAYS.filter(
                  (day) => vol.availabilities[day]?.length
                );
                return (
                  <tr key={vol.code}>
                    <td>
                      <strong>{vol.code}</strong>
                    </td>
                    <td>
                      {travelTimeMinutes != null && travelTimeMinutes >= 0
                        ? travelTimeMinutes >= 60
                          ? `${Math.floor(travelTimeMinutes / 60)}h ${travelTimeMinutes % 60}m`
                          : `${travelTimeMinutes} mins`
                        : distanceKm && distanceKm > 0
                        ? `${distanceKm.toFixed(2)} km`
                        : 'N/A'}
                    </td>
                    <td>{vol.area || vol.location || 'N/A'}</td>
                    <td style={{ fontSize: 12 }}>
                      {availDays.length === 0
                        ? 'N/A'
                        : availDays.map((day) => (
                            <div key={day}>
                              <span>{day.slice(0, 3)}:</span>{' '}
                              {vol.availabilities[day]!.map((slot, i) => (
                                <span key={slot}>
                                  {i > 0 && ', '}
                                  {isFilteredSlot(
                                    availabilityFilters,
                                    day,
                                    slot
                                  ) ? (
                                    <strong>{slot}</strong>
                                  ) : (
                                    slot
                                  )}
                                </span>
                              ))}
                            </div>
                          ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  const filteredCases = showClosedCases
    ? cases
    : cases.filter((c) => !c.closedDate || c.closedDate === '');

  return (
    <>
      <h3>Search by Case & Volunteer</h3>
      <div className="form-group">
        <div
          style={{
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <input
            type="checkbox"
            id="showClosedToggle"
            checked={showClosedCases}
            onChange={(e) => setShowClosedCases(e.target.checked)}
          />
          <label
            htmlFor="showClosedToggle"
            style={{ margin: 0, cursor: 'pointer' }}
          >
            Show Closed Cases
          </label>
        </div>
        <label htmlFor="caseDropdown">Select Case:</label>
        <select
          id="caseDropdown"
          value={selectedCaseId}
          onChange={(e) => setSelectedCaseId(e.target.value)}
          disabled={loadingCases}
        >
          <option value="">
            {loadingCases ? 'Loading cases...' : 'Select a case...'}
          </option>
          {filteredCases.map((c) => (
            <option key={c.id} value={c.id}>
              {getCaseLabel(c)}
            </option>
          ))}
        </select>
      </div>
      {loadingCaseData && <div className="loading">Loading...</div>}
      {renderCaseBiodata()}
      {selectedCase && (
        <div style={{ marginTop: '20px', marginBottom: '20px' }}>
          <button
            onClick={() => setShowVolunteerMatching(!showVolunteerMatching)}
            style={{
              backgroundColor: '#10b981',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
            }}
          >
            {showVolunteerMatching ? 'Hide' : 'Search for Matching Volunteers'}
          </button>
        </div>
      )}
      {showVolunteerMatching && (
        <div className="filters-group">
          <h4 className="filters-group-heading">Filters</h4>
          <AvailabilitySearch onSave={setAvailabilityFilters} />
          <FilterPanel
            selectedLanguages={volunteerFilters.selectedLanguages}
            selectedGenders={volunteerFilters.selectedGenders}
            selectedReligions={volunteerFilters.selectedReligions}
            availableLanguages={availableLanguages}
            availableGenders={availableGenders}
            availableReligions={availableReligions}
            onLanguageChange={(langs) =>
              setVolunteerFilters((prev) => ({
                ...prev,
                selectedLanguages: langs,
              }))
            }
            onGenderChange={(genders) =>
              setVolunteerFilters((prev) => ({
                ...prev,
                selectedGenders: genders,
              }))
            }
            onReligionChange={(religions) =>
              setVolunteerFilters((prev) => ({
                ...prev,
                selectedReligions: religions,
              }))
            }
            onApply={() => {
              setVolunteerFilters((prev) => ({ ...prev }));
            }}
            isLoading={loadingCaseData}
          />
        </div>
      )}
      {showVolunteerMatching && renderVolunteerResults()}
    </>
  );
}

export default CaseSearch;
