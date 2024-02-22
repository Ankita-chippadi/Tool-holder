import React, { useState, useRef, useEffect } from 'react';

const ViewBoundsToggle = ({ chartRef, leftLinePosition, setLeftLinePosition, rightLinePosition, setRightLinePosition, chartData }) => {
  const [showViewBounds, setShowViewBounds] = useState(false);
  const [draggingLeft, setDraggingLeft] = useState(false);
  const [draggingRight, setDraggingRight] = useState(false);
  const [startPosition, setStartPosition] = useState(leftLinePosition);
  const [endPosition, setEndPosition] = useState(rightLinePosition);
  const [calculatedValues, setCalculatedValues] = useState(null);
  const dragRef = useRef(null);
  const [initialValues, setInitialValues] = useState({
    tension: { max: 0, min: 0, mean: 0 },
    torsion: { max: 0, min: 0, mean: 0 },
    bendingMomentY: { max: 0, min: 0, mean: 0 },
    temperature: { max: 0, min: 0, mean: 0 }
  });

 

  console.log("Chart data:", chartData); 

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
    console.log("Start position changed:", startPosition);
    console.log("End position changed:", endPosition);
    console.log("Data within start range:", filterDataInRange(startPosition * 100, endPosition * 50));
  }, [startPosition, endPosition]);

  const toggleViewBounds = () => {
    setShowViewBounds(!showViewBounds);
  };

  const formatTime = (seconds) => {
    const date = new Date(null);
    date.setSeconds(seconds);
    return date.toISOString().substr(11, 12);
  };

  const calculateYAxisValues = (x) => {
    // Find the closest point in chartData to the given x
    const closestPoint = chartData.reduce((prev, curr) => Math.abs(curr.x - x) < Math.abs(prev.x - x) ? curr : prev);

    // Return the y-axis values of the closest point
    return {
      x: formatTime(closestPoint.x),
      tension: closestPoint.tension,
      torsion: closestPoint.torsion,
      bendingMomentY: closestPoint.bendingMomentY,
      temperature: closestPoint.temperature,
    };
  };

  const filterDataInRange = (startX, endX) => {
    // Filter the data within the specified x-axis range
    return chartData.filter(item => item.x >= startX && item.x <= endX);
  };

const handleLeftLineDrag = (event) => {
  const chartBounds = chartRef.current.getBoundingClientRect();
  const chartWidth = chartBounds.width;
  const mouseX = event.clientX - chartBounds.left;
  const newPosition = mouseX / chartWidth; // Position relative to chart width

  // Ensure the new position is within bounds
  const newLeftPosition = Math.max(0, Math.min(newPosition, endPosition - 0.05)); // Adjust as needed
  setLeftLinePosition(newLeftPosition); // Update left line position
  setStartPosition(newLeftPosition);
  console.log("X-value while dragging left:", calculateYAxisValues(newLeftPosition * 100).x);
};

const handleRightLineDrag = (event) => {
  const chartBounds = chartRef.current.getBoundingClientRect();
  const chartWidth = chartBounds.width;
  const mouseX = event.clientX - chartBounds.left;
  let newPosition = mouseX / chartWidth; // Position relative to chart width

  // Ensure the new position is within bounds
  if (newPosition === 1) {
    newPosition = 0.99; // Adjust slightly less than 1 to prevent reaching the exact end point
  }
  
  const newRightPosition = Math.min(1, Math.max(newPosition, startPosition + 0.05)); // Adjust as needed
  setRightLinePosition(newRightPosition); // Update right line position
  setEndPosition(newRightPosition);
  console.log("X-value while dragging right:", calculateYAxisValues(newRightPosition * 100).x);
};

  const calculateValues = () => {
    const dataInRange = filterDataInRange(startPosition * 100, endPosition * 50);
    const properties = ['tension', 'torsion', 'bendingMomentY', 'temperature'];
    const calculatedValues = {};
  
    properties.forEach(property => {
      const values = dataInRange.map(item => item[property]);
      calculatedValues[property] = {
        max: Math.max(...values).toFixed(6),
        min: Math.min(...values).toFixed(6),
        mean: (values.reduce((acc, curr) => acc + curr, 0) / values.length).toFixed(9),
      };
    });
    console.log("Formatted X values:", dataInRange.map(item => formatTime(item.x)));
    setCalculatedValues(calculatedValues);
  };
  
  useEffect(() => {
    console.log("Start position changed:", startPosition);
    console.log("End position changed:", endPosition);
    console.log("Data within start range:", filterDataInRange(startPosition * 100, endPosition * 50));
  
    // Recalculate values when start or end positions change
    calculateValues();
  }, [startPosition, endPosition]);

  useEffect(() => {
    setCalculatedValues(initialValues);
  }, []);

  return (
    <>
      <button onClick={toggleViewBounds} className="border border-black text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-black" style={{position:'relative', width:'150px',height:'40px',left:'30%',bottom:'190px'}}>
        {showViewBounds ? 'Hide View Bounds' : 'Show View Bounds'}
      </button>
      <button onClick={calculateValues} className="border border-black text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-black" style={{ position: 'relative', bottom: '100px',height:'40px',width:'150px',left:'24%' }}>

        Calculate Values
      </button>
      {showViewBounds && (
        <>
          <div
            ref={dragRef}
            style={{ position: 'absolute', left: `${startPosition * 100}%`, top: '0%', borderLeft: '2px solid lightgreen', height: '62%', cursor: 'col-resize' }}
            onMouseDown={() => setDraggingLeft(true)}
          >
            <span>Start Range: X - {calculateYAxisValues(startPosition * 100).x}</span>
          </div>
          <div
            ref={dragRef}
            style={{ position: 'absolute', left: `${endPosition * 50}%`, top: '0%', borderLeft: '2px solid red', height: '62%', cursor: 'col-resize' }}
            onMouseDown={() => setDraggingRight(true)}
          >
             <span>End Range: X - {calculateYAxisValues(endPosition * 50).x}</span>
          </div>
        </>
      )}
    {calculatedValues && (
  <div className="mt-4 overflow-x-auto" style={{position:'relative',width:'600px',bottom:'300px'}} >
    <table className="min-w-full divide-y divide-gray-200" >
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mean</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {Object.keys(calculatedValues).map(property => (
          <tr key={property}>
            <td className="px-6 py-4 whitespace-nowrap">{property}</td>
            <td className="px-6 py-4 whitespace-nowrap">{calculatedValues[property].max}</td>
            <td className="px-6 py-4 whitespace-nowrap">{calculatedValues[property].min}</td>
            <td className="px-6 py-4 whitespace-nowrap">{calculatedValues[property].mean}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}

    </>
  );
};

export default ViewBoundsToggle;
