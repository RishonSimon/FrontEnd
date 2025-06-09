import React from 'react';
import { RotateCcw } from 'lucide-react';
import WidgetManager from './WidgetManager';
import './Dashboard.css';

// Main dashboard component with reset functionality
const Dashboard = () => {
  const [widgets, setWidgets] = React.useState([]);

  // Reset dashboard layout by clearing widgets
  const handleResetLayout = () => {
    setWidgets([]);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1 className="dashboard-title">iFlight Operations Dashboard</h1>
        <button 
          className="btn btn-secondary"
          onClick={handleResetLayout}
          aria-label="Reset dashboard layout"
          title="Reset Layout"
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </header>
      <main className="dashboard-content">
        <WidgetManager widgets={widgets} setWidgets={setWidgets} />
      </main>
    </div>
  );
};

export default Dashboard;