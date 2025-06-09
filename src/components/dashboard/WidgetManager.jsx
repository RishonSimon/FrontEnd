import React from 'react';
import { Plus, X } from 'lucide-react';
import DelayWidget from './DelayWidget';
import './WidgetManager.css';
import FlightWidget from './Flightdb';
// Widget manager for adding, removing, and dragging widgets
const WidgetManager = ({ widgets, setWidgets }) => {
  const [draggedWidget, setDraggedWidget] = React.useState(null);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
  const [showWidgetMenu, setShowWidgetMenu] = React.useState(false);

  const widgetTypes = [
    { id: 'delay-departments', name: 'Delay by Department', description: 'Shows delay percentages by department' },
    { id: 'flight-status', name: 'Flight Status', description: 'Real-time flight status overview' },
    { id: 'gate-utilization', name: 'Gate Utilization', description: 'Airport gate usage statistics' },
    { id: 'passenger-flow', name: 'Passenger Flow', description: 'Terminal passenger movement data' },
    {id:'Dep-Arr',name:'Departure Arrival',description:'Shows the dep and arrival status of flights'}
  ];

  // Add new widget with automatic grid placement
  const addWidget = (widgetType) => {
    const newWidget = {
      id: Date.now(),
      type: widgetType,
      gridRow: 1,
      gridCol: 1
    };
    const occupiedPositions = widgets.map(w => `${w.gridRow}-${w.gridCol}`);
    let row = 1, col = 1;
    while (occupiedPositions.includes(`${row}-${col}`)) {
      col++;
      if (col > 4) {
        col = 1;
        row++;
      }
    }
    newWidget.gridRow = row;
    newWidget.gridCol = col;
    setWidgets([...widgets, newWidget]);
    setShowWidgetMenu(false);
  };

  // Remove widget by ID
  const removeWidget = (id) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  // Move widget to next available grid slot
  const moveWidget = (id) => {
    const widget = widgets.find(w => w.id === id);
    if (!widget) return;
    const occupiedPositions = widgets
      .filter(w => w.id !== id)
      .map(w => `${w.gridRow}-${w.gridCol}`);
    let newRow = widget.gridRow;
    let newCol = widget.gridCol + 1;
    if (newCol > 4) {
      newCol = 1;
      newRow++;
    }
    while (occupiedPositions.includes(`${newRow}-${newCol}`)) {
      newCol++;
      if (newCol > 4) {
        col = 1;
        newRow++;
      }
    }
    setWidgets(widgets.map(w => 
      w.id === id ? { ...w, gridRow: newRow, gridCol: newCol } : w
    ));
  };

  // Handle drag start
  const handleMouseDown = (e, widget) => {
    if (e.target.closest('.widget-header button')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setDraggedWidget(widget);
    e.preventDefault();
  };

  // Handle drag movement
  const handleMouseMove = React.useCallback((e) => {
    if (!draggedWidget) return;
    const container = document.querySelector('.widget-grid');
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const x = e.clientX - containerRect.left - dragOffset.x;
    const y = e.clientY - containerRect.top - dragOffset.y;
    const colWidth = containerRect.width / 4;
    const rowHeight = 320;
    const newCol = Math.max(1, Math.min(4, Math.floor(x / colWidth) + 1));
    const newRow = Math.max(1, Math.floor(y / rowHeight) + 1);
    const occupiedPositions = widgets
      .filter(w => w.id !== draggedWidget.id)
      .map(w => `${w.gridRow}-${w.gridCol}`);
    if (!occupiedPositions.includes(`${newRow}-${newCol}`)) {
      setWidgets(widgets.map(w => 
        w.id === draggedWidget.id 
          ? { ...w, gridRow: newRow, gridCol: newCol }
          : w
      ));
    }
  }, [draggedWidget, dragOffset, widgets, setWidgets]);

  // Handle drag end
  const handleMouseUp = React.useCallback(() => {
    setDraggedWidget(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  // Add/remove drag event listeners
  React.useEffect(() => {
    if (draggedWidget) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedWidget, handleMouseMove, handleMouseUp]);

  // Render widget based on type
  const renderWidget = (widget) => {
    switch (widget.type) {
      case 'delay-departments':
        return (
          <DelayWidget
            key={widget.id}
            widget={widget}
            onRemove={() => removeWidget(widget.id)}
            onMove={() => moveWidget(widget.id)}
            onMouseDown={(e) => handleMouseDown(e, widget)}
            isDragging={draggedWidget?.id === widget.id}
          />
        );
        case 'Dep-Arr':return (
          <FlightWidget
            key={widget.id}
            widget={widget}
            onRemove={() => removeWidget(widget.id)}
            onMove={() => moveWidget(widget.id)}
            onMouseDown={(e) => handleMouseDown(e, widget)}
            isDragging={draggedWidget?.id === widget.id}
          />
        );

      default:
        return (
          <div 
            key={widget.id}
            className="placeholder-widget"
            style={{
              gridRow: widget.gridRow,
              gridColumn: widget.gridCol,
              background: '#f8fafc',
              border: '2px dashed #d1d5db',
              borderRadius: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
              fontSize: '14px',
              fontWeight: 500,
              padding: '16px',
              textAlign: 'center'
            }}
            role="region"
            aria-label={`Placeholder for ${widget.type} widget`}
          >
            <span>{widget.type.replace('-', ' ').toUpperCase()}</span>
            <span style={{ fontSize: '12px', marginTop: '8px' }}>
              This widget is under development. Stay tuned!
            </span>
          </div>
        );
    }
  };

  return (
    <div className="widget-manager">
      <div className="widget-grid">
        {widgets.map(renderWidget)}
      </div>
      <div className="add-widget-container">
        <button 
          className="add-widget-btn btn btn-primary"
          onClick={() => setShowWidgetMenu(!showWidgetMenu)}
          aria-label="Add widget"
          title="Add Widget"
        >
          <Plus size={20} />
        </button>
        {showWidgetMenu && (
          <div className="widget-menu" role="menu" aria-label="Widget selection menu">
            <div className="widget-menu-header">
              <h3>Add Widget</h3>
              <button 
                className="btn-icon"
                onClick={() => setShowWidgetMenu(false)}
                aria-label="Close widget menu"
                title="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className="widget-menu-content">
              {widgetTypes.map(widgetType => (
                <button
                  key={widgetType.id}
                  className="widget-menu-item"
                  onClick={() => addWidget(widgetType.id)}
                  aria-label={`Add ${widgetType.name} widget`}
                  role="menuitem"
                >
                  <div className="widget-menu-item-title">{widgetType.name}</div>
                  <div className="widget-menu-item-description">{widgetType.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WidgetManager;