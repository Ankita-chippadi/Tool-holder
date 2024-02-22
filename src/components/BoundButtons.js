import React, { useState, useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist';

const LineGraphWithBounds = ({ chartData }) => {
  const chartRef = useRef(null);
  const [showViewBounds, setShowViewBounds] = useState(false);
  const [xBounds, setXBounds] = useState([null, null]);
  const [leftLinePosition, setLeftLinePosition] = useState(0.1);
  const [rightLinePosition, setRightLinePosition] = useState(0.9);
  const [yBounds, setYBounds] = useState([null, null]);
  const [originalChartData, setOriginalChartData] = useState(null);

  useEffect(() => {
    setOriginalChartData([...chartData]);
  }, [chartData]);

  useEffect(() => {
    const initPlot = () => {
      const trace = {
        x: chartData.map(data => data.x),
        y: chartData.map(data => data.y),
        type: 'scatter',
      };

      const layout = {
        width: 800,
        height: 600,
        shapes: [
          {
            type: 'line',
            xref: 'paper',
            x0: leftLinePosition,
            y0: yBounds[0],
            x1: leftLinePosition,
            y1: yBounds[1],
            line: { color: 'red', width: 2 },
            draggable: true,
            ondrag: handleLeftLineDrag,
          },
          {
            type: 'line',
            xref: 'paper',
            x0: rightLinePosition,
            y0: yBounds[0],
            x1: rightLinePosition,
            y1: yBounds[1],
            line: { color: 'blue', width: 2 },
            draggable: true,
            ondrag: handleRightLineDrag,
          },
        ],
      };

      Plotly.newPlot(chartRef.current, [trace], layout);
    };

    initPlot();
  }, [chartData, leftLinePosition, rightLinePosition, yBounds]);

  const toggleViewBounds = () => {
    setShowViewBounds(!showViewBounds);
  };

  const handleLeftLineDrag = (event) => {
    const rect = chartRef.current.getBoundingClientRect();
    const yPos = event.clientY - rect.top;
    const yValue = yPos / rect.height;

    setLeftLinePosition(yValue);
    setXBounds([leftLinePosition, xBounds[1]]);
    setYBounds([leftLinePosition, yBounds[1]]);
    updateDataWithinBounds();
  };

  const handleRightLineDrag = (event) => {
    const rect = chartRef.current.getBoundingClientRect();
    const yPos = event.clientY - rect.top;
    const yValue = yPos / rect.height;

    setRightLinePosition(yValue);
    setXBounds([xBounds[0], rightLinePosition]);
    setYBounds([yBounds[0], rightLinePosition]);
    updateDataWithinBounds();
  };

  const updateDataWithinBounds = () => {
    const filteredData = originalChartData.filter((point) => {
      return point.x >= xBounds[0] && point.x <= xBounds[1] && point.y >= yBounds[0] && point.y <= yBounds[1];
    });
    // Update chart data
  };

  return (
    <div>
      <button onClick={toggleViewBounds} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Toggle View Bounds
      </button>

      {showViewBounds && (
        <>
          <div style={{ position: 'absolute', left: '20%', top: '0%', borderLeft: '2px solid red', height: '62%' }}></div>
          <div style={{ position: 'absolute', left: '40%', top: '0%', borderLeft: '2px solid red', height: '62%' }}></div>
        </>
      )}
   <div ref={chartRef}></div>
   
    </div>
  );
};

export default LineGraphWithBounds;
