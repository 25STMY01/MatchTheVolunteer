import { useState, useEffect } from 'react';
import { getCasesList } from '../api/case';
import { getClosestVolunteersForCase } from '../api/volunteer';
import { Case, getCaseLabel } from '../../types/case';
import { ClosestVolunteersResponse } from '../../types/volunteer';


function CaseSearch() {
  const [cases, setCases] = useState<Case[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [loadingCases, setLoadingCases] = useState(true);
  const [loadingCaseData, setLoadingCaseData] = useState(false);
  const [closestVolunteers, setClosestVolunteers] = useState<ClosestVolunteersResponse>([]);
  const [error, setError] = useState<string | null>(null);
  
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

    getClosestVolunteersForCase(selectedCaseId)
      .then((result) => {
        setLoadingCaseData(false);
        setClosestVolunteers(result);
      })
      .catch((err: Error) => {
        setLoadingCaseData(false);
        setError(err.message);
      });
  }, [selectedCaseId, cases]);

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
        <h3>Top 5 Closest Volunteers</h3>
        {!closestVolunteers.length ? (
          <p>No volunteers with valid locations found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Distance (km)</th>
                <th>Address</th>
              </tr>
            </thead>
            <tbody>
              {closestVolunteers.map(({ volunteer: vol, distanceKm }) => (
                <tr key={vol.code}>
                  <td><strong>{vol.code}</strong></td>
                  <td>{distanceKm.toFixed(2)}</td>
                  <td>{vol.location || 'N/A'}</td>
                </tr>
              ))}
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
      {loadingCaseData && <div className="loading">Loading...</div>}
      {renderCaseResult()}
    </>
  );
}

export default CaseSearch;
