import React from 'react';
import Dashboard from './Dashboard';

function App() {
  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            <i className="bi bi-tree me-2"></i>
            Micro-Farm AI Monitor
          </a>
        </div>
      </nav>
      <main>
        <Dashboard />
      </main>
    </div>
  );
}

export default App;