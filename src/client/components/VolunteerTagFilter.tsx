import { useEffect, useMemo, useState } from 'react';
import { getVolunteersList } from '../api/volunteer';
import { Volunteer } from '../../types/volunteer';

function parseTags(raw: string): string[] {
  return raw
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function VolunteerTagFilter() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    getVolunteersList()
      .then((list) => {
        setVolunteers(list || []);
        setLoading(false);
      })
      .catch((err: Error) => {
        setVolunteers([]);
        setLoading(false);
        setError(err.message || 'Failed to load volunteers');
      });
  }, []);

  const allTags = useMemo(() => {
    const uniqueTags = new Map<string, string>();

    volunteers.forEach((volunteer) => {
      const tags = parseTags(volunteer.interestsHobbiesTalents || '');
      tags.forEach((tag) => {
        const normalized = tag.toLowerCase();
        if (!uniqueTags.has(normalized)) {
          uniqueTags.set(normalized, tag);
        }
      });
    });

    return Array.from(uniqueTags.entries())
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([value, label]) => ({ value, label }));
  }, [volunteers]);

  const filteredVolunteers = useMemo(() => {
    if (!selectedTag) return [];

    return volunteers.filter((volunteer) => {
      const tags = parseTags(volunteer.interestsHobbiesTalents || '').map((t) => t.toLowerCase());
      return tags.includes(selectedTag);
    });
  }, [selectedTag, volunteers]);

  return (
    <>
      <h3>Filter Volunteers by Tags</h3>
      <p style={{ marginTop: 0, color: '#666' }}>
        Tags are parsed from "Please share with your interests, hobbies, talents or professions..."
        using comma-separated values.
      </p>

      <div className="form-group">
        <label htmlFor="tagFilterDropdown">Select Tag:</label>
        <select
          id="tagFilterDropdown"
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          disabled={loading || !!error}
        >
          <option value="">
            {loading ? 'Loading tags...' : 'Select a tag...'}
          </option>
          {allTags.map((tag) => (
            <option key={tag.value} value={tag.value}>
              {tag.label}
            </option>
          ))}
        </select>
      </div>

      {loading && <div className="loading">Loading volunteers...</div>}

      {error && (
        <div className="result error">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && selectedTag && (
        <div className="result">
          <h3>Matching Volunteers ({filteredVolunteers.length})</h3>
          {!filteredVolunteers.length ? (
            <p>No volunteers found for this tag.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Name</th>
                  <th>Area</th>
                  <th>Tags</th>
                </tr>
              </thead>
              <tbody>
                {filteredVolunteers.map((volunteer) => (
                  <tr key={volunteer.code}>
                    <td><strong>{volunteer.code || 'N/A'}</strong></td>
                    <td>
                      {[volunteer.salutation, volunteer.givenName, volunteer.lastName]
                        .filter(Boolean)
                        .join(' ') || 'N/A'}
                    </td>
                    <td>{volunteer.area || volunteer.location || 'N/A'}</td>
                    <td>{volunteer.interestsHobbiesTalents || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </>
  );
}

export default VolunteerTagFilter;
