import React, { useState } from "react";
import flights from "./data/Flights";
import "./Flightdb.css";

function FlightWidget() {
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  const toggleExport = () => {
    setShowExportDropdown(!showExportDropdown);
  };
  const [activeTab, setActiveTab] = useState("Departures");

  const handleToggle = (type) => setActiveTab(type);

  const filteredFlights = flights; // no filtering based on status

  const [infoText, setInfoText] = useState("Dep/Arr in next 6 hours");
  const [editingInfo, setEditingInfo] = useState(false);

  const handleInfoClick = () => setEditingInfo(true);
  const handleInfoChange = (e) => setInfoText(e.target.value);
  const handleInfoBlur = () => setEditingInfo(false);
  const handleInfoKey = (e) => {
    if (e.key === "Enter") setEditingInfo(false);
  };
  return (
    <div className="widget-container">
      {/* Top line */}
      <div className="top-bar">
      <div className="info-text">
          {editingInfo ? (
            <input
              type="text"
              value={infoText}
              onChange={handleInfoChange}
              onBlur={handleInfoBlur}
              onKeyDown={handleInfoKey}
              autoFocus
              className="info-input"
            />
          ) : (
            <span onClick={handleInfoClick}>{infoText}</span>
          )}
        </div>  <div className="controls">
  <span style={{ marginLeft: "6px" }}>▼</span>

  <button className="filter-btn">

  <span role="img" aria-label="filter" style={{ marginRight: "8px" }}>🔍</span>
  Filters 
</button>
<div className="export-dropdown">
          <span
            role="img"
            aria-label="export"
            className="export-icon"
            onClick={toggleExport}
          >
            📤
          </span>

          {showExportDropdown && (
            <div className="dropdown-menu">
              <div>Export as PDF</div>
              <div>Export as Excel</div>
            </div>
          )}
        </div>
    <button className="icon-btn">−</button>
    <button className="icon-btn">×</button>
  </div>
</div>


      {/* Toggle line */}
      <div class="toggle-bar">
  <button class="toggle-btn active airport">Airport</button>
  <button class="toggle-btn aircraft">Aircraft Subtype</button>

  
</div>



      {/* Flight list */}
      <div className="widget-table">
  <div className="widget-row header">
    <div>Flight</div>
    <div>Aircraft Reg</div>
    <div>Time</div>
    <div>Crew</div>
  </div>

  <div className="flight-scroll-container">
  <div class="widget-table">
    {filteredFlights.map((item, idx) => (
      <div
        className={`widget-row ${
          item.status === "Takeoff" ? "takeoff" : "landing"
        }`}
        key={idx}
      >
        <div>
          <a href={`/flights/${item.flight}`} className="flight-link">
            {item.flight}
          </a>
        </div>
        <div>{item.gate}</div>
        <div>{item.date}</div>
        <div className="status">{item.crew}</div>
      </div>
    ))}
    </div>
  </div>
</div>

    </div>
  );
}

export default FlightWidget;
