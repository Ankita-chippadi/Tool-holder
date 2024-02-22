import React, { useState, useRef, useEffect } from 'react';

const ViewBoundsToggle = ({ chartRef, leftLinePosition, setLeftLinePosition, rightLinePosition, setRightLinePosition, chartData }) => {
  const [showViewBounds, setShowViewBounds] = useState(false);
  const [draggingLeft, setDraggingLeft] = useState(false);
  const [draggingRight, setDraggingRight] = useState(false);
  const [startPosition, setStartPosition] = useState(leftLinePosition);
  const [endPosition, setEndPosition] = useState(rightLinePosition);
  const dragRef = useRef(null);

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
    console.log("Data within start range:", filterDataInRange(startPosition * 100, endPosition * 100));
  }, [startPosition, endPosition]);

  const toggleViewBounds = () => {
    setShowViewBounds(!showViewBounds);
  };

  const calculateYAxisValues = (x) => {
    // Find the closest point in chartData to the given x
    const closestPoint = chartData.reduce((prev, curr) => Math.abs(curr.x - x) < Math.abs(prev.x - x) ? curr : prev);

    // Return the y-axis values of the closest point
    return {
      x: closestPoint.x,
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
    setStartPosition(newLeftPosition);
  };

  const handleRightLineDrag = (event) => {
    const chartBounds = chartRef.current.getBoundingClientRect();
    const chartWidth = chartBounds.width;
    const mouseX = event.clientX - chartBounds.left;
    const newPosition = mouseX / chartWidth; // Position relative to chart width

    // Ensure the new position is within bounds
    const newRightPosition = Math.min(1, Math.max(newPosition, startPosition + 0.05)); // Adjust as needed
    setEndPosition(newRightPosition);
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
            <span>Start Range: X - {calculateYAxisValues(startPosition * 100).x}</span>
          </div>
          <div
            ref={dragRef}
            style={{ position: 'absolute', left: `${endPosition * 80}%`, top: '0%', borderLeft: '2px solid red', height: '62%', cursor: 'col-resize' }}
            onMouseDown={() => setDraggingRight(true)}
          >
             <span>End Range: X - {calculateYAxisValues(endPosition * 100).x}</span>
          </div>
        </>
      )}
    </>
  );
};

export default ViewBoundsToggle;
