import React from 'react';
import { X, Minimize, Maximize, Move, RefreshCw, Download, FileSpreadsheet, PieChart, BarChart2, Filter } from 'lucide-react';
import './DelayWidget.css';

// Hard-coded data for different time periods
const delayData = {
  '24h': [
    { department: 'Baggage', percentage: 25, change: 5 },
    { department: 'Security', percentage: 20, change: -3 },
    { department: 'Gate Operations', percentage: 18, change: 2 },
    { department: 'Catering', percentage: 15, change: -1 },
    { department: 'Fuel Services', percentage: 12, change: 4 },
    { department: 'Ground Handling', percentage: 10, change: -2 }
  ],
  '7d': [
    { department: 'Baggage', percentage: 22, change: -3 },
    { department: 'Security', percentage: 24, change: 4 },
    { department: 'Gate Operations', percentage: 16, change: -2 },
    { department: 'Catering', percentage: 14, change: -1 },
    { department: 'Fuel Services', percentage: 13, change: 1 },
    { department: 'Ground Handling', percentage: 11, change: 1 }
  ],
  '30d': [
    { department: 'Security', percentage: 26, change: 2 },
    { department: 'Baggage', percentage: 21, change: -1 },
    { department: 'Gate Operations', percentage: 17, change: 1 },
    { department: 'Catering', percentage: 15, change: 1 },
    { department: 'Fuel Services', percentage: 12, change: -1 },
    { department: 'Ground Handling', percentage: 9, change: -2 }
  ]
};

const departmentColors = [
  '#2563eb', '#22c55e', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'
];

