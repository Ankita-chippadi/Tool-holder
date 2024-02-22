import React, { useState, useRef, useEffect } from 'react';

const ViewBoundsToggle = ({ chartRef, leftLinePosition, setLeftLinePosition, rightLinePosition, setRightLinePosition, chartData }) => {
  const [showViewBounds, setShowViewBounds] = useState(false);
  const [draggingLeft, setDraggingLeft] = useState(false);
  const [draggingRight, setDraggingRight] = useState(false);
  const [startPosition, setStartPosition] = useState(leftLinePosition);
  const [endPosition, setEndPosition] = useState(rightLinePosition);
  const [digits, setDigits] = useState({ start: 0, end: 0 });
  const [stats, setStats] = useState({
    tension: { mean: 0, min: 0, max: 0, slope: 0 },
    torsion: { mean: 0, min: 0, max: 0, slope: 0 },
    bendingMomentY: { mean: 0, min: 0, max: 0, slope: 0 },
    temperature: { mean: 0, min: 0, max: 0, slope: 0 }
  });
  const dragRef = useRef(null);
  const [linesMoved, setLinesMoved] = useState(false);

  useEffect(() => {
    calculateStatistics(); // Initial calculation
  }, [chartData]);

  const calculateStatistics = () => {
    if (!chartData || !chartData.tension || !chartData.torsion || !chartData.bendingMomentY || !chartData.temperature) {
      return; // Ensure chartData is valid before proceeding
    }
  
    const calculateMean = (data) => {
      return data.length > 0 ? data.reduce((acc, curr) => acc + curr, 0) / data.length : 0;
    };
  
    const calculateSlope = (data) => {
      const n = data.length;
      if (n === 0) {
        return 0;
      }
      const sumXY = data.reduce((acc, curr, index) => acc + (index * curr), 0);
      const sumX = (n * (n - 1)) / 2;
      const sumY = data.reduce((acc, curr) => acc + curr, 0);
      const sumXSquared = (n * (n - 1) * (2 * n - 1)) / 6;
      return (n * sumXY - sumX * sumY) / (n * sumXSquared - sumX ** 2);
    };
  
    const calculateStatsForData = (data) => {
      const values = data.map(item => item.value);
      return {
        mean: calculateMean(values),
        min: values.length > 0 ? Math.min(...values) : 0,
        max: Math.max(...values),
        slope: calculateSlope(values)
      };
    };
  
    const statsData = {
      tension: calculateStatsForData(chartData.tension),
      torsion: calculateStatsForData(chartData.torsion),
      bendingMomentY: calculateStatsForData(chartData.bendingMomentY),
      temperature: calculateStatsForData(chartData.temperature)
    };
  
    setStats(statsData);
  };
  useEffect(() => {
    const handleMouseMove = (event) => {
      if (draggingLeft) {
        handleLeftLineDrag(event);
      } else if (draggingRight) {
        handleRightLineDrag(event);
      }
    };

    const handleMouseUp = () => {
      setDraggingLeft(false);
      setDraggingRight(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingLeft, draggingRight]);

  useEffect(() => {
    if (startPosition !== leftLinePosition || endPosition !== rightLinePosition) {
      setLeftLinePosition(startPosition);
      setRightLinePosition(endPosition);
      setLinesMoved(true); // Set the flag indicating that lines have been moved
    }
  }, [startPosition, endPosition]);

  const toggleViewBounds = () => {
    setShowViewBounds(!showViewBounds);
  };

  const handleDigitChange = (event, type) => {
    const value = parseFloat(event.target.value);
    setDigits(prevDigits => ({
      ...prevDigits,
      [type]: value
    }));
  };

  const handleCalculateClick = () => {
    calculateStatistics();
  };

  const handleLeftLineDrag = (event) => {
    const chartBounds = chartRef.current.getBoundingClientRect();
    const chartWidth = chartBounds.width;
    const mouseX = event.clientX - chartBounds.left;
    const newPosition = mouseX / chartWidth;
    const newLeftPosition = Math.max(0, Math.min(newPosition, endPosition - 0.05));
    setStartPosition(newLeftPosition);
    setLinesMoved(true); // Set the flag indicating lines have been moved
  };

  const handleRightLineDrag = (event) => {
    const chartBounds = chartRef.current.getBoundingClientRect();
    const chartWidth = chartBounds.width;
    const mouseX = event.clientX - chartBounds.left;
    const newPosition = mouseX / chartWidth;
    const newRightPosition = Math.min(1, Math.max(newPosition, startPosition + 0.05));
    setEndPosition(newRightPosition);
    setLinesMoved(true); // Set the flag indicating lines have been moved
  };

  return (
    <>
      <button onClick={toggleViewBounds} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Toggle View Bounds
      </button>
      {showViewBounds && (
        <>
          <div
            ref={dragRef}
            style={{ position: 'absolute', left: `${startPosition * 100}%`, top: '0%', borderLeft: '2px solid lightgreen', height: '62%', cursor: 'col-resize' }}
            onMouseDown={() => setDraggingLeft(true)}
          >
            <span>Start Range: X - {startPosition}</span>
          </div>
          <div
            ref={dragRef}
            style={{ position: 'absolute', left: `${endPosition * 50}%`, top: '0%', borderLeft: '2px solid red', height: '62%', cursor: 'col-resize' }}
            onMouseDown={() => setDraggingRight(true)}
          >
            <span>End Range: X - {endPosition}</span>
          </div>
          {linesMoved && ( // Show the Calculate Values button only when lines are moved
            <div style={{ position: 'relative', width: '100px', left: '60%' }}>
              <button onClick={handleCalculateClick} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Calculate Values
              </button>
            </div>
          )}
          <div style={{ position: 'relative', width: '100px', left: '60%' }}>
            <table className="min-w-full border-collapse border border-gray-300" style={{ position: 'relative', right: '600px', bottom: '150px' }}>
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-4">Values</th>
                  <th className="py-2 px-4">Mean</th>
                  <th className="py-2 px-4">Min</th>
                  <th className="py-2 px-4">Max</th>
                  <th className="py-2 px-4">Slope</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-4">Tension</td>
                  <td className="py-2 px-4">{stats.tension.mean}</td>
                  <td className="py-2 px-4">{stats.tension.min}</td>
                  <td className="py-2 px-4">{stats.tension.max}</td>
                  <td className="py-2 px-4">{stats.tension.slope}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4">Torsion</td>
                  <td className="py-2 px-4">{stats.torsion.mean}</td>
                  <td className="py-2 px-4">{stats.torsion.min}</td>
                  <td className="py-2 px-4">{stats.torsion.max}</td>
                  <td className="py-2 px-4">{stats.torsion.slope}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4">Bending Moment Y</td>
                  <td className="py-2 px-4">{stats.bendingMomentY.mean}</td>
                  <td className="py-2 px-4">{stats.bendingMomentY.min}</td>
                  <td className="py-2 px-4">{stats.bendingMomentY.max}</td>
                  <td className="py-2 px-4">{stats.bendingMomentY.slope}</td>
                </tr>
                <tr>
                  <td className="py-2 px-4">Temperature</td>
                  <td className="py-2 px-4">{stats.temperature.mean}</td>
                  <td className="py-2 px-4">{stats.temperature.min}</td>
                  <td className="py-2 px-4">{stats.temperature.max}</td>
                  <td className="py-2 px-4">{stats.temperature.slope}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
};

export default ViewBoundsToggle;
