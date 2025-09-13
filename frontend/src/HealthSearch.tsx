import React, { useState } from 'react';
import knowledgeBase from './knowledge_base.json';

interface KnowledgeBaseEntry {
  id: number;
  condition_name: string;
  symptoms: string;
  cause: string;
  recommendation: string;
}

function HealthSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<KnowledgeBaseEntry[]>([]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchQuery = e.target.value;
    setQuery(searchQuery);

    if (searchQuery.length > 2) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      const filteredResults = knowledgeBase.filter(entry => 
        entry.condition_name.toLowerCase().includes(lowerCaseQuery) ||
        entry.symptoms.toLowerCase().includes(lowerCaseQuery) ||
        entry.cause.toLowerCase().includes(lowerCaseQuery)
      );
      setResults(filteredResults);
    } else {
      setResults([]);
    }
  };

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h5 className="card-title"><i className="bi bi-search me-2"></i>Plant Health Search</h5>
        <p className="card-text text-muted">Search for symptoms or conditions (e.g., "yellow leaves", "powdery mildew").</p>
        <input 
          type="text" 
          className="form-control form-control-lg" 
          placeholder="Search..." 
          value={query} 
          onChange={handleSearch} 
        />

        {results.length > 0 && (
          <div className="mt-4">
            <h6 className="text-muted">Search Results</h6>
            <div className="list-group">
              {results.map(entry => (
                <div key={entry.id} className="list-group-item list-group-item-action flex-column align-items-start">
                  <div className="d-flex w-100 justify-content-between">
                    <h5 className="mb-1">{entry.condition_name}</h5>
                  </div>
                  <p className="mb-1"><strong>Symptoms:</strong> {entry.symptoms}</p>
                  <p className="mb-1"><strong>Cause:</strong> {entry.cause}</p>
                  <p className="mb-1"><strong>Recommendation:</strong> <span className="text-success">{entry.recommendation}</span></p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HealthSearch;