const DelayWidget = ({ widget, onRemove, onMove, onMouseDown, isDragging }) => {
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [chartType, setChartType] = React.useState('pie');
  const [showSettings, setShowSettings] = React.useState(false);
  const [settings, setSettings] = React.useState(() => {
    // Load settings from localStorage or use defaults
    const saved = localStorage.getItem('delayWidgetSettings');
    return saved ? JSON.parse(saved) : {
      timeInterval: '24h',
      topDepartments: 10,
      reportType: 'Network',
      autoRefresh: 'Off'
    };
  });
  const [tooltip, setTooltip] = React.useState(null);
  const canvasRef = React.useRef(null);

  // Save settings to localStorage
  React.useEffect(() => {
    localStorage.setItem('delayWidgetSettings', JSON.stringify(settings));
  }, [settings]);

  // Memoized data to optimize rendering
  const currentData = React.useMemo(() => {
    const data = delayData[settings.timeInterval] || delayData['24h'];
    return data.slice(0, settings.topDepartments);
  }, [settings.timeInterval, settings.topDepartments]);

  // Draw pie chart
  const drawPieChart = React.useCallback((ctx, data) => {
    const centerX = 180;
    const centerY = 90;
    const radius = 70;
    ctx.clearRect(0, 0, 360, 180);
    let currentAngle = -Math.PI / 2;
    const total = data.reduce((sum, item) => sum + item.percentage, 0);
    data.forEach((item, index) => {
      const sliceAngle = (item.percentage / total) * 2 * Math.PI;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = departmentColors[index % departmentColors.length];
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      currentAngle += sliceAngle;
    });
  }, []);

  // Draw enhanced bar chart
  const drawBarChart = React.useCallback((ctx, data) => {
  ctx.clearRect(0, 0, 360, 180);
  const barWidth = 320 / data.length;
  const maxPercentage = Math.max(...data.map(d => d.percentage));
  const barHeight = 120;

  data.forEach((item, index) => {
    const x = 20 + index * barWidth;
    const height = (item.percentage / maxPercentage) * barHeight;
    const y = 160 - height;

    // Bar fill with gradient
    const gradient = ctx.createLinearGradient(x, y, x, 160);
    const color = departmentColors[index % departmentColors.length];
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, `${color}80`);
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, barWidth - 12, height);

    // Change arrow and value
    ctx.fillStyle = item.change >= 0 ? '#22c55e' : '#ef4444';
    ctx.font = '12px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `${item.change >= 0 ? '↑' : '↓'}${Math.abs(item.change)}%`,
      x + (barWidth - 12) / 2,
      y - 20
    );

    // Percentage value
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 12px Inter, Arial, sans-serif';
    ctx.fillText(`${item.percentage}%`, x + (barWidth - 12) / 2, y - 5);

    // X-axis label (department name)
    ctx.fillStyle = '#1e293b';
    ctx.font = '11px Inter, Arial, sans-serif';
    ctx.fillText(item.department, x + (barWidth - 12) / 2, 175);
  });
}, []);


  // const drawBarChart = React.useCallback((ctx, data) => {
  //   ctx.clearRect(0, 0, 360, 180);
  //   const barWidth = 320 / data.length;
  //   const maxPercentage = Math.max(...data.map(d => d.percentage));
  //   const barHeight = 140;
  //   data.forEach((item, index) => {
  //     const x = 20 + index * barWidth;
  //     const height = (item.percentage / maxPercentage) * barHeight;
  //     const y = 160 - height;
  //     // Gradient fill for bar
  //     const gradient = ctx.createLinearGradient(x, y, x, 160);
  //     gradient.addColorStop(0, departmentColors[index % departmentColors.length]);
  //     gradient.addColorStop(1, `${departmentColors[index % departmentColors.length]}80`);
  //     ctx.fillStyle = gradient;
  //     ctx.fillRect(x, y, barWidth - 12, height);
  //     // Change indicator with arrow
  //     ctx.fillStyle = item.change >= 0 ? '#22c55e' : '#ef4444';
  //     ctx.font = '12px Inter, Arial, sans-serif';
  //     ctx.textAlign = 'center';
  //     ctx.fillText(
  //       `${item.change >= 0 ? '↑' : '↓'}${Math.abs(item.change)}%`,
  //       x + (barWidth - 12) / 2,
  //       y - 20
  //     );
  //     // Percentage text
  //     ctx.fillStyle = '#1e293b';
  //     ctx.font = 'bold 12px Inter, Arial, sans-serif';
  //     ctx.fillText(`${item.percentage}%`, x + (barWidth - 12) / 2, y - 5);
  //   });
  // }, []);

  // Handle canvas drawing
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (chartType === 'pie') {
      drawPieChart(ctx, currentData);
    } else {
      drawBarChart(ctx, currentData);
    }
  }, [chartType, currentData, drawPieChart, drawBarChart]);

  // Auto-refresh effect
  React.useEffect(() => {
    if (settings.autoRefresh === 'Off') return;
    const interval = setInterval(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (chartType === 'pie') {
          drawPieChart(ctx, currentData);
        } else {
          drawBarChart(ctx, currentData);
        }
      }
    }, parseInt(settings.autoRefresh) * 1000);
    return () => clearInterval(interval);
  }, [settings.autoRefresh, chartType, currentData, drawPieChart, drawBarChart]);

  // Handle canvas mouse events for tooltips
  const handleCanvasMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (chartType === 'pie') {
      const centerX = 180;
      const centerY = 90;
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
      if (distance <= 70) {
        const angle = Math.atan2(y - centerY, x - centerX) + Math.PI / 2;
        const normalizedAngle = angle < 0 ? angle + 2 * Math.PI : angle;
        let currentAngle = 0;
        const total = currentData.reduce((sum, item) => sum + item.percentage, 0);
        for (let i = 0; i < currentData.length; i++) {
          const sliceAngle = (currentData[i].percentage / total) * 2 * Math.PI;
          if (normalizedAngle >= currentAngle && normalizedAngle <= currentAngle + sliceAngle) {
            setTooltip({
              x: e.clientX,
              y: e.clientY,
              content: `${currentData[i].department}: ${currentData[i].percentage}%, Change: ${currentData[i].change >= 0 ? '+' : ''}${currentData[i].change}%`
            });
            return;
          }
          currentAngle += sliceAngle;
        }
      }
    } else {
      const barWidth = 320 / currentData.length;
      const barIndex = Math.floor((x - 20) / barWidth);
      if (barIndex >= 0 && barIndex < currentData.length) {
        const item = currentData[barIndex];
        setTooltip({
          x: e.clientX,
          y: e.clientY,
          content: `${item.department}: ${item.percentage}%, Change: ${item.change >= 0 ? '+' : ''}${item.change}%`
        });
        return;
      }
    }
    setTooltip(null);
  };

  const handleCanvasMouseLeave = () => {
    setTooltip(null);
  };

  // Download functions
  const downloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `delay-departments-${settings.timeInterval}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const downloadCSV = () => {
    const csvContent = [
      ['Department', 'Percentage', 'Change'],
      ...currentData.map(item => [item.department, item.percentage, item.change])
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `delay-departments-${settings.timeInterval}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleChartType = () => {
    setChartType(chartType === 'pie' ? 'bar' : 'pie');
  };

  const handleRefresh = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (chartType === 'pie') {
        drawPieChart(ctx, currentData);
      } else {
        drawBarChart(ctx, currentData);
      }
    }
  };

  // Prevent drag on interactive elements
  const handleMouseDown = (e) => {
    if (
      e.target.closest('.widget-footer') ||
      e.target.closest('.widget-settings') ||
      e.target.closest('button') ||
      e.target.tagName === 'CANVAS' ||
      e.target.tagName === 'SELECT'
    ) return;
    onMouseDown(e);
  };

  // Keyboard navigation for accessibility
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setShowSettings(!showSettings);
    }
  };

  const widgetStyle = {
    gridRow: widget.gridRow,
    gridColumn: widget.gridCol,
    cursor: isDragging ? 'grabbing' : 'grab',
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 1
  };

  return (
    <>
      <div 
        className={`delay-widget ${isMinimized ? 'minimized' : ''}`}
        style={widgetStyle}
        onMouseDown={handleMouseDown}
        role="region"
        aria-label="Delay by Department Widget"
        tabIndex={0}
      >
        <div className="widget-header">
          <h3 className="widget-title" title={`${settings.reportType} - Delay by Department (${settings.timeInterval})`}>
            Delay by Department
          </h3>
          <div className="widget-controls">
            <button 
              className="btn-icon"
              onClick={() => setShowSettings(!showSettings)}
              onKeyDown={handleKeyDown}
              aria-label="Toggle filter settings"
              title="Filter Settings"
            >
              <Filter size={16} />
            </button>
            <button 
              className="btn-icon"
              onClick={() => setIsMinimized(!isMinimized)}
              aria-label={isMinimized ? "Maximize widget" : "Minimize widget"}
              title={isMinimized ? "Maximize" : "Minimize"}
            >
              {isMinimized ? <Maximize size={16} /> : <Minimize size={16} />}
            </button>
            <button 
              className="btn-icon"
              onClick={onMove}
              aria-label="Move widget"
              title="Move"
            >
              <Move size={16} />
            </button>
            <button 
              className="btn-icon"
              onClick={onRemove}
              aria-label="Remove widget"
              title="Remove"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {showSettings && (
              <div className="widget-settings" role="dialog" aria-label="Filter settings">
                <div className="settings-row">
                  <label htmlFor="time-interval">Time Interval:</label>
                  <select 
                    id="time-interval"
                    className="select"
                    value={settings.timeInterval}
                    onChange={(e) => setSettings(prev => ({...prev, timeInterval: e.target.value}))}
                    aria-describedby="time-interval-desc"
                  >
                    <option value="24h">24 Hours</option>
                    <option value="7d">7 Days</option>
                    <option value="30d">30 Days</option>
                  </select>
                  <span id="time-interval-desc" className="sr-only">Select time interval for data display</span>
                </div>
                <div className="settings-row">
                  <label htmlFor="top-departments">Top Departments:</label>
                  <select 
                    id="top-departments"
                    className="select"
                    value={settings.topDepartments}
                    onChange={(e) => setSettings(prev => ({...prev, topDepartments: parseInt(e.target.value)}))}
                    aria-describedby="top-departments-desc"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                  </select>
                  <span id="top-departments-desc" className="sr-only">Select number of top departments to display</span>
                </div>
                <div className="settings-row">
                  <label htmlFor="report-type">Report Type:</label>
                  <select 
                    id="report-type"
                    className="select"
                    value={settings.reportType}
                    onChange={(e) => setSettings(prev => ({...prev, reportType: e.target.value}))}
                    aria-describedby="report-type-desc"
                  >
                    <option value="Network">Network</option>
                    <option value="Airport">Airport</option>
                  </select>
                  <span id="report-type-desc" className="sr-only">Select report type</span>
                </div>
                <div className="settings-row">
                  <label htmlFor="auto-refresh">Auto Refresh:</label>
                  <select 
                    id="auto-refresh"
                    className="select"
                    value={settings.autoRefresh}
                    onChange={(e) => setSettings(prev => ({...prev, autoRefresh: e.target.value}))}
                    aria-describedby="auto-refresh-desc"
                  >
                    <option value="Off">Off</option>
                    <option value="30s">30 seconds</option>
                    <option value="60s">60 seconds</option>
                  </select>
                  <span id="auto-refresh-desc" className="sr-only">Select auto-refresh interval</span>
                </div>
              </div>
            )}

            <div className="widget-content">
              <canvas
                ref={canvasRef}
                width={360}
                height={180}
                className="chart-canvas"
                onMouseMove={handleCanvasMouseMove}
                onMouseLeave={handleCanvasMouseLeave}
                aria-label={`${chartType} chart showing delay percentages by department`}
              />
            </div>

            <div className="widget-footer">
              <div className="footer-controls">
                <button 
                  className="btn-icon"
                  onClick={handleRefresh}
                  aria-label="Refresh data"
                  title="Refresh"
                >
                  <RefreshCw size={16} />
                </button>
                <button 
                  className="btn-icon"
                  onClick={downloadPNG}
                  aria-label="Download as PNG"
                  title="Download PNG"
                >
                  <Download size={16} />
                </button>
                <button 
                  className="btn-icon"
                  onClick={downloadCSV}
                  aria-label="Download as CSV"
                  title="Download CSV"
                >
                  <FileSpreadsheet size={16} />
                </button>
                <button 
                  className="btn-icon"
                  onClick={toggleChartType}
                  aria-label={`Switch to ${chartType === 'pie' ? 'bar' : 'pie'} chart`}
                  title={`Switch to ${chartType === 'pie' ? 'Bar' : 'Pie'} Chart`}
                >
                  {chartType === 'pie' ? <BarChart2 size={16} /> : <PieChart size={16} />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {tooltip && (
        <div 
          className="tooltip"
          style={{
            left: tooltip.x + 10,
            top: tooltip.y - 10
          }}
        >
          {tooltip.content}
        </div>
      )}
    </>
  );
};

export default DelayWidget;