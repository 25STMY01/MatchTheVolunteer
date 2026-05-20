import { useState } from 'react';
import VolunteerSearch from '../components/VolunteerSearch';
import CaseSearch from '../components/CaseSearch';
import VolunteerTagFilter from '../components/VolunteerTagFilter';

type Tab = 'volunteer' | 'case' | 'tags';

function HomePage() {
  const [activeTab, setActiveTab] = useState<Tab>('volunteer');

  return (
    <div className="container">
      <h2>Volunteer & Case Lookup</h2>

      <div className="tabs">
        <button
          type="button"
          className={`tab-button ${activeTab === 'volunteer' ? 'active' : ''}`}
          onClick={() => setActiveTab('volunteer')}
        >
          Volunteer Search
        </button>
        <button
          type="button"
          className={`tab-button ${activeTab === 'case' ? 'active' : ''}`}
          onClick={() => setActiveTab('case')}
        >
          Case Search
        </button>
        <button
          type="button"
          className={`tab-button ${activeTab === 'tags' ? 'active' : ''}`}
          onClick={() => switchTab('tags')}
        >
          Volunteer Tag Filter
        </button>
      </div>

      <div id="volunteer" className={`tab-content ${activeTab === 'volunteer' ? 'active' : ''}`}>
        <VolunteerSearch />
      </div>

      <div id="case" className={`tab-content ${activeTab === 'case' ? 'active' : ''}`}>
        <CaseSearch />
      </div>

      <div id="tags" className={`tab-content ${activeTab === 'tags' ? 'active' : ''}`}>
        <VolunteerTagFilter />
      </div>
    </div>
  );
}

export default HomePage;
