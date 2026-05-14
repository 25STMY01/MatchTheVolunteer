import { useState, useEffect } from 'react';
import { getCasesList } from '../api/case';
import { getMatchingVolunteersForCase } from '../api/volunteer';
import { Case, getCaseLabel } from '../../types/case';
import { ClosestVolunteersResponse } from '../../types/volunteer';
import { AvailabilitiesFilter, FilterMode, DAYS } from '../../types/availabilities';
import AvailabilitySearch from './AvailabilitySearch';

function CaseSearch() {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [loadingCases, setLoadingCases] = useState(true);
  const [loadingCaseData, setLoadingCaseData] = useState(false);
  const [closestVolunteers, setClosestVolunteers] = useState<ClosestVolunteersResponse>([]);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AvailabilitiesFilter[]>([]);
  const [filterMode, setFilterMode] = useState<FilterMode>('OR');

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

    getMatchingVolunteersForCase(selectedCaseId, filters, filterMode)
      .then((result) => {
        setLoadingCaseData(false);
        setClosestVolunteers(result);
      })
      .catch((err: Error) => {
        setLoadingCaseData(false);
        setError(err.message);
      });
  }, [selectedCaseId, filters, filterMode, cases]);

  const renderCaseResult = () => {
    if (error) {
      return (
        <div className="result error">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      );
    }

    if (!selectedCaseId) return null;

    return (
      <div className="result">
        {selectedCase && (
          <>
            <h3>Case Biodata</h3>
            <table style={{ marginBottom: '20px' }}>
              <tbody>
                <tr>
                  <td><strong>Gender:</strong></td>
                  <td>{selectedCase.gender || 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>Date of First Contact:</strong></td>
                  <td>{selectedCase.dateOfFirstContact || 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>Language 1:</strong></td>
                  <td>{selectedCase.language1 || 'N/A'}</td>
                </tr>
                <tr>
                  <td><strong>Patient Address:</strong></td>
                  <td>{selectedCase.patientAddress || 'N/A'}</td>
                </tr>
              </tbody>
            </table>
          </>
        )}
        <h3>
          Top 5 Closest Volunteers
          {filters.length > 0 && <span style={{ fontWeight: 'normal', fontSize: 13, marginLeft: 8, color: '#607d8b' }}>(filtered by availability)</span>}
        </h3>
        {!closestVolunteers.length ? (
          <p>No volunteers with valid locations found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Distance</th>
                <th>Address</th>
                <th>Availability</th>
              </tr>
            </thead>
            <tbody>
              {closestVolunteers.map(({ volunteer: vol, distanceKm }) => {
                const matchesFilter = (day: string, slot: string) =>
                  filters.some((f) => f.day === day && f.timeSlot === slot);
                const availDays = DAYS.filter((day) => vol.availabilities[day]?.length);
                return (
                  <tr key={vol.code}>
                    <td><strong>{vol.code}</strong></td>
                    <td>{distanceKm > 0 ? `${distanceKm.toFixed(2)} km` : 'N/A'}</td>
                    <td>{vol.location || 'N/A'}</td>
                    <td style={{ fontSize: 12 }}>
                      {availDays.length === 0 ? 'N/A' : availDays.map((day) => (
                        <div key={day}>
                          <span>{day.slice(0, 3)}:</span>{' '}
                          {vol.availabilities[day].map((slot, i) => (
                            <span key={slot}>
                              {i > 0 && ', '}
                              {matchesFilter(day, slot)
                                ? <strong>{slot}</strong>
                                : slot}
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

  return (
    <>
      <h3>Search by Case & Volunteer</h3>
      <div className="form-group">
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
          {cases.map((c) => (
            <option key={c.id} value={c.id}>
              {getCaseLabel(c)}
            </option>
          ))}
        </select>
      </div>
      <AvailabilitySearch onSave={(f, m) => { setFilters(f); setFilterMode(m); }} />
      {loadingCaseData && <div className="loading">Loading...</div>}
      {renderCaseResult()}
    </>
  );
}

export default CaseSearch;
