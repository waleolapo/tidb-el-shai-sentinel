import React, { useState, useEffect } from 'react';

// Define the structure of a recommendation object
interface Recommendation {
  id: number;
  message: string;
  priority: string;
  timestamp: string;
}

const priorityConfig: { [key: string]: { icon: string; color: string } } = {
  high: { icon: 'bi-exclamation-circle-fill', color: 'text-danger' },
  medium: { icon: 'bi-exclamation-triangle-fill', color: 'text-warning' },
  low: { icon: 'bi-info-circle-fill', color: 'text-info' },
};

function Recommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = () => {
        fetch('http://127.0.0.1:5001/api/recommendations')
        .then(response => {
          if (!response.ok) throw new Error('Network response was not ok');
          return response.json();
        })
        .then(data => {
          setRecommendations(data);
          setLoading(false);
        })
        .catch(error => {
          setError(error.message);
          setLoading(false);
        });
    };

    fetchRecommendations();
    const interval = setInterval(fetchRecommendations, 15000); // Refresh every 15 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  if (loading) return <p>Loading recommendations...</p>;
  if (error) return <p className="text-danger">Error: {error}</p>;

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="card-title"><i className="bi bi-bell-fill me-2"></i>Active Alerts & Recommendations</h5>
        {recommendations.length === 0 ? (
          <p className="text-muted">No active alerts. Your farm is looking good!</p>
        ) : (
          <ul className="list-group list-group-flush">
            {recommendations.map(rec => (
              <li key={rec.id} className="list-group-item d-flex align-items-center">
                <i className={`bi ${priorityConfig[rec.priority]?.icon || 'bi-info-circle-fill'} ${priorityConfig[rec.priority]?.color || 'text-secondary'} fs-4 me-3`}></i>
                <div>
                  {rec.message}
                  <small className="d-block text-muted mt-1">
                    {new Date(rec.timestamp).toLocaleString()}
                  </small>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Recommendations;
